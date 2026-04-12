import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
  HttpException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosError } from "axios";
import { firstValueFrom } from "rxjs";

export interface ReserveSeatSuccess {
  reservation: { id: string; expires_at: string };
  seat: { id: string; fila: string; numero: number; estat: string };
}

export type ReserveSeatResult =
  | ({ ok: true } & ReserveSeatSuccess)
  | { ok: false; motiu: string };

@Injectable()
export class LaravelClientService implements OnModuleInit {
  constructor(private readonly httpService: HttpService) {}

  onModuleInit(): void {
    this.httpService.axiosRef.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (!error.response) {
          throw new InternalServerErrorException(
            "Laravel service is unreachable",
          );
        }

        const status = error.response.status;
        const data = error.response.data as Record<string, unknown> | undefined;
        const message =
          (data?.message as string) || error.response.statusText || "Error";

        switch (status) {
          case 400:
            throw new BadRequestException(message);
          case 404:
            throw new NotFoundException(message);
          case 409:
            throw new ConflictException(message);
          case 422:
            throw new UnprocessableEntityException(message);
          default:
            throw new InternalServerErrorException(message);
        }
      },
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      await firstValueFrom(this.httpService.get("/api/health"));
      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Laravel service is unreachable");
    }
  }

  async getUserByToken(
    token: string,
  ): Promise<{ id: string; role: string } | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ id: string; role: string }>("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async reserveSeat(
    seatId: string,
    token: string,
  ): Promise<ReserveSeatResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ReserveSeatSuccess>(
          `/api/seats/${seatId}/reserve`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );
      return { ok: true, ...response.data };
    } catch (error) {
      // NestJS exceptions thrown by the Axios interceptor (production path)
      if (error instanceof ConflictException) {
        return { ok: false, motiu: "no_disponible" };
      }
      if (error instanceof NotFoundException) {
        return { ok: false, motiu: "seient_no_trobat" };
      }
      // Raw AxiosErrors not yet processed by the interceptor (test path)
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        if (status === 409) return { ok: false, motiu: "no_disponible" };
        if (status === 404) return { ok: false, motiu: "seient_no_trobat" };
      }
      return { ok: false, motiu: "error_intern" };
    }
  }

  async releaseSeat(seatId: string): Promise<void> {
    // Will be implemented in a future US
    void seatId;
  }

  async expireReservations(): Promise<void> {
    // Will be implemented in a future US
  }

  async getStats(eventId: string): Promise<void> {
    // Will be implemented in a future US
    void eventId;
  }
}
