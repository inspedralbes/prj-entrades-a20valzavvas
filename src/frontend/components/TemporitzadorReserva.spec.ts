import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, computed } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TemporitzadorReserva from "./TemporitzadorReserva.vue";

// Mock the store
vi.mock("~/stores/reserva", () => ({
  useReservaStore: vi.fn(),
}));

// Mock the composable
vi.mock("~/composables/useTemporitzador", () => ({
  useTemporitzador: vi.fn(),
}));

import { useReservaStore } from "~/stores/reserva";
import { useTemporitzador } from "~/composables/useTemporitzador";

function mockTemporitzador(secondsLeftVal: number) {
  const secondsLeft = ref(secondsLeftVal);
  const isUrgent = computed(() => secondsLeft.value > 0 && secondsLeft.value <= 60);
  vi.mocked(useTemporitzador).mockReturnValue({ secondsLeft, isUrgent });
  return secondsLeft;
}

describe("TemporitzadorReserva.vue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("no renderitza res quan no hi ha reserva activa", async () => {
    vi.mocked(useReservaStore).mockReturnValue({
      teReservaActiva: false,
    } as unknown as ReturnType<typeof useReservaStore>);
    mockTemporitzador(0);

    const wrapper = await mountSuspended(TemporitzadorReserva);

    expect(wrapper.find(".temporitzador").exists()).toBe(false);
  });

  it("renderitza 04:50 quan secondsLeft = 290", async () => {
    vi.mocked(useReservaStore).mockReturnValue({
      teReservaActiva: true,
    } as unknown as ReturnType<typeof useReservaStore>);
    mockTemporitzador(290);

    const wrapper = await mountSuspended(TemporitzadorReserva);

    expect(wrapper.find(".temps").text()).toBe("04:50");
  });

  it("renderitza 00:45 quan secondsLeft = 45", async () => {
    vi.mocked(useReservaStore).mockReturnValue({
      teReservaActiva: true,
    } as unknown as ReturnType<typeof useReservaStore>);
    mockTemporitzador(45);

    const wrapper = await mountSuspended(TemporitzadorReserva);

    expect(wrapper.find(".temps").text()).toBe("00:45");
  });

  it("aplica la classe urgencia quan isUrgent és true (secondsLeft = 60)", async () => {
    vi.mocked(useReservaStore).mockReturnValue({
      teReservaActiva: true,
    } as unknown as ReturnType<typeof useReservaStore>);
    mockTemporitzador(60);

    const wrapper = await mountSuspended(TemporitzadorReserva);

    expect(wrapper.find(".compte-enrere.urgencia").exists()).toBe(true);
  });

  it("NO aplica la classe urgencia quan secondsLeft > 60", async () => {
    vi.mocked(useReservaStore).mockReturnValue({
      teReservaActiva: true,
    } as unknown as ReturnType<typeof useReservaStore>);
    mockTemporitzador(120);

    const wrapper = await mountSuspended(TemporitzadorReserva);

    expect(wrapper.find(".compte-enrere.urgencia").exists()).toBe(false);
    expect(wrapper.find(".compte-enrere").exists()).toBe(true);
  });

  it("mostra el missatge d'expiració quan secondsLeft = 0", async () => {
    vi.mocked(useReservaStore).mockReturnValue({
      teReservaActiva: true,
    } as unknown as ReturnType<typeof useReservaStore>);
    mockTemporitzador(0);

    const wrapper = await mountSuspended(TemporitzadorReserva);

    expect(wrapper.find(".expiracio").exists()).toBe(true);
    expect(wrapper.find(".expiracio").text()).toContain("expirat");
    expect(wrapper.find(".compte-enrere").exists()).toBe(false);
  });
});
