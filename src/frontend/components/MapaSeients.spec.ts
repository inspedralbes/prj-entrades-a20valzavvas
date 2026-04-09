import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { EstatSeient } from "@shared/seat.types";
import MapaSeients from "./MapaSeients.vue";

type SeatEntry = {
  id: string;
  estat: EstatSeient;
  fila: string;
  numero: number;
  categoria: string;
  preu: number;
};
const mockSeientsPerFila = vi.fn(() => new Map<string, SeatEntry[]>());

vi.mock("~/stores/seients", () => ({
  useSeientStore: vi.fn(() => ({
    seientsPerFila: mockSeientsPerFila(),
  })),
}));

describe("MapaSeients.vue", () => {
  it("renderitza el nombre correcte de seients (.seient)", async () => {
    const map = new Map([
      [
        "A",
        [
          {
            id: "s1",
            estat: EstatSeient.DISPONIBLE,
            fila: "A",
            numero: 1,
            categoria: "c1",
            preu: 10,
          },
          {
            id: "s2",
            estat: EstatSeient.DISPONIBLE,
            fila: "A",
            numero: 2,
            categoria: "c1",
            preu: 10,
          },
        ],
      ],
      [
        "B",
        [
          {
            id: "s3",
            estat: EstatSeient.RESERVAT,
            fila: "B",
            numero: 1,
            categoria: "c1",
            preu: 10,
          },
        ],
      ],
    ]);
    mockSeientsPerFila.mockReturnValue(map);

    const wrapper = await mountSuspended(MapaSeients);
    const seients = wrapper.findAll(".seient");
    expect(seients).toHaveLength(3);
  });

  it("renderitza una fila per cada fila del store", async () => {
    const map = new Map([
      [
        "A",
        [
          {
            id: "s1",
            estat: EstatSeient.DISPONIBLE,
            fila: "A",
            numero: 1,
            categoria: "c1",
            preu: 10,
          },
        ],
      ],
      [
        "C",
        [
          {
            id: "s2",
            estat: EstatSeient.DISPONIBLE,
            fila: "C",
            numero: 1,
            categoria: "c1",
            preu: 10,
          },
        ],
      ],
    ]);
    mockSeientsPerFila.mockReturnValue(map);

    const wrapper = await mountSuspended(MapaSeients);
    const files = wrapper.findAll(".mapa-fila");
    expect(files).toHaveLength(2);
  });

  it("no renderitza seients quan el store és buit", async () => {
    mockSeientsPerFila.mockReturnValue(new Map());

    const wrapper = await mountSuspended(MapaSeients);
    const seients = wrapper.findAll(".seient");
    expect(seients).toHaveLength(0);
  });
});
