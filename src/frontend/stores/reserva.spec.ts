import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useReservaStore } from "./reserva";

describe("useReservaStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("l'estat inicial és buit", () => {
    const store = useReservaStore();
    expect(store.seatId).toBeNull();
    expect(store.expiraEn).toBeNull();
    expect(store.teReservaActiva).toBe(false);
  });

  it("confirmarReserva actualitza seatId i expiraEn", () => {
    const store = useReservaStore();

    store.confirmarReserva({
      seatId: "seat-B5",
      expiraEn: "2026-04-12T10:05:00.000Z",
    });

    expect(store.seatId).toBe("seat-B5");
    expect(store.expiraEn).toBe("2026-04-12T10:05:00.000Z");
    expect(store.teReservaActiva).toBe(true);
  });

  it("netejarReserva restableix l'estat a null", () => {
    const store = useReservaStore();

    store.confirmarReserva({
      seatId: "seat-B5",
      expiraEn: "2026-04-12T10:05:00.000Z",
    });

    store.netejarReserva();

    expect(store.seatId).toBeNull();
    expect(store.expiraEn).toBeNull();
    expect(store.teReservaActiva).toBe(false);
  });

  it("confirmarReserva sobreescriu una reserva anterior", () => {
    const store = useReservaStore();

    store.confirmarReserva({
      seatId: "seat-A1",
      expiraEn: "2026-04-12T10:00:00.000Z",
    });

    store.confirmarReserva({
      seatId: "seat-C3",
      expiraEn: "2026-04-12T10:10:00.000Z",
    });

    expect(store.seatId).toBe("seat-C3");
    expect(store.expiraEn).toBe("2026-04-12T10:10:00.000Z");
  });
});
