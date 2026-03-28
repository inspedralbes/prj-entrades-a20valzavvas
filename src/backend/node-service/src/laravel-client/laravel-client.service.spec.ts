import { describe, it, expect, vi, beforeEach } from "vitest";
import { LaravelClientService } from "./laravel-client.service";
import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
  NotImplementedException,
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
            (
              fulfilled: (v: any) => any,
              rejected: (e: any) => any,
            ) => {
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
      vi.mocked(httpService.get).mockReturnValue(throwError(() => networkError));

      await expect(service.healthCheck()).rejects.toThrow(InternalServerErrorException);
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

  describe("stub methods", () => {
    it("reserveSeat should throw NotImplementedException", async () => {
      await expect(
        service.reserveSeat("seat-1", "user-1"),
      ).rejects.toThrow(NotImplementedException);
    });

    it("releaseSeat should throw NotImplementedException", async () => {
      await expect(service.releaseSeat("seat-1")).rejects.toThrow(
        NotImplementedException,
      );
    });

    it("expireReservations should throw NotImplementedException", async () => {
      await expect(service.expireReservations()).rejects.toThrow(
        NotImplementedException,
      );
    });

    it("getStats should throw NotImplementedException", async () => {
      await expect(service.getStats("event-1")).rejects.toThrow(
        NotImplementedException,
      );
    });
  });
});
