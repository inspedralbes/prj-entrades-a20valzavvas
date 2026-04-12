import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import EntrádesPage from "./entrades.vue";

describe("pages/entrades", () => {
  // S2 — Verifica que el botó de logout inline va ser eliminat (PE-61)
  // El logout és responsabilitat exclusiva de AppNavbar des de PE-61
  it("no conté cap botó de 'Tancar sessió' inline", async () => {
    const wrapper = await mountSuspended(EntrádesPage);
    expect(wrapper.find(".btn-logout").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Tancar sessió");
  });
});
