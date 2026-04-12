import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { LaravelClientService } from "../laravel-client/laravel-client.service";

interface JwtPayload {
  sub: string;
  role: string;
}

const SANCTUM_OPAQUE_TOKEN_RE = /^\d+\|[A-Za-z0-9]+$/;

@Injectable()
export class JwtWsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly laravelClient: LaravelClientService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();

    const token =
      (client.handshake.auth as Record<string, string>)?.token ??
      (client.handshake.query?.token as string | undefined);

    if (!token) {
      throw new WsException("Unauthorized");
    }

    if (SANCTUM_OPAQUE_TOKEN_RE.test(token)) {
      return this.validateSanctumToken(client, token);
    }

    return this.validateJwt(client, token);
  }

  private async validateJwt(client: Socket, token: string): Promise<boolean> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      client.data.userId = payload.sub;
      client.data.role = payload.role;
      client.data.token = token;

      return true;
    } catch {
      throw new WsException("Unauthorized");
    }
  }

  private async validateSanctumToken(
    client: Socket,
    token: string,
  ): Promise<boolean> {
    const user = await this.laravelClient.getUserByToken(token);

    if (!user) {
      throw new WsException("Unauthorized");
    }

    client.data.userId = user.id;
    client.data.role = user.role;
    client.data.token = token;

    return true;
  }
}
