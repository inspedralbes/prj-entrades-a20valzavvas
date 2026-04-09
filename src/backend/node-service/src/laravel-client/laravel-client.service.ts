import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
  NotImplementedException,
  HttpException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosError } from "axios";
import { firstValueFrom } from "rxjs";

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

  async reserveSeat(seatId: string, userId: string): Promise<any> {
    throw new NotImplementedException(
      "reserveSeat will be implemented in US-03-02",
    );
  }

  async releaseSeat(seatId: string): Promise<void> {
    throw new NotImplementedException(
      "releaseSeat will be implemented in US-03-02",
    );
  }

  async expireReservations(): Promise<any> {
    throw new NotImplementedException(
      "expireReservations will be implemented in US-04-01",
    );
  }

  async getStats(eventId: string): Promise<any> {
    throw new NotImplementedException(
      "getStats will be implemented in US-04-01",
    );
  }
}
