import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { StatsActualitzacioPayload } from "@shared/socket.types";
import { useAdminStats } from "./useAdminStats";

const mockToken = "admin-token";

vi.mock("~/stores/auth", () => ({
  useAuthStore: () => ({ token: mockToken }),
}));

const mockStats: StatsActualitzacioPayload = {
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

const socketHandlers: Record<string, (payload: unknown) => void> = {};
const mockSocketOn = vi.fn();
const mockSocketEmit = vi.fn();
const mockSocketConnect = vi.fn();
const mockSocketOff = vi.fn();

const useNuxtAppMock = vi.hoisted(() => vi.fn());
mockNuxtImport("useNuxtApp", () => useNuxtAppMock);

describe("useAdminStats", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    Object.keys(socketHandlers).forEach((k) => delete socketHandlers[k]);

    mockSocketOn.mockImplementation(
      (event: string, handler: (payload: unknown) => void) => {
        socketHandlers[event] = handler;
      },
    );

    useNuxtAppMock.mockReturnValue({
      $socket: {
        connected: true,
        connect: mockSocketConnect,
        emit: mockSocketEmit,
        on: mockSocketOn,
        off: mockSocketOff,
      },
    });
  });

  it("fetchInitialStats carrega les estadístiques via $fetch", async () => {
    vi.stubGlobal("$fetch", vi.fn().mockResolvedValue(mockStats));

    const { stats, isLoading, fetchInitialStats } = useAdminStats("evt-123");

    expect(isLoading.value).toBe(false);
    await fetchInitialStats();
    expect(stats.value.disponibles).toBe(60);
    expect(isLoading.value).toBe(false);
  });

  it("stats s'actualitza en rebre stats:actualitzacio", async () => {
    vi.stubGlobal("$fetch", vi.fn().mockResolvedValue(mockStats));

    const { stats, initSocket } = useAdminStats("evt-123");
    initSocket();

    const updatedStats: StatsActualitzacioPayload = {
      ...mockStats,
      venuts: 22,
      disponibles: 58,
      recaptacioTotal: 440.0,
    };

    expect(socketHandlers["stats:actualitzacio"]).toBeDefined();
    socketHandlers["stats:actualitzacio"](updatedStats);

    expect(stats.value.venuts).toBe(22);
    expect(stats.value.disponibles).toBe(58);
    expect(stats.value.recaptacioTotal).toBe(440.0);
  });

  it("registra el listener stats:actualitzacio en muntar el component", () => {
    vi.stubGlobal("$fetch", vi.fn().mockResolvedValue(mockStats));

    const { initSocket } = useAdminStats("evt-456");
    initSocket();

    expect(mockSocketOn).toHaveBeenCalledWith(
      "stats:actualitzacio",
      expect.any(Function),
    );
  });

  it("error s'estableix si $fetch falla", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const { error, isLoading, fetchInitialStats } = useAdminStats("evt-789");

    await fetchInitialStats();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBeTruthy();
  });
});
