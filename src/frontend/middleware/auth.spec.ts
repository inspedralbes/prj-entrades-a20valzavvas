import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { setActivePinia, createPinia } from "pinia";

const navigateToMock = vi.hoisted(() => vi.fn());

mockNuxtImport("navigateTo", () => navigateToMock);

vi.mock("~/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

describe("middleware/auth", () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    navigateToMock.mockReset();
    vi.resetModules();
  });

  it("redirigeix a /auth/login si no autenticat", async () => {
    const { useAuthStore } = await import("~/stores/auth");
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
    } as ReturnType<typeof useAuthStore>);

    const defineMiddleware = (fn: Function) => fn;
    vi.stubGlobal("defineNuxtRouteMiddleware", defineMiddleware);

    const mod = await import("./auth");
    const middleware = mod.default as Function;
    await middleware({} as any, {} as any);

    expect(navigateToMock).toHaveBeenCalledWith("/auth/login");
  });

  it("redirigeix a /auth/login des de /entrades si no autenticat", async () => {
    const { useAuthStore } = await import("~/stores/auth");
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
    } as ReturnType<typeof useAuthStore>);

    const defineMiddleware = (fn: Function) => fn;
    vi.stubGlobal("defineNuxtRouteMiddleware", defineMiddleware);

    const mod = await import("./auth");
    const middleware = mod.default as Function;
    await middleware({ path: "/entrades" } as any, {} as any);

    expect(navigateToMock).toHaveBeenCalledWith("/auth/login");
  });

  it("no redirigeix si l'usuari és autenticat", async () => {
    const { useAuthStore } = await import("~/stores/auth");
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
    } as ReturnType<typeof useAuthStore>);

    const defineMiddleware = (fn: Function) => fn;
    vi.stubGlobal("defineNuxtRouteMiddleware", defineMiddleware);

    const mod = await import("./auth");
    const middleware = mod.default as Function;
    await middleware({} as any, {} as any);

    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
