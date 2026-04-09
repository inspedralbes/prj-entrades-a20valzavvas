import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import SlugPage from "./[slug].vue";

mockNuxtImport("useRoute", () =>
  vi.fn().mockReturnValue({ params: { slug: "dune-4k-dolby-2026" } }),
);

const mockInicialitzar = vi.fn().mockResolvedValue(undefined);
const mockConnectar = vi.fn();
const mockDesconnectar = vi.fn();
const mockSeientStore = {
  inicialitzar: mockInicialitzar,
  connectar: mockConnectar,
  desconnectar: mockDesconnectar,
  event: {
    id: "evt-1",
    nom: "Dune 4K",
    data: "2026-06-01",
    recinte: "Sala Onirica",
  },
  isLoading: false,
  error: null,
  seientsPerFila: new Map(),
};

const mockInicialitzarConnexio = vi.fn();
const mockConnexioStore = { inicialitzar: mockInicialitzarConnexio };

vi.mock("~/stores/seients", () => ({
  useSeientStore: vi.fn(),
}));

vi.mock("~/stores/connexio", () => ({
  useConnexioStore: vi.fn(),
}));

import { useSeientStore } from "~/stores/seients";
import { useConnexioStore } from "~/stores/connexio";

describe("pages/events/[slug]", () => {
  beforeEach(() => {
    mockInicialitzar.mockReset().mockResolvedValue(undefined);
    mockConnectar.mockReset();
    mockDesconnectar.mockReset();
    mockInicialitzarConnexio.mockReset();
    vi.mocked(useSeientStore).mockReturnValue(
      mockSeientStore as unknown as ReturnType<typeof useSeientStore>,
    );
    vi.mocked(useConnexioStore).mockReturnValue(
      mockConnexioStore as unknown as ReturnType<typeof useConnexioStore>,
    );
  });

  it("inicialitza la store connexio en muntar la pàgina", async () => {
    await mountSuspended(SlugPage);

    expect(mockInicialitzarConnexio).toHaveBeenCalledOnce();
  });

  it("crida seients.inicialitzar amb el slug en muntar la pàgina", async () => {
    await mountSuspended(SlugPage);

    expect(mockInicialitzar).toHaveBeenCalledOnce();
    expect(mockInicialitzar).toHaveBeenCalledWith("dune-4k-dolby-2026");
  });

  it("crida seients.connectar quan l'event existeix després d'inicialitzar", async () => {
    await mountSuspended(SlugPage);

    expect(mockConnectar).toHaveBeenCalledOnce();
    expect(mockConnectar).toHaveBeenCalledWith();
  });

  it("no crida seients.connectar si l'event és null (event no trobat)", async () => {
    vi.mocked(useSeientStore).mockReturnValue({
      ...mockSeientStore,
      event: null,
    } as unknown as ReturnType<typeof useSeientStore>);

    await mountSuspended(SlugPage);

    expect(mockConnectar).not.toHaveBeenCalled();
  });

  it("crida seients.desconnectar en desmuntar la pàgina", async () => {
    const wrapper = await mountSuspended(SlugPage);

    wrapper.unmount();

    expect(mockDesconnectar).toHaveBeenCalledOnce();
  });
});
