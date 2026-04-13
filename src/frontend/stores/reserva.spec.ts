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

  it("confirmarReserva acumula múltiples seatIds", () => {
    const store = useReservaStore();

    store.confirmarReserva({ seatId: "seat-A1", expiraEn: "2026-04-12T10:00:00.000Z" });
    store.confirmarReserva({ seatId: "seat-B2", expiraEn: "2026-04-12T10:01:00.000Z" });
    store.confirmarReserva({ seatId: "seat-C3", expiraEn: "2026-04-12T10:02:00.000Z" });

    expect(store.seatIds).toEqual(["seat-A1", "seat-B2", "seat-C3"]);
    expect(store.seatId).toBe("seat-C3");
  });

  it("confirmarReserva no duplica un seatId ja existent", () => {
    const store = useReservaStore();

    store.confirmarReserva({ seatId: "seat-A1", expiraEn: "2026-04-12T10:00:00.000Z" });
    store.confirmarReserva({ seatId: "seat-A1", expiraEn: "2026-04-12T10:00:00.000Z" });

    expect(store.seatIds).toHaveLength(1);
  });

  it("limitAssolit retorna true quan el nombre de reserves és igual al límit", () => {
    const store = useReservaStore();
    store.setMaxSeientPerUsuari(4);

    store.confirmarReserva({ seatId: "seat-A1", expiraEn: "2026-04-12T10:00:00.000Z" });
    store.confirmarReserva({ seatId: "seat-B2", expiraEn: "2026-04-12T10:01:00.000Z" });
    store.confirmarReserva({ seatId: "seat-C3", expiraEn: "2026-04-12T10:02:00.000Z" });
    store.confirmarReserva({ seatId: "seat-D4", expiraEn: "2026-04-12T10:03:00.000Z" });

    expect(store.limitAssolit).toBe(true);
  });

  it("limitAssolit retorna false quan el nombre de reserves és inferior al límit", () => {
    const store = useReservaStore();
    store.setMaxSeientPerUsuari(4);

    store.confirmarReserva({ seatId: "seat-A1", expiraEn: "2026-04-12T10:00:00.000Z" });
    store.confirmarReserva({ seatId: "seat-B2", expiraEn: "2026-04-12T10:01:00.000Z" });

    expect(store.limitAssolit).toBe(false);
  });

  it("limitAssolit retorna false quan no hi ha reserves actives", () => {
    const store = useReservaStore();
    store.setMaxSeientPerUsuari(4);

    expect(store.limitAssolit).toBe(false);
  });

  it("limitAssolit és reactiu: si s'allibera un seient, el getter s'actualitza", () => {
    const store = useReservaStore();
    store.setMaxSeientPerUsuari(2);

    store.confirmarReserva({ seatId: "seat-A1", expiraEn: "2026-04-12T10:00:00.000Z" });
    store.confirmarReserva({ seatId: "seat-B2", expiraEn: "2026-04-12T10:01:00.000Z" });

    expect(store.limitAssolit).toBe(true);

    store.alliberarSeient("seat-A1");

    expect(store.seatIds).toEqual(["seat-B2"]);
    expect(store.limitAssolit).toBe(false);
  });

  it("netejarReserva restableix seatIds i limitAssolit", () => {
    const store = useReservaStore();
    store.setMaxSeientPerUsuari(4);

    store.confirmarReserva({ seatId: "seat-A1", expiraEn: "2026-04-12T10:00:00.000Z" });
    store.confirmarReserva({ seatId: "seat-B2", expiraEn: "2026-04-12T10:01:00.000Z" });
    store.netejarReserva();

    expect(store.seatIds).toEqual([]);
    expect(store.limitAssolit).toBe(false);
  });
});
