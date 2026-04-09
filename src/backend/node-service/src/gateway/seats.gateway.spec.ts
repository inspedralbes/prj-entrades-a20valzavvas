import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeatsGateway } from "./seats.gateway";
import type { SeientCanviEstatPayload } from "shared/types/socket.types";
import { EstatSeient } from "shared/types/seat.types";

function makeSocketMock() {
  return { join: vi.fn(), data: { userId: "user-1", role: "comprador" } };
}

function makeServerMock() {
  const emit = vi.fn();
  const to = vi.fn().mockReturnValue({ emit });
  return { server: { to }, emit, to };
}

describe("SeatsGateway", () => {
  let gateway: SeatsGateway;

  beforeEach(() => {
    gateway = new SeatsGateway();
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
});
