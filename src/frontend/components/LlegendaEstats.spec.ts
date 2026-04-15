import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import LlegendaEstats from "./LlegendaEstats.vue";

describe("LlegendaEstats.vue", () => {
  it("conté exactament 5 ítems de llegenda", async () => {
    const wrapper = await mountSuspended(LlegendaEstats);
    const items = wrapper.findAll(".llegenda-item");
    expect(items).toHaveLength(5);
  });

  it("mostra les etiquetes correctes dels 5 estats", async () => {
    const wrapper = await mountSuspended(LlegendaEstats);
    const text = wrapper.text();
    expect(text).toContain("Disponible");
    expect(text).toContain("VIP");
    expect(text).toContain("Reservat");
    expect(text).toContain("Seleccionat per mi");
    expect(text).toContain("Venut");
  });
});
