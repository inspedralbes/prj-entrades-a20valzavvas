import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSeientStore } from "./seients";
import { EstatSeient } from "@shared/seat.types";

const mockConfirmarReserva = vi.fn();
vi.mock("~/stores/reserva", () => ({
  useReservaStore: vi.fn(() => ({
    confirmarReserva: mockConfirmarReserva,
  })),
}));

const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const useNuxtAppMock = vi.hoisted(() => vi.fn());
mockNuxtImport("useNuxtApp", () => useNuxtAppMock);

function makeSocketMock() {
  const handlers: Record<string, (payload: unknown) => void> = {};
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, handler: (payload: unknown) => void) => {
      handlers[event] = handler;
    }),
    off: vi.fn(),
    triggerEvent: (event: string, payload: unknown) =>
      handlers[event]?.(payload),
  };
}

const mockApiResponse = {
  event: {
    id: "evt-1",
    nom: "Dune 4K",
    slug: "dune-4k-dolby-2026",
    data: "2026-06-01 20:00:00",
    recinte: "Sala Onirica",
  },
  categories: [{ id: "cat-1", name: "General", price: 12.5 }],
  files: {
    A: [
      {
        id: "seat-1",
        estat: "DISPONIBLE",
        fila: "A",
        numero: 1,
        id_categoria: "cat-1",
        preu: 12.5,
      },
      {
        id: "seat-2",
        estat: "RESERVAT",
        fila: "A",
        numero: 2,
        id_categoria: "cat-1",
        preu: 12.5,
      },
    ],
    B: [
      {
        id: "seat-3",
        estat: "VENUT",
        fila: "B",
        numero: 1,
        id_categoria: "cat-1",
        preu: 12.5,
      },
    ],
  },
};

describe("useSeientStore", () => {
  let socketMock: ReturnType<typeof makeSocketMock>;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
    socketMock = makeSocketMock();
    useNuxtAppMock.mockReturnValue({
      $socket: socketMock,
    });
  });

  describe("inicialitzar", () => {
    it("popula el Map de seients amb les dades de l'API", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();

      await store.inicialitzar("dune-4k-dolby-2026");

      expect(store.llistat.size).toBe(3);
      expect(store.llistat.get("seat-1")).toEqual({
        estat: EstatSeient.DISPONIBLE,
        fila: "A",
        numero: 1,
        categoria: "cat-1",
        preu: 12.5,
      });
      expect(store.llistat.get("seat-2")?.estat).toBe(EstatSeient.RESERVAT);
      expect(store.llistat.get("seat-3")?.estat).toBe(EstatSeient.VENUT);
    });

    it("desa les dades de l'event i categories", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();

      await store.inicialitzar("dune-4k-dolby-2026");

      expect(store.event?.nom).toBe("Dune 4K");
      expect(store.categories).toHaveLength(1);
    });

    it("isLoading és true durant la petició i false en finalitzar", async () => {
      let resolvePromise!: (value: unknown) => void;
      mockFetch.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
      );
      const store = useSeientStore();

      const promise = store.inicialitzar("dune-4k-dolby-2026");
      expect(store.isLoading).toBe(true);

      resolvePromise(mockApiResponse);
      await promise;
      expect(store.isLoading).toBe(false);
    });

    it("error s'estableix quan $fetch llança error 404", async () => {
      mockFetch.mockRejectedValueOnce(new Error("404"));
      const store = useSeientStore();

      await store.inicialitzar("no-existeix");

      expect(store.error).toBe("Event no trobat");
      expect(store.isLoading).toBe(false);
      expect(store.llistat.size).toBe(0);
    });

    it("error és null quan la petició té èxit", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();

      await store.inicialitzar("dune-4k-dolby-2026");

      expect(store.error).toBeNull();
    });
  });

  describe("seientsPerFila (getter)", () => {
    it("agrupa els seients per fila", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");

      const porFila = store.seientsPerFila;
      expect(porFila.has("A")).toBe(true);
      expect(porFila.has("B")).toBe(true);
      expect(porFila.get("A")).toHaveLength(2);
      expect(porFila.get("B")).toHaveLength(1);
    });

    it("inclou l'id en cada seient del getter", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");

      const seatA = store.seientsPerFila.get("A")?.[0];
      expect(seatA?.id).toBe("seat-1");
    });
  });

  describe("actualitzarEstat", () => {
    it("actualitza l'estat d'un seient existent", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");

      store.actualitzarEstat("seat-1", EstatSeient.RESERVAT);

      expect(store.llistat.get("seat-1")?.estat).toBe(EstatSeient.RESERVAT);
    });

    it("no fa res si el seatId no existeix al Map", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");

      expect(() =>
        store.actualitzarEstat("seat-inexistent", EstatSeient.VENUT),
      ).not.toThrow();
      expect(store.llistat.size).toBe(3);
    });

    it("no modifica els altres camps del seient", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");

      store.actualitzarEstat("seat-1", EstatSeient.RESERVAT);

      expect(store.llistat.get("seat-1")).toMatchObject({
        estat: EstatSeient.RESERVAT,
        fila: "A",
        numero: 1,
        categoria: "cat-1",
        preu: 12.5,
      });
    });
  });

  describe("connectar", () => {
    it("crida socket.connect() i socket.emit('event:unir') amb l'eventId correcte", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");

      store.connectar();

      expect(socketMock.connect).toHaveBeenCalledOnce();
      expect(socketMock.emit).toHaveBeenCalledWith("event:unir", {
        eventId: "evt-1",
      });
    });

    it("subscriu el listener seient:canvi-estat", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");

      store.connectar();

      expect(socketMock.on).toHaveBeenCalledWith(
        "seient:canvi-estat",
        expect.any(Function),
      );
    });

    it("actualitzarEstat és cridat automàticament quan el socket emet seient:canvi-estat", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");
      store.connectar();

      socketMock.triggerEvent("seient:canvi-estat", {
        seatId: "seat-1",
        estat: EstatSeient.RESERVAT,
        fila: "A",
        numero: 1,
      });

      expect(store.llistat.get("seat-1")?.estat).toBe(EstatSeient.RESERVAT);
    });

    it("subscriu el listener reserva:confirmada i crida confirmarReserva del store", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");
      store.connectar();

      const payload = { seatId: "seat-1", expiraEn: "2026-04-12T10:05:00Z" };
      socketMock.triggerEvent("reserva:confirmada", payload);

      expect(mockConfirmarReserva).toHaveBeenCalledWith(payload);
    });

    it("subscriu el listener reserva:rebutjada sense llançar errors", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");
      store.connectar();

      expect(() =>
        socketMock.triggerEvent("reserva:rebutjada", {
          seatId: "seat-1",
          motiu: "no_disponible",
        }),
      ).not.toThrow();
    });
  }); // end describe("connectar")

  describe("desconnectar", () => {
    it("crida socket.off per als tres events i socket.disconnect()", async () => {
      mockFetch.mockResolvedValueOnce(mockApiResponse);
      const store = useSeientStore();
      await store.inicialitzar("dune-4k-dolby-2026");
      store.connectar();

      store.desconnectar();

      expect(socketMock.off).toHaveBeenCalledWith("seient:canvi-estat");
      expect(socketMock.off).toHaveBeenCalledWith("reserva:confirmada");
      expect(socketMock.off).toHaveBeenCalledWith("reserva:rebutjada");
      expect(socketMock.disconnect).toHaveBeenCalledOnce();
    });
  });
});
