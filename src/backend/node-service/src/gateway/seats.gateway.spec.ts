import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeatsGateway } from "./seats.gateway";
import type {
  SeientCanviEstatPayload,
  StatsActualitzacioPayload,
} from "shared/types/socket.types";
import { EstatSeient } from "shared/types/seat.types";
import type { LaravelClientService } from "../laravel-client/laravel-client.service";

const MOCK_STATS: StatsActualitzacioPayload = {
  disponibles: 80,
  reservats: 10,
  venuts: 10,
  totalSeients: 100,
  percentatgeVenuts: 10,
  percentatgeReservats: 10,
  usuaris: 0,
  reservesActives: 2,
  recaptacioTotal: 200,
};

function makeSocketMock(rooms: string[] = []) {
  return {
    join: vi.fn(),
    emit: vi.fn(),
    rooms: new Set(["socket-id", ...rooms]),
    data: { userId: "user-1", role: "comprador", token: "tok-abc" },
  };
}

function makeServerMock() {
  const emit = vi.fn();
  const to = vi.fn().mockReturnValue({ emit });
  const fetchSockets = vi.fn().mockResolvedValue([]);
  const inFn = vi.fn().mockReturnValue({ fetchSockets });
  return { server: { to, in: inFn }, emit, to, inFn, fetchSockets };
}

function makeLaravelClientMock(): LaravelClientService {
  return {
    reserveSeat: vi.fn(),
    releaseSeat: vi.fn(),
    getStats: vi.fn().mockResolvedValue({ ...MOCK_STATS }),
  } as unknown as LaravelClientService;
}

describe("SeatsGateway", () => {
  let gateway: SeatsGateway;
  let laravelClient: LaravelClientService;

  beforeEach(() => {
    laravelClient = makeLaravelClientMock();
    gateway = new SeatsGateway(laravelClient);
  });

  describe("handleUnirEvent", () => {
    it("afegeix el client al room event:{eventId}", () => {
      const socket = makeSocketMock();
      const { server } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;

      gateway.handleUnirEvent(socket as never, { eventId: "evt-abc" });

      expect(socket.join).toHaveBeenCalledOnce();
      expect(socket.join).toHaveBeenCalledWith("event:evt-abc");
    });

    it("el room inclou el prefix correcte per a qualsevol eventId", () => {
      const socket = makeSocketMock();
      const { server } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;

      gateway.handleUnirEvent(socket as never, { eventId: "uuid-123-xyz" });

      expect(socket.join).toHaveBeenCalledWith("event:uuid-123-xyz");
    });
  });

  describe("emitCanviEstat", () => {
    it("emet seient:canvi-estat al room de l'event", () => {
      const { server, to, emit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;

      const payload: SeientCanviEstatPayload = {
        seatId: "seat-1",
        estat: EstatSeient.RESERVAT,
        fila: "A",
        numero: 5,
      };

      gateway.emitCanviEstat("evt-123", payload);

      expect(to).toHaveBeenCalledWith("event:evt-123");
      expect(emit).toHaveBeenCalledWith("seient:canvi-estat", payload);
    });

    it("no emet a rooms d'altres events", () => {
      const { server, to } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;

      const payload: SeientCanviEstatPayload = {
        seatId: "seat-2",
        estat: EstatSeient.VENUT,
        fila: "B",
        numero: 3,
      };

      gateway.emitCanviEstat("evt-abc", payload);

      expect(to).toHaveBeenCalledWith("event:evt-abc");
      expect(to).not.toHaveBeenCalledWith("event:evt-xyz");
    });
  });

  describe("emitStatsActualitzacio", () => {
    it("emet stats:actualitzacio al room de l'event", () => {
      const { server, to, emit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;

      gateway.emitStatsActualitzacio("evt-123", MOCK_STATS);

      expect(to).toHaveBeenCalledWith("event:evt-123");
      expect(emit).toHaveBeenCalledWith("stats:actualitzacio", MOCK_STATS);
    });

    it("no emet a rooms d'altres events", () => {
      const { server, to } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;

      gateway.emitStatsActualitzacio("evt-abc", MOCK_STATS);

      expect(to).toHaveBeenCalledWith("event:evt-abc");
      expect(to).not.toHaveBeenCalledWith("event:evt-xyz");
    });

    it("el payload conté tots els camps obligatoris", () => {
      const { server, to, emit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;

      gateway.emitStatsActualitzacio("evt-123", MOCK_STATS);

      expect(emit).toHaveBeenCalledWith(
        "stats:actualitzacio",
        expect.objectContaining({
          disponibles: expect.any(Number),
          reservats: expect.any(Number),
          venuts: expect.any(Number),
          totalSeients: expect.any(Number),
          recaptacioTotal: expect.any(Number),
        }),
      );
    });
  });

  describe("handleSeientReservar", () => {
    it("emet reserva:confirmada i seient:canvi-estat quan la reserva prospera", async () => {
      const { server, to, emit: roomEmit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      vi.mocked(laravelClient.reserveSeat).mockResolvedValue({
        ok: true,
        reservation: { id: "res-1", expires_at: "2026-04-12T10:05:00.000Z" },
        seat: { id: "seat-B5", fila: "B", numero: 5, estat: "RESERVAT" },
      });

      await gateway.handleSeientReservar(socket as never, {
        seatId: "seat-B5",
      });

      expect(laravelClient.reserveSeat).toHaveBeenCalledWith(
        "seat-B5",
        "tok-abc",
      );

      expect(socket.emit).toHaveBeenCalledWith("reserva:confirmada", {
        seatId: "seat-B5",
        expiraEn: "2026-04-12T10:05:00.000Z",
      });

      expect(to).toHaveBeenCalledWith("event:evt-1");
      expect(roomEmit).toHaveBeenCalledWith("seient:canvi-estat", {
        seatId: "seat-B5",
        estat: EstatSeient.RESERVAT,
        fila: "B",
        numero: 5,
      });
    });

    it("emet stats:actualitzacio després de la reserva confirmada", async () => {
      const { server, to, emit: roomEmit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      vi.mocked(laravelClient.reserveSeat).mockResolvedValue({
        ok: true,
        reservation: { id: "res-1", expires_at: "2026-04-12T10:05:00.000Z" },
        seat: { id: "seat-B5", fila: "B", numero: 5, estat: "RESERVAT" },
      });

      await gateway.handleSeientReservar(socket as never, { seatId: "seat-B5" });

      expect(laravelClient.getStats).toHaveBeenCalledWith("evt-1");
      expect(roomEmit).toHaveBeenCalledWith(
        "stats:actualitzacio",
        expect.objectContaining({ disponibles: expect.any(Number) }),
      );
    });

    it("emet reserva:rebutjada sense broadcast quan el seient no és disponible", async () => {
      const { server, to } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      vi.mocked(laravelClient.reserveSeat).mockResolvedValue({
        ok: false,
        motiu: "no_disponible",
      });

      await gateway.handleSeientReservar(socket as never, {
        seatId: "seat-B5",
      });

      expect(socket.emit).toHaveBeenCalledWith("reserva:rebutjada", {
        seatId: "seat-B5",
        motiu: "no_disponible",
      });
      expect(to).not.toHaveBeenCalled();
    });

    it("no fa broadcast si el socket no és en cap event room", async () => {
      const { server, to } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(); // no event room

      vi.mocked(laravelClient.reserveSeat).mockResolvedValue({
        ok: true,
        reservation: { id: "res-1", expires_at: "2026-04-12T10:05:00.000Z" },
        seat: { id: "seat-C3", fila: "C", numero: 3, estat: "RESERVAT" },
      });

      await gateway.handleSeientReservar(socket as never, {
        seatId: "seat-C3",
      });

      expect(socket.emit).toHaveBeenCalledWith(
        "reserva:confirmada",
        expect.any(Object),
      );
      expect(to).not.toHaveBeenCalled();
    });
  });

  describe("handleSeientAlliberar", () => {
    it("emet seient:canvi-estat DISPONIBLE a la room quan l'alliberament és correcte", async () => {
      const { server, to, emit: roomEmit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      vi.mocked(laravelClient.releaseSeat).mockResolvedValue({ ok: true });

      await gateway.handleSeientAlliberar(socket as never, {
        seatId: "seat-C3",
      });

      expect(laravelClient.releaseSeat).toHaveBeenCalledWith(
        "seat-C3",
        "user-1",
        "tok-abc",
      );
      expect(to).toHaveBeenCalledWith("event:evt-1");
      expect(roomEmit).toHaveBeenCalledWith(
        "seient:canvi-estat",
        expect.objectContaining({
          seatId: "seat-C3",
          estat: EstatSeient.DISPONIBLE,
        }),
      );
      expect(socket.emit).not.toHaveBeenCalledWith(
        "error:general",
        expect.any(Object),
      );
    });

    it("emet stats:actualitzacio després de l'alliberament correcte", async () => {
      const { server, to: _to, emit: roomEmit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      vi.mocked(laravelClient.releaseSeat).mockResolvedValue({ ok: true });

      await gateway.handleSeientAlliberar(socket as never, { seatId: "seat-C3" });

      expect(laravelClient.getStats).toHaveBeenCalledWith("evt-1");
      expect(roomEmit).toHaveBeenCalledWith(
        "stats:actualitzacio",
        expect.objectContaining({ disponibles: expect.any(Number) }),
      );
    });

    it("emet error:general al socket quan la reserva pertany a un altre usuari (no_autoritzat)", async () => {
      const { server, to } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      vi.mocked(laravelClient.releaseSeat).mockResolvedValue({
        ok: false,
        motiu: "no_autoritzat",
      });

      await gateway.handleSeientAlliberar(socket as never, {
        seatId: "seat-C3",
      });

      expect(socket.emit).toHaveBeenCalledWith(
        "error:general",
        expect.objectContaining({ codi: "no_autoritzat" }),
      );
      expect(to).not.toHaveBeenCalled();
    });

    it("emet error:general al socket quan la reserva no existeix (reserva_no_trobada)", async () => {
      const { server, to } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      vi.mocked(laravelClient.releaseSeat).mockResolvedValue({
        ok: false,
        motiu: "reserva_no_trobada",
      });

      await gateway.handleSeientAlliberar(socket as never, {
        seatId: "seat-D7",
      });

      expect(socket.emit).toHaveBeenCalledWith(
        "error:general",
        expect.objectContaining({ codi: "reserva_no_trobada" }),
      );
      expect(to).not.toHaveBeenCalled();
    });

    it("no fa broadcast si el socket no és en cap event room", async () => {
      const { server, to } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(); // no event room

      vi.mocked(laravelClient.releaseSeat).mockResolvedValue({ ok: true });

      await gateway.handleSeientAlliberar(socket as never, {
        seatId: "seat-C3",
      });

      expect(to).not.toHaveBeenCalled();
    });
  });

  describe("handleCompraConfirmar", () => {
    it("fa broadcast seient:canvi-estat VENUT per a cada seient i emet compra:completada al client", async () => {
      const { server, to, emit: roomEmit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      await gateway.handleCompraConfirmar(socket as never, {
        orderId: "order-abc",
        eventId: "evt-1",
        seients: [
          { seatId: "seat-B5", fila: "B", numero: 5 },
          { seatId: "seat-B6", fila: "B", numero: 6 },
        ],
      });

      expect(to).toHaveBeenCalledWith("event:evt-1");
      expect(roomEmit).toHaveBeenCalledWith("seient:canvi-estat", {
        seatId: "seat-B5",
        estat: EstatSeient.VENUT,
        fila: "B",
        numero: 5,
      });
      expect(roomEmit).toHaveBeenCalledWith("seient:canvi-estat", {
        seatId: "seat-B6",
        estat: EstatSeient.VENUT,
        fila: "B",
        numero: 6,
      });

      expect(socket.emit).toHaveBeenCalledWith("compra:completada", {
        orderId: "order-abc",
        seients: ["B5", "B6"],
      });
    });

    it("emet stats:actualitzacio després de confirmar la compra", async () => {
      const { server, to: _to, emit: roomEmit } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      await gateway.handleCompraConfirmar(socket as never, {
        orderId: "order-abc",
        eventId: "evt-1",
        seients: [{ seatId: "seat-B5", fila: "B", numero: 5 }],
      });

      expect(laravelClient.getStats).toHaveBeenCalledWith("evt-1");
      expect(roomEmit).toHaveBeenCalledWith(
        "stats:actualitzacio",
        expect.objectContaining({ venuts: expect.any(Number) }),
      );
    });

    it("no fa cap broadcast si la llista de seients és buida", async () => {
      const { server, to } = makeServerMock();
      (gateway as unknown as { server: typeof server }).server = server;
      const socket = makeSocketMock(["event:evt-1"]);

      await gateway.handleCompraConfirmar(socket as never, {
        orderId: "order-abc",
        eventId: "evt-1",
        seients: [],
      });

      expect(to).not.toHaveBeenCalled();
      expect(socket.emit).not.toHaveBeenCalled();
    });
  });
});
