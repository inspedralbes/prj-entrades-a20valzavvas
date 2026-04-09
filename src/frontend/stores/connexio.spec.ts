import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useConnexioStore } from "./connexio";

function makeSocketMock() {
  const handlers: Record<string, () => void> = {};
  return {
    on: vi.fn((event: string, handler: () => void) => {
      handlers[event] = handler;
    }),
    off: vi.fn((event: string) => {
      delete handlers[event];
    }),
    emit: (event: string) => {
      handlers[event]?.();
    },
  };
}

const useNuxtAppMock = vi.hoisted(() => vi.fn());
mockNuxtImport("useNuxtApp", () => useNuxtAppMock);

describe("useConnexioStore", () => {
  let socketMock: ReturnType<typeof makeSocketMock>;

  beforeEach(() => {
    setActivePinia(createPinia());
    socketMock = makeSocketMock();
    useNuxtAppMock.mockReturnValue({
      $socket: socketMock,
    });
  });

  it("estat inicial és desconnectat", () => {
    const store = useConnexioStore();
    expect(store.estat).toBe("desconnectat");
  });

  it("estat canvia a connectat quan el socket emet connect", () => {
    const store = useConnexioStore();
    store.inicialitzar();

    socketMock.emit("connect");

    expect(store.estat).toBe("connectat");
  });

  it("estat canvia a desconnectat quan el socket emet disconnect", () => {
    const store = useConnexioStore();
    store.inicialitzar();
    socketMock.emit("connect");

    socketMock.emit("disconnect");

    expect(store.estat).toBe("desconnectat");
  });

  it("estat canvia a reconnectant quan el socket emet reconnect_attempt", () => {
    const store = useConnexioStore();
    store.inicialitzar();
    socketMock.emit("connect");

    socketMock.emit("reconnect_attempt");

    expect(store.estat).toBe("reconnectant");
  });

  it("inicialitzar cridat dues vegades no duplica els listeners", () => {
    const store = useConnexioStore();
    store.inicialitzar();
    store.inicialitzar();

    socketMock.emit("connect");

    expect(store.estat).toBe("connectat");
    expect(socketMock.off).toHaveBeenCalledTimes(6);
  });
});
