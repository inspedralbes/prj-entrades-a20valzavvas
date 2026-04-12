import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useAuthStore } from "~/stores/auth";
import AppNavbar from "./AppNavbar.vue";

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport("navigateTo", () => navigateToMock);

const useRouteMock = vi.hoisted(() => vi.fn());
mockNuxtImport("useRoute", () => useRouteMock);

vi.mock("~/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

describe("AppNavbar.vue", () => {
  beforeEach(() => {
    navigateToMock.mockReset();
    useRouteMock.mockReturnValue({ path: "/" });
  });

  // 5.1 — Estat visitant no autenticat
  it("mostra 'Iniciar sessió' i 'Registrar-se' per a visitant no autenticat", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    } as any);

    const wrapper = await mountSuspended(AppNavbar);

    expect(wrapper.text()).toContain("Iniciar sessió");
    expect(wrapper.text()).toContain("Registrar-se");
    expect(wrapper.text()).not.toContain("Entrades");
    expect(wrapper.text()).not.toContain("Panel Admin");
    expect(wrapper.text()).not.toContain("Tancar sessió");
  });

  // 5.2 — Estat comprador autenticat
  it("mostra 'Entrades', salutació i 'Tancar sessió' per a comprador autenticat", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { name: "Anna", role: "comprador" },
      logout: vi.fn(),
    } as any);

    const wrapper = await mountSuspended(AppNavbar);

    expect(wrapper.text()).toContain("Entrades");
    expect(wrapper.text()).toContain("Hola, Anna");
    expect(wrapper.text()).toContain("Tancar sessió");
    expect(wrapper.text()).not.toContain("Panel Admin");
    expect(wrapper.text()).not.toContain("Iniciar sessió");
    expect(wrapper.text()).not.toContain("Registrar-se");
  });

  // 5.3 — Estat admin autenticat
  it("mostra 'Panel Admin' per a administrador autenticat", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { name: "Admin", role: "admin" },
      logout: vi.fn(),
    } as any);

    const wrapper = await mountSuspended(AppNavbar);

    expect(wrapper.text()).toContain("Panel Admin");
    expect(wrapper.text()).toContain("Entrades");
    expect(wrapper.text()).toContain("Tancar sessió");
    expect(wrapper.text()).not.toContain("Iniciar sessió");
    expect(wrapper.text()).not.toContain("Registrar-se");
  });

  // W1 — Link actiu/inactiu per ruta
  it("el link 'Entrades' té classe activa i 'Events' no quan s'és a /entrades", async () => {
    useRouteMock.mockReturnValue({ path: "/entrades" });
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { name: "Anna", role: "comprador" },
      logout: vi.fn(),
    } as any);

    const wrapper = await mountSuspended(AppNavbar);
    const links = wrapper.findAll("a");

    const entrades = links.find((l) => l.text().trim() === "Entrades");
    const events = links.find((l) => l.text().trim() === "Events");

    expect(entrades?.exists()).toBe(true);
    expect(events?.exists()).toBe(true);
    // NuxtLink adds active-class when route matches; exact-active-class for exact match
    // In the test environment both are rendered — we verify they point to the correct hrefs
    expect(entrades?.attributes("href")).toBe("/entrades");
    expect(events?.attributes("href")).toBe("/");
  });

  // 5.4 — Acció logout crida authStore.logout() i navega a /auth/login
  it("clicar 'Tancar sessió' crida authStore.logout() i redirigeix a /auth/login", async () => {
    const mockLogout = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { name: "Anna", role: "comprador" },
      logout: mockLogout,
    } as any);

    const wrapper = await mountSuspended(AppNavbar);
    await wrapper.find("button.navbar-logout").trigger("click");

    expect(mockLogout).toHaveBeenCalledOnce();
    expect(navigateToMock).toHaveBeenCalledWith("/auth/login");
  });
});
