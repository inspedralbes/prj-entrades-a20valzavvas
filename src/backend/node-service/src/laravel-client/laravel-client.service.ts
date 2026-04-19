import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  ForbiddenException,
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

export type ReleaseSeatResult = { ok: true } | { ok: false; motiu: string };

export type ReserveSeatResult =
  | ({ ok: true } & ReserveSeatSuccess)
  | { ok: false; motiu: string };

export interface ReleasedSeat {
  seatId: string;
  eventId: string;
}

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
          case 403:
            throw new ForbiddenException(message);
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

  async reserveSeat(seatId: string, token: string): Promise<ReserveSeatResult> {
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
      if (error instanceof UnprocessableEntityException) {
        return { ok: false, motiu: "limit_assolit" };
      }
      // Raw AxiosErrors not yet processed by the interceptor (test path)
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        if (status === 409) return { ok: false, motiu: "no_disponible" };
        if (status === 404) return { ok: false, motiu: "seient_no_trobat" };
        if (status === 422) return { ok: false, motiu: "limit_assolit" };
      }
      return { ok: false, motiu: "error_intern" };
    }
  }

  async releaseSeat(
    seatId: string,
    userId: string,
    token: string,
  ): Promise<ReleaseSeatResult> {
    void userId; // userId is conveyed by the Bearer token; parameter kept for call-site clarity
    try {
      await firstValueFrom(
        this.httpService.delete(`/api/seats/${seatId}/reserve`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return { ok: true };
    } catch (error) {
      // NestJS exceptions thrown by the Axios interceptor (production path)
      if (error instanceof ForbiddenException) {
        return { ok: false, motiu: "no_autoritzat" };
      }
      if (error instanceof NotFoundException) {
        return { ok: false, motiu: "reserva_no_trobada" };
      }
      // Raw AxiosErrors not yet processed by the interceptor (test path)
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        if (status === 403) return { ok: false, motiu: "no_autoritzat" };
        if (status === 404) return { ok: false, motiu: "reserva_no_trobada" };
      }
      return { ok: false, motiu: "error_intern" };
    }
  }

  async releaseExpiredReservations(): Promise<{ released: ReleasedSeat[] }> {
    const response = await firstValueFrom(
      this.httpService.delete<{ released: ReleasedSeat[] }>(
        "/internal/reservations/expired",
        {
          headers: {
            "X-Internal-Secret": process.env.INTERNAL_SECRET ?? "",
          },
        },
      ),
    );
    return { released: response.data.released };
  }

  async getStats(
    eventId: string,
  ): Promise<import("shared/types/socket.types").StatsActualitzacioPayload> {
    const response = await firstValueFrom(
      this.httpService.get<
        import("shared/types/socket.types").StatsActualitzacioPayload
      >(`/internal/events/${eventId}/stats`, {
        headers: {
          "X-Internal-Secret": process.env.INTERNAL_SECRET ?? "",
        },
      }),
    );
    return response.data;
  }
}
