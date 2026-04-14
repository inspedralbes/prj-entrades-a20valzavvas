import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReservationsScheduler } from "./reservations.scheduler";
import { LaravelClientService } from "../laravel-client/laravel-client.service";
import { SeatsGateway } from "../gateway/seats.gateway";
import { Logger } from "@nestjs/common";
import { EstatSeient } from "shared/types/seat.types";

function createMockLaravelClient() {
  return {
    releaseExpiredReservations: vi.fn(),
  } as unknown as LaravelClientService;
}

function createMockSeatsGateway() {
  const emitMock = vi.fn();
  const toMock = vi.fn().mockReturnValue({ emit: emitMock });
  return {
    gateway: {
      server: { to: toMock },
    } as unknown as SeatsGateway,
    toMock,
    emitMock,
  };
}

describe("ReservationsScheduler", () => {
  let scheduler: ReservationsScheduler;
  let laravelClient: LaravelClientService;
  let seatsGateway: SeatsGateway;
  let toMock: ReturnType<typeof vi.fn>;
  let emitMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mock = createMockSeatsGateway();
    seatsGateway = mock.gateway;
    toMock = mock.toMock;
    emitMock = mock.emitMock;
    laravelClient = createMockLaravelClient();
    scheduler = new ReservationsScheduler(laravelClient, seatsGateway);

    // Suppress logger output in tests
    vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});
  });

  it("emits seient:canvi-estat for each released seat", async () => {
    vi.mocked(laravelClient.releaseExpiredReservations).mockResolvedValue({
      released: [{ seatId: "seat-A1", eventId: "event-E1" }],
    });

    await scheduler.releaseExpired();

    expect(toMock).toHaveBeenCalledWith("event:event-E1");
    expect(emitMock).toHaveBeenCalledWith("seient:canvi-estat", {
      seatId: "seat-A1",
      estat: EstatSeient.DISPONIBLE,
    });
    expect(emitMock).toHaveBeenCalledTimes(1);
  });

  it("emits one broadcast per released seat across different events", async () => {
    vi.mocked(laravelClient.releaseExpiredReservations).mockResolvedValue({
      released: [
        { seatId: "seat-B2", eventId: "event-E1" },
        { seatId: "seat-C3", eventId: "event-E2" },
      ],
    });

    await scheduler.releaseExpired();

    expect(toMock).toHaveBeenCalledWith("event:event-E1");
    expect(toMock).toHaveBeenCalledWith("event:event-E2");
    expect(emitMock).toHaveBeenCalledTimes(2);
  });

  it("does not call emit when no expired reservations", async () => {
    vi.mocked(laravelClient.releaseExpiredReservations).mockResolvedValue({
      released: [],
    });

    await scheduler.releaseExpired();

    expect(emitMock).not.toHaveBeenCalled();
    expect(toMock).not.toHaveBeenCalled();
  });

  it("logs error and does not rethrow when LaravelClientService throws", async () => {
    vi.mocked(laravelClient.releaseExpiredReservations).mockRejectedValue(
      new Error("Laravel unreachable"),
    );
    const loggerErrorSpy = vi
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => {});

    await expect(scheduler.releaseExpired()).resolves.toBeUndefined();

    expect(loggerErrorSpy).toHaveBeenCalled();
    expect(emitMock).not.toHaveBeenCalled();
  });
});
