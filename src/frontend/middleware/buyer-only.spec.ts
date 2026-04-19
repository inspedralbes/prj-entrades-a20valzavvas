import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { setActivePinia, createPinia } from "pinia";
import type { useAuthStore as UseAuthStoreType } from "~/stores/auth";

const navigateToMock = vi.hoisted(() => vi.fn());

mockNuxtImport("navigateTo", () => navigateToMock);

vi.mock("~/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

async function runMiddleware(role: string | null) {
  const { useAuthStore } = await import("~/stores/auth");
  vi.mocked(useAuthStore).mockReturnValue({
    isAuthenticated: true,
    user: role ? { id: "1", name: "Test", email: "t@t.com", role } : null,
  } as ReturnType<typeof UseAuthStoreType>);

  const defineMiddleware = (fn: Function) => fn;
  vi.stubGlobal("defineNuxtRouteMiddleware", defineMiddleware);

  const mod = await import("./buyer-only");
  const middleware = mod.default as Function;
  return middleware({} as any, {} as any);
}

describe("middleware/buyer-only", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    navigateToMock.mockReset();
    vi.resetModules();
  });

  it("redirigeix a /admin si l'usuari té rol admin", async () => {
    await runMiddleware("admin");
    expect(navigateToMock).toHaveBeenCalledWith("/admin");
  });

  it("no redirigeix si l'usuari té rol comprador", async () => {
    await runMiddleware("comprador");
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it("no redirigeix si user és null", async () => {
    await runMiddleware(null);
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
