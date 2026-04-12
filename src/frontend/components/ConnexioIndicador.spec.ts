import { describe, it, expect, vi } from "vitest";
import { reactive, nextTick } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConnexioIndicador from "./ConnexioIndicador.vue";

vi.mock("~/stores/connexio", () => ({
  useConnexioStore: vi.fn(),
}));

import { useConnexioStore } from "~/stores/connexio";

describe("ConnexioIndicador.vue", () => {
  it("mostra punt verd i text 'Connectat' quan estat és connectat", async () => {
    vi.mocked(useConnexioStore).mockReturnValue({
      estat: "connectat",
    } as unknown as ReturnType<typeof useConnexioStore>);
    const wrapper = await mountSuspended(ConnexioIndicador);

    expect(wrapper.text()).toContain("Connectat");
    expect(wrapper.find("span.bg-green-500").exists()).toBe(true);
  });

  it("mostra punt vermell i text 'Desconnectat' quan estat és desconnectat", async () => {
    vi.mocked(useConnexioStore).mockReturnValue({
      estat: "desconnectat",
    } as unknown as ReturnType<typeof useConnexioStore>);
    const wrapper = await mountSuspended(ConnexioIndicador);

    expect(wrapper.text()).toContain("Desconnectat");
    expect(wrapper.find("span.bg-red-500").exists()).toBe(true);
  });

  it("mostra punt vermell i text 'Reconnectant\u2026' quan estat és reconnectant", async () => {
    vi.mocked(useConnexioStore).mockReturnValue({
      estat: "reconnectant",
    } as unknown as ReturnType<typeof useConnexioStore>);
    const wrapper = await mountSuspended(ConnexioIndicador);

    expect(wrapper.text()).toContain("Reconnectant\u2026");
    expect(wrapper.find("span.bg-red-500").exists()).toBe(true);
  });

  it("actualitza el text i el color reactivamente quan canvia l'estat de la store", async () => {
    const mockStore = reactive({ estat: "connectat" });
    vi.mocked(useConnexioStore).mockReturnValue(
      mockStore as unknown as ReturnType<typeof useConnexioStore>,
    );
    const wrapper = await mountSuspended(ConnexioIndicador);

    expect(wrapper.text()).toContain("Connectat");
    expect(wrapper.find("span.bg-green-500").exists()).toBe(true);

    mockStore.estat = "desconnectat";
    await nextTick();

    expect(wrapper.text()).toContain("Desconnectat");
    expect(wrapper.find("span.bg-red-500").exists()).toBe(true);
  });
});
