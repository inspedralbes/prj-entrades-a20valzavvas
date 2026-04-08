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

  // 2.2 submit amb credencials vàlides → authStore.login() cridat + redirecció a /entrades (rol comprador)
  it("submit amb credencials vàlides crida authStore.login() i redirigeix a /entrades", async () => {
    const wrapper = await mountSuspended(LoginPage);

    await wrapper.find("#email").setValue("user@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit");

    expect(mockLogin).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(navigateToMock).toHaveBeenCalledWith("/entrades");
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

  // 2.6 usuari autenticat → redirecció a /entrades (comprador) sense cridar authStore.login()
  it("redirigeix a /entrades si l'usuari ja és autenticat (comprador) sense cridar login()", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { role: "comprador" },
      login: mockLogin,
    } as any);

    await mountSuspended(LoginPage);

    expect(navigateToMock).toHaveBeenCalledWith("/entrades");
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
