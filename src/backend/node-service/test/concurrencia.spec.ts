import "reflect-metadata";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import type { INestApplication, ExecutionContext, CanActivate } from "@nestjs/common";
import type { Socket as ServerSocket } from "socket.io";
import { io, type Socket } from "socket.io-client";
import { SeatsGateway } from "../src/gateway/seats.gateway";
import { JwtWsGuard } from "../src/auth/jwt-ws.guard";
import { LaravelClientService } from "../src/laravel-client/laravel-client.service";
import type { ReserveSeatResult } from "../src/laravel-client/laravel-client.service";
import type { StatsActualitzacioPayload } from "shared/types/socket.types";

const TEST_TOKEN_1 = "1|ConcurrencyTestTokenUser1";
const TEST_TOKEN_2 = "2|ConcurrencyTestTokenUser2";

const TEST_SEAT_ID = "seat-concurrent-test";
const TEST_EVENT_ID = "event-concurrent-test";

const STUB_STATS: StatsActualitzacioPayload = {
  disponibles: 9,
  reservats: 1,
  venuts: 0,
  totalSeients: 10,
  percentatgeVenuts: 0,
  percentatgeReservats: 10,
  usuaris: 2,
  reservesActives: 1,
  recaptacioTotal: 0,
};

// Simulates atomic seat reservation using Node.js's single-threaded guarantee.
// The Set acts as the in-process equivalent of SELECT FOR UPDATE: only the first
// concurrent call succeeds; subsequent calls for the same seatId are rejected.
class StubLaravelClient implements Partial<LaravelClientService> {
  private readonly reserved = new Set<string>();

  async getUserByToken(): Promise<{ id: string; role: string } | null> {
    return { id: "stub-user", role: "comprador" };
  }

  async reserveSeat(seatId: string): Promise<ReserveSeatResult> {
    if (this.reserved.has(seatId)) {
      return { ok: false, motiu: "no_disponible" };
    }
    this.reserved.add(seatId);
    return {
      ok: true,
      reservation: {
        id: "res-stub",
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      seat: { id: seatId, fila: "A", numero: 1, estat: "RESERVAT" },
    };
  }

  async releaseSeat(): Promise<{ ok: true }> {
    return { ok: true };
  }

  async getStats(): Promise<StatsActualitzacioPayload> {
    return { ...STUB_STATS };
  }

  async releaseExpiredReservations(): Promise<{ released: [] }> {
    return { released: [] };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  reservationCount(seatId: string): number {
    return this.reserved.has(seatId) ? 1 : 0;
  }

  reset(seatId: string): void {
    this.reserved.delete(seatId);
  }
}

// Stub guard that always passes and sets socket.data from the handshake token.
// Used instead of the real JwtWsGuard to avoid dependency on JWT_SECRET and
// LaravelClientService HTTP calls in the test environment.
const stubWsGuard: CanActivate = {
  canActivate(ctx: ExecutionContext): boolean {
    const client = ctx.switchToWs().getClient<ServerSocket>();
    const token =
      (client.handshake.auth as Record<string, string>)?.token ?? "test-token";
    (client.data as Record<string, string>) = {
      userId: "stub-user",
      role: "comprador",
      token,
    };
    return true;
  },
};

const laravelStub = new StubLaravelClient();

// Minimal NestJS module — no HttpModule or real credentials needed.
// JwtModule is kept so SeatsGateway's transitive imports resolve; secret can
// be any non-empty string since JWT validation is bypassed by stubWsGuard.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ secret: "test-secret" }),
  ],
  providers: [
    SeatsGateway,
    { provide: JwtWsGuard, useValue: stubWsGuard },
    { provide: LaravelClientService, useValue: laravelStub },
  ],
})
class ConcurrencyTestModule {}

describe("Concurrència: dos clients Socket.IO no poden reservar el mateix seient", () => {
  let app: INestApplication;
  let port: number;
  let client1: Socket;
  let client2: Socket;

  beforeAll(async () => {
    app = await NestFactory.create(ConcurrencyTestModule, { logger: false });
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(0);

    const address = app.getHttpServer().address() as { port: number };
    port = address.port;

    await new Promise<void>((resolve, reject) => {
      let connected = 0;
      const onConnect = () => {
        if (++connected === 2) resolve();
      };
      const onError = (err: Error) => reject(err);

      client1 = io(`http://localhost:${port}`, {
        auth: { token: TEST_TOKEN_1 },
        transports: ["websocket"],
      });
      client2 = io(`http://localhost:${port}`, {
        auth: { token: TEST_TOKEN_2 },
        transports: ["websocket"],
      });

      client1.on("connect", () => { console.log("[TEST] client1 connected"); onConnect(); });
      client1.on("connect_error", (e) => { console.error("[TEST] client1 connect_error:", e.message); onError(e); });
      client2.on("connect", () => { console.log("[TEST] client2 connected"); onConnect(); });
      client2.on("connect_error", (e) => { console.error("[TEST] client2 connect_error:", e.message); onError(e); });
    });

    client1.on("exception", (d) => console.error("[TEST] client1 exception:", JSON.stringify(d)));
    client2.on("exception", (d) => console.error("[TEST] client2 exception:", JSON.stringify(d)));

    // Unir clients al room de l'event i esperar que el servidor els registri.
    // event:unir és void al servidor (sense ack), per tant cal un petit yield.
    client1.emit("event:unir", { eventId: TEST_EVENT_ID });
    client2.emit("event:unir", { eventId: TEST_EVENT_ID });
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("[TEST] beforeAll complete, port=", port);
  }, 20_000);

  afterAll(async () => {
    laravelStub.reset(TEST_SEAT_ID);
    client1?.disconnect();
    client2?.disconnect();
    await app?.close();
  });

  it("exactament un client rep reserva:confirmada i l'altre reserva:rebutjada", async () => {
    const makeListener = (client: Socket): Promise<string> =>
      new Promise<string>((resolve) => {
        client.once("reserva:confirmada", () => resolve("confirmada"));
        client.once("reserva:rebutjada", () => resolve("rebutjada"));
      });

    // Listeners set up BEFORE emitting to avoid race conditions on reception
    const [r1Promise, r2Promise] = [
      makeListener(client1),
      makeListener(client2),
    ];

    // Dispatch both emits in the same tick, then await both responses
    await Promise.all([
      Promise.resolve(client1.emit("seient:reservar", { seatId: TEST_SEAT_ID })),
      Promise.resolve(client2.emit("seient:reservar", { seatId: TEST_SEAT_ID })),
    ]);

    const [r1, r2] = await Promise.all([r1Promise, r2Promise]);

    const responses = [r1, r2];
    expect(responses).toContain("confirmada");
    expect(responses).toContain("rebutjada");
    expect(responses.filter((r) => r === "confirmada")).toHaveLength(1);
    expect(responses.filter((r) => r === "rebutjada")).toHaveLength(1);

    // Verify exactly one reservation exists for the seat (equivalent to
    // SELECT COUNT(*) FROM Reservation WHERE seatId = ? AND expiresAt > NOW())
    expect(laravelStub.reservationCount(TEST_SEAT_ID)).toBe(1);
  }, 10_000);
});
