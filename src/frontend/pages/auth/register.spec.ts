import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useAuthStore } from "~/stores/auth";
import RegisterPage from "./register.vue";

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport("navigateTo", () => navigateToMock);

vi.mock("~/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

describe("pages/auth/register", () => {
  let mockRegister: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateToMock.mockReset();
    mockRegister = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      register: mockRegister,
    } as any);
  });

  // 4.2 submit amb dades vàlides → authStore.register() cridat + redirecció a /
  it("submit amb dades vàlides crida authStore.register() i redirigeix a /", async () => {
    const wrapper = await mountSuspended(RegisterPage);

    await wrapper.find("#name").setValue("Joan Doe");
    await wrapper.find("#email").setValue("joan@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("#password_confirmation").setValue("password123");
    await wrapper.find("form").trigger("submit");

    expect(mockRegister).toHaveBeenCalledWith({
      name: "Joan Doe",
      email: "joan@example.com",
      password: "password123",
      password_confirmation: "password123",
    });
    expect(navigateToMock).toHaveBeenCalledWith("/");
  });

  // 4.3 password !== password_confirmation → error al camp password_confirmation, authStore.register() NO cridat
  it("mostra error a password_confirmation si les contrasenyes no coincideixen i no crida register()", async () => {
    const wrapper = await mountSuspended(RegisterPage);

    await wrapper.find("#name").setValue("Joan Doe");
    await wrapper.find("#email").setValue("joan@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("#password_confirmation").setValue("different456");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    const errorSpan = wrapper.find(".field-error");
    expect(errorSpan.exists()).toBe(true);
    expect(errorSpan.text()).toBe("Les contrasenyes no coincideixen");
    expect(mockRegister).not.toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  // 4.4 error 422 amb errors.email (email ja existent) → missatge visible al camp email
  it("mostra error per camp quan el registre falla amb errors del servidor", async () => {
    mockRegister.mockRejectedValueOnce({
      data: { errors: { email: ["The email has already been taken."] } },
    });

    const wrapper = await mountSuspended(RegisterPage);

    await wrapper.find("#name").setValue("Joan Doe");
    await wrapper.find("#email").setValue("existing@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("#password_confirmation").setValue("password123");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    const errorSpan = wrapper.find(".field-error");
    expect(errorSpan.exists()).toBe(true);
    expect(errorSpan.text()).toBe("The email has already been taken.");
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  // 4.5 botó disabled quan isLoading === true
  it("botó de submit està disabled mentre isLoading és true", async () => {
    let resolveRegister!: (value: void) => void;
    mockRegister.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveRegister = resolve;
      }),
    );

    const wrapper = await mountSuspended(RegisterPage);

    await wrapper.find("#name").setValue("Joan Doe");
    await wrapper.find("#email").setValue("joan@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("#password_confirmation").setValue("password123");
    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    const button = wrapper.find<HTMLButtonElement>("button[type='submit']");
    expect(button.element.disabled).toBe(true);

    resolveRegister();
  });

  // 4.6 usuari autenticat → redirecció a / sense cridar authStore.register()
  it("redirigeix a / si l'usuari ja és autenticat sense cridar register()", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      register: mockRegister,
    } as any);

    await mountSuspended(RegisterPage);

    expect(navigateToMock).toHaveBeenCalledWith("/");
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // 5.6 centrat vertical aplicat dins de <main> — .auth-page usa flex:1 i min-height:100%
  // (no min-height:100dvh que solapava amb la navbar global)
  it("renderitza .auth-page sense min-height 100dvh per centrar dins del <main>", async () => {
    const wrapper = await mountSuspended(RegisterPage);
    // Verifica que el contenidor .auth-page existeix (el CSS usa flex:1 + min-height:100%)
    expect(wrapper.find(".auth-page").exists()).toBe(true);
    // Verifica que el contingut HTML renderitzat no inclou 100dvh
    const html = wrapper.html();
    expect(html).not.toContain("100dvh");
  });
});
