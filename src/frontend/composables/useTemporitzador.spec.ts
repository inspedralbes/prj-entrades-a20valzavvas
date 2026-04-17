import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia, getActivePinia } from "pinia";
import { useReservaStore } from "~/stores/reserva";
import { useSeientStore } from "~/stores/seients";
import { EstatSeient } from "@shared/seat.types";
import { useTemporitzador } from "./useTemporitzador";

// Helper to mount a composable that uses lifecycle hooks
function withSetup<T>(composable: () => T): { result: T; unmount: () => void } {
  let result!: T;
  const component = defineComponent({
    setup() {
      result = composable();
      return {};
    },
    template: "<div/>",
  });
  const wrapper = mount(component, {
    global: { plugins: [getActivePinia()!] },
  });
  return { result, unmount: () => wrapper.unmount() };
}

describe("useTemporitzador", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("secondsLeft és 0 quan no hi ha expiraEn a la store", () => {
    const { result } = withSetup(() => useTemporitzador());

    expect(result.secondsLeft.value).toBe(0);
    expect(result.isUrgent.value).toBe(false);
  });

  it("secondsLeft calcula correctament els segons restants a partir d'expiraEn", () => {
    const store = useReservaStore();
    const expiraEn = new Date(Date.now() + 300_000).toISOString();
    store.confirmarReserva({ seatId: "seat-A1", expiraEn });

    const { result } = withSetup(() => useTemporitzador());

    expect(result.secondsLeft.value).toBe(300);
  });

  it("secondsLeft decrementa cada segon (10 s → 290)", () => {
    const store = useReservaStore();
    const expiraEn = new Date(Date.now() + 300_000).toISOString();
    store.confirmarReserva({ seatId: "seat-A1", expiraEn });

    const { result } = withSetup(() => useTemporitzador());

    expect(result.secondsLeft.value).toBe(300);

    vi.advanceTimersByTime(10_000);

    expect(result.secondsLeft.value).toBe(290);
  });

  it("isUrgent és false quan secondsLeft > 60", () => {
    const store = useReservaStore();
    const expiraEn = new Date(Date.now() + 120_000).toISOString();
    store.confirmarReserva({ seatId: "seat-A1", expiraEn });

    const { result } = withSetup(() => useTemporitzador());

    expect(result.isUrgent.value).toBe(false);
  });

  it("isUrgent canvia a true quan secondsLeft passa a 60", () => {
    const store = useReservaStore();
    const expiraEn = new Date(Date.now() + 61_000).toISOString();
    store.confirmarReserva({ seatId: "seat-A1", expiraEn });

    const { result } = withSetup(() => useTemporitzador());

    expect(result.isUrgent.value).toBe(false);

    vi.advanceTimersByTime(1_000);

    expect(result.secondsLeft.value).toBe(60);
    expect(result.isUrgent.value).toBe(true);
  });

  it("netejarReserva es crida exactament 1 vegada quan secondsLeft arriba a 0", () => {
    const store = useReservaStore();
    const expiraEn = new Date(Date.now() + 1_000).toISOString();
    store.confirmarReserva({ seatId: "seat-A1", expiraEn });

    const spy = vi.spyOn(store, "netejarReserva");

    withSetup(() => useTemporitzador());

    vi.advanceTimersByTime(1_000);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("actualitzarEstat es crida a DISPONIBLE per a cada seient quan el timer expira", () => {
    const reservaStore = useReservaStore();
    const seientStore = useSeientStore();

    const expiraEn = new Date(Date.now() + 1_000).toISOString();
    reservaStore.confirmarReserva({ seatId: "seat-A1", expiraEn });
    reservaStore.confirmarReserva({ seatId: "seat-A2", expiraEn });

    seientStore.llistat.set("seat-A1", {
      estat: EstatSeient.RESERVAT,
      fila: "A",
      numero: 1,
      categoria: "cat-1",
      preu: 10,
    });
    seientStore.llistat.set("seat-A2", {
      estat: EstatSeient.RESERVAT,
      fila: "A",
      numero: 2,
      categoria: "cat-1",
      preu: 10,
    });

    withSetup(() => useTemporitzador());

    vi.advanceTimersByTime(1_000);

    expect(seientStore.llistat.get("seat-A1")?.estat).toBe(
      EstatSeient.DISPONIBLE,
    );
    expect(seientStore.llistat.get("seat-A2")?.estat).toBe(
      EstatSeient.DISPONIBLE,
    );
  });

  it("l'interval és netejat en desmontar (no ticks addicionals)", () => {
    const store = useReservaStore();
    const expiraEn = new Date(Date.now() + 300_000).toISOString();
    store.confirmarReserva({ seatId: "seat-A1", expiraEn });

    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { result, unmount } = withSetup(() => useTemporitzador());

    const valueAtUnmount = result.secondsLeft.value;
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    // After unmount, advancing time should NOT update secondsLeft
    vi.advanceTimersByTime(5_000);
    expect(result.secondsLeft.value).toBe(valueAtUnmount);
  });

  it("isUrgent és false quan secondsLeft === 0", () => {
    const store = useReservaStore();
    const expiraEn = new Date(Date.now() + 1_000).toISOString();
    store.confirmarReserva({ seatId: "seat-A1", expiraEn });

    const { result } = withSetup(() => useTemporitzador());

    vi.advanceTimersByTime(1_000);

    expect(result.secondsLeft.value).toBe(0);
    expect(result.isUrgent.value).toBe(false);
  });
});
