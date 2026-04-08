import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtWsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();

    const token =
      (client.handshake.auth as Record<string, string>)?.token ??
      (client.handshake.query?.token as string | undefined);

    if (!token) {
      throw new WsException("Unauthorized");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      return true;
    } catch {
      throw new WsException("Unauthorized");
    }
  }
}
