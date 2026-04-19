import { describe, it, expect } from "vitest";
import { EstatSeient } from "./seat.types";
import type {
  SeientCanviEstatPayload,
  StatsActualitzacioPayload,
  ReservaConfirmadaPayload,
  ReservaRebutjadaPayload,
  CompraCompletadaPayload,
  ErrorGeneralPayload,
  SeientReservarPayload,
} from "./socket.types";

describe("SeientCanviEstatPayload", () => {
  it("accepts a valid payload", () => {
    const payload: SeientCanviEstatPayload = {
      seatId: "uuid-seat-a1",
      estat: EstatSeient.RESERVAT,
      fila: "A",
      numero: 1,
    };

    expect(payload.seatId).toBe("uuid-seat-a1");
    expect(payload.estat).toBe(EstatSeient.RESERVAT);
    expect(payload.fila).toBe("A");
    expect(payload.numero).toBe(1);
  });
});

describe("ReservaConfirmadaPayload", () => {
  it("accepts a valid payload", () => {
    const payload: ReservaConfirmadaPayload = {
      seatId: "uuid-seat-a1",
      expiraEn: "2026-06-15T21:05:00.000Z",
    };

    expect(payload.seatId).toBeDefined();
    expect(payload.expiraEn).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("ReservaRebutjadaPayload", () => {
  it("accepts a valid payload", () => {
    const payload: ReservaRebutjadaPayload = {
      seatId: "uuid-seat-a1",
      motiu: "El seient ja estava reservat per un altre usuari",
    };

    expect(payload.seatId).toBeDefined();
    expect(payload.motiu).toContain("reservat");
  });
});

describe("CompraCompletadaPayload", () => {
  it("contains order id and seat labels", () => {
    const payload: CompraCompletadaPayload = {
      orderId: "ord-001",
      seients: ["A1", "A2"],
    };

    expect(payload.orderId).toBe("ord-001");
    expect(payload.seients).toHaveLength(2);
  });
});

describe("ErrorGeneralPayload", () => {
  it("contains error code and message", () => {
    const payload: ErrorGeneralPayload = {
      codi: "SEIENT_NO_DISPONIBLE",
      missatge: "El seient seleccionat no està disponible",
    };

    expect(payload.codi).toBe("SEIENT_NO_DISPONIBLE");
    expect(payload.missatge).toBeTruthy();
  });
});

describe("StatsActualitzacioPayload", () => {
  it("contains all required stats fields", () => {
    const payload: StatsActualitzacioPayload = {
      disponibles: 60,
      reservats: 20,
      venuts: 20,
      totalSeients: 100,
      percentatgeVenuts: 20,
      percentatgeReservats: 20,
      usuaris: 5,
      reservesActives: 3,
      recaptacioTotal: 400.0,
    };

    expect(payload.disponibles).toBe(60);
    expect(payload.reservats).toBe(20);
    expect(payload.venuts).toBe(20);
    expect(payload.totalSeients).toBe(100);
    expect(payload.percentatgeVenuts).toBe(20);
    expect(payload.percentatgeReservats).toBe(20);
    expect(payload.usuaris).toBeGreaterThanOrEqual(0);
    expect(payload.reservesActives).toBeGreaterThanOrEqual(0);
    expect(payload.recaptacioTotal).toBeGreaterThanOrEqual(0);
  });
});

describe("SeientReservarPayload (client → server)", () => {
  it("accepts a valid client payload", () => {
    // Auth is handled at WS connection handshake — no sessionToken per message
    const payload: SeientReservarPayload = {
      seatId: "uuid-seat-a1",
    };

    expect(payload.seatId).toBeDefined();
  });
});
