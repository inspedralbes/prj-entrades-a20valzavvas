import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSeientStore } from "./seients";
import { EstatSeient } from "@shared/seat.types";

const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

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
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
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
  });
});
