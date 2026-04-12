import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useAuthStore } from "~/stores/auth";
import LoginPage from "./login.vue";

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport("navigateTo", () => navigateToMock);

const useRouteMock = vi.hoisted(() => vi.fn());
mockNuxtImport("useRoute", () => useRouteMock);

vi.mock("~/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

describe("pages/auth/login", () => {
  let mockLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateToMock.mockReset();
    mockLogin = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: { role: "comprador" },
      login: mockLogin,
    } as any);

    useRouteMock.mockReturnValue({ query: {} });
  });

  // 2.2 submit amb credencials vàlides → authStore.login() cridat + redirecció a / (rol comprador)
  it("submit amb credencials vàlides crida authStore.login() i redirigeix a /", async () => {
    const wrapper = await mountSuspended(LoginPage);

    await wrapper.find("#email").setValue("user@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit");

    expect(mockLogin).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(navigateToMock).toHaveBeenCalledWith("/");
  });

  // 2.3 submit amb ?redirect=/checkout → redirecció a /checkout en èxit
  it("redirigeix a route.query.redirect en èxit si existeix", async () => {
    useRouteMock.mockReturnValue({ query: { redirect: "/checkout" } });

    const wrapper = await mountSuspended(LoginPage);

    await wrapper.find("#email").setValue("user@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit");

    expect(navigateToMock).toHaveBeenCalledWith("/checkout");
  });

  // 2.4 error 422 amb errors.email → missatge visible al camp email
  it("mostra error per camp quan el login falla amb errors de validació", async () => {
    mockLogin.mockRejectedValueOnce({
      data: { errors: { email: ["The email field is required."] } },
    });

    const wrapper = await mountSuspended(LoginPage);

    await wrapper.find("#email").setValue("bad@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    const errorSpan = wrapper.find(".field-error");
    expect(errorSpan.exists()).toBe(true);
    expect(errorSpan.text()).toBe("The email field is required.");
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  // 2.5 botó disabled quan isLoading === true
  it("botó de submit està disabled mentre isLoading és true", async () => {
    let resolveLogin!: (value: void) => void;
    mockLogin.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );

    const wrapper = await mountSuspended(LoginPage);

    await wrapper.find("#email").setValue("user@example.com");
    await wrapper.find("#password").setValue("password123");
    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    const button = wrapper.find<HTMLButtonElement>("button[type='submit']");
    expect(button.element.disabled).toBe(true);

    resolveLogin();
  });

  // 2.6 usuari autenticat → redirecció a / (comprador) sense cridar authStore.login()
  it("redirigeix a / si l'usuari ja és autenticat (comprador) sense cridar login()", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { role: "comprador" },
      login: mockLogin,
    } as any);

    await mountSuspended(LoginPage);

    expect(navigateToMock).toHaveBeenCalledWith("/");
    expect(mockLogin).not.toHaveBeenCalled();
  });

  // homeForRole() — admin → /admin/events, comprador → /
  it("homeForRole retorna /admin/events per al rol admin", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: { role: "admin" },
      login: mockLogin,
    } as any);

    const wrapper = await mountSuspended(LoginPage);

    await wrapper.find("#email").setValue("admin@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit");

    expect(navigateToMock).toHaveBeenCalledWith("/admin/events");
  });

  it("homeForRole retorna / per al rol comprador", async () => {
    const wrapper = await mountSuspended(LoginPage);

    await wrapper.find("#email").setValue("user@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit");

    expect(navigateToMock).toHaveBeenCalledWith("/");
  });

  // Cross-links de navegació
  it("mostra link NuxtLink cap a /auth/register", async () => {
    const wrapper = await mountSuspended(LoginPage);
    const links = wrapper.findAllComponents({ name: "NuxtLink" });
    const registerLink = links.find(
      (l) => l.props("to") === "/auth/register",
    );
    expect(registerLink).toBeDefined();
  });

  it("mostra link NuxtLink cap a / (tornar a la portada)", async () => {
    const wrapper = await mountSuspended(LoginPage);
    const links = wrapper.findAllComponents({ name: "NuxtLink" });
    const homeLink = links.find((l) => l.props("to") === "/");
    expect(homeLink).toBeDefined();
  });

  // 5.5 centrat vertical aplicat dins de <main> — .auth-page usa flex:1 i min-height:100%
  // (no min-height:100dvh que solapava amb la navbar global)
  it("renderitza .auth-page sense min-height 100dvh per centrar dins del <main>", async () => {
    const wrapper = await mountSuspended(LoginPage);
    // Verifica que el contenidor .auth-page existeix (el CSS usa flex:1 + min-height:100%)
    expect(wrapper.find(".auth-page").exists()).toBe(true);
    // Verifica que el contingut de l'estil scoped no inclou 100dvh
    const html = wrapper.html();
    expect(html).not.toContain("100dvh");
  });
});
