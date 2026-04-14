import { describe, it, expect, vi, beforeEach } from "vitest";
import { LaravelClientService } from "./laravel-client.service";
import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from "@nestjs/common";
import { of, throwError } from "rxjs";
import { AxiosResponse, AxiosError, AxiosHeaders } from "axios";

function createMockHttpService() {
  const interceptors: Array<{
    fulfilled: (v: any) => any;
    rejected: (e: any) => any;
  }> = [];

  const httpService = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    axiosRef: {
      interceptors: {
        response: {
          use: vi.fn(
            (fulfilled: (v: any) => any, rejected: (e: any) => any) => {
              interceptors.push({ fulfilled, rejected });
            },
          ),
        },
      },
    },
  } as unknown as HttpService;

  return { httpService, interceptors };
}

function makeAxiosError(status: number, message = "Error"): AxiosError {
  const error = new AxiosError();
  error.response = {
    status,
    statusText: "Error",
    data: { message },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe("LaravelClientService", () => {
  let service: LaravelClientService;
  let httpService: HttpService;
  let interceptors: Array<{
    fulfilled: (v: any) => any;
    rejected: (e: any) => any;
  }>;

  beforeEach(() => {
    const mock = createMockHttpService();
    httpService = mock.httpService;
    interceptors = mock.interceptors;
    service = new LaravelClientService(httpService);
    service.onModuleInit();
  });

  it("should be instantiable", () => {
    expect(service).toBeDefined();
  });

  describe("healthCheck", () => {
    it("should return true when Laravel responds with 200", async () => {
      const response: AxiosResponse = {
        data: { status: "ok" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      vi.mocked(httpService.get).mockReturnValue(of(response));

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(httpService.get).toHaveBeenCalledWith("/api/health");
    });

    it("should throw InternalServerErrorException when Laravel is unreachable", async () => {
      const networkError = new AxiosError("ECONNREFUSED");
      vi.mocked(httpService.get).mockReturnValue(
        throwError(() => networkError),
      );

      await expect(service.healthCheck()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("error mapping", () => {
    it("should map 400 to BadRequestException", () => {
      const errorInterceptor = interceptors[0].rejected;
      const error = makeAxiosError(400, "Invalid input");

      expect(() => errorInterceptor(error)).toThrow(BadRequestException);
    });

    it("should map 404 to NotFoundException", () => {
      const errorInterceptor = interceptors[0].rejected;
      const error = makeAxiosError(404, "Not found");

      expect(() => errorInterceptor(error)).toThrow(NotFoundException);
    });

    it("should map 409 to ConflictException", () => {
      const errorInterceptor = interceptors[0].rejected;
      const error = makeAxiosError(409, "Seat already reserved");

      expect(() => errorInterceptor(error)).toThrow(ConflictException);
    });

    it("should map 422 to UnprocessableEntityException", () => {
      const errorInterceptor = interceptors[0].rejected;
      const error = makeAxiosError(422, "Validation failed");

      expect(() => errorInterceptor(error)).toThrow(
        UnprocessableEntityException,
      );
    });

    it("should map 500 to InternalServerErrorException", () => {
      const errorInterceptor = interceptors[0].rejected;
      const error = makeAxiosError(500, "Server error");

      expect(() => errorInterceptor(error)).toThrow(
        InternalServerErrorException,
      );
    });

    it("should throw InternalServerErrorException when no response (network error)", () => {
      const errorInterceptor = interceptors[0].rejected;
      const error = new AxiosError("Network Error");

      expect(() => errorInterceptor(error)).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("reserveSeat", () => {
    it("retorna ok:true amb les dades de la reserva quan Laravel respon 200", async () => {
      const responseData = {
        reservation: { id: "res-1", expires_at: "2026-04-12T10:05:00.000Z" },
        seat: { id: "seat-B5", fila: "B", numero: 5, estat: "RESERVAT" },
      };
      const response: AxiosResponse = {
        data: responseData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      vi.mocked(httpService.post).mockReturnValue(of(response));

      const result = await service.reserveSeat("seat-B5", "tok-abc");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.reservation.id).toBe("res-1");
        expect(result.seat.fila).toBe("B");
      }
      expect(httpService.post).toHaveBeenCalledWith(
        "/api/seats/seat-B5/reserve",
        {},
        { headers: { Authorization: "Bearer tok-abc" } },
      );
    });

    it("retorna ok:false motiu:no_disponible quan Laravel respon 409", async () => {
      vi.mocked(httpService.post).mockReturnValue(
        throwError(() => makeAxiosError(409, "Seat already reserved")),
      );
      service.onModuleInit();

      const result = await service.reserveSeat("seat-B5", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("no_disponible");
      }
    });

    it("retorna ok:false motiu:seient_no_trobat quan Laravel respon 404", async () => {
      vi.mocked(httpService.post).mockReturnValue(
        throwError(() => makeAxiosError(404, "Seat not found")),
      );
      service.onModuleInit();

      const result = await service.reserveSeat("seat-X", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("seient_no_trobat");
      }
    });

    it("retorna ok:false motiu:error_intern quan hi ha un error inesperat", async () => {
      vi.mocked(httpService.post).mockReturnValue(
        throwError(() => makeAxiosError(500, "Server error")),
      );
      service.onModuleInit();

      const result = await service.reserveSeat("seat-B5", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("error_intern");
      }
    });

    it("retorna ok:false motiu:limit_assolit quan Laravel respon 422 (raw AxiosError)", async () => {
      vi.mocked(httpService.post).mockReturnValue(
        throwError(() => makeAxiosError(422, "Limit reached")),
      );
      service.onModuleInit();

      const result = await service.reserveSeat("seat-B5", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("limit_assolit");
      }
    });

    it("retorna ok:false motiu:limit_assolit quan el interceptor llança UnprocessableEntityException", async () => {
      vi.mocked(httpService.post).mockReturnValue(
        throwError(() => new UnprocessableEntityException("Limit reached")),
      );

      const result = await service.reserveSeat("seat-B5", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("limit_assolit");
      }
    });
  });

  describe("releaseSeat", () => {
    it("retorna ok:true quan Laravel respon 204", async () => {
      const response: AxiosResponse = {
        data: null,
        status: 204,
        statusText: "No Content",
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      vi.mocked(httpService.delete).mockReturnValue(of(response));

      const result = await service.releaseSeat("seat-C3", "user-1", "tok-abc");

      expect(result.ok).toBe(true);
      expect(httpService.delete).toHaveBeenCalledWith(
        "/api/seats/seat-C3/reserve",
        { headers: { Authorization: "Bearer tok-abc" } },
      );
    });

    it("retorna ok:false motiu:no_autoritzat quan Laravel respon 403 (raw AxiosError)", async () => {
      vi.mocked(httpService.delete).mockReturnValue(
        throwError(() => makeAxiosError(403, "Forbidden")),
      );
      service.onModuleInit();

      const result = await service.releaseSeat("seat-C3", "user-2", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("no_autoritzat");
      }
    });

    it("retorna ok:false motiu:no_autoritzat quan el interceptor llança ForbiddenException", async () => {
      vi.mocked(httpService.delete).mockReturnValue(
        throwError(() => new ForbiddenException("Forbidden")),
      );

      const result = await service.releaseSeat("seat-C3", "user-2", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("no_autoritzat");
      }
    });

    it("retorna ok:false motiu:reserva_no_trobada quan Laravel respon 404 (raw AxiosError)", async () => {
      vi.mocked(httpService.delete).mockReturnValue(
        throwError(() => makeAxiosError(404, "Not found")),
      );
      service.onModuleInit();

      const result = await service.releaseSeat("seat-C3", "user-1", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("reserva_no_trobada");
      }
    });

    it("retorna ok:false motiu:reserva_no_trobada quan el interceptor llança NotFoundException", async () => {
      vi.mocked(httpService.delete).mockReturnValue(
        throwError(() => new NotFoundException("Not found")),
      );

      const result = await service.releaseSeat("seat-C3", "user-1", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("reserva_no_trobada");
      }
    });

    it("retorna ok:false motiu:error_intern per altres errors", async () => {
      vi.mocked(httpService.delete).mockReturnValue(
        throwError(() => makeAxiosError(500, "Server error")),
      );
      service.onModuleInit();

      const result = await service.releaseSeat("seat-C3", "user-1", "tok-abc");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motiu).toBe("error_intern");
      }
    });
  });
});
