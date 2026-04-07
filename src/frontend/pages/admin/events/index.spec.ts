import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import AdminEventsPage from "./index.vue";

const mockEvents = [
  {
    id: "1",
    nom: "Concert Rock",
    data: "2025-06-01",
    hora: "20:00",
    recinte: "Sala Razzmatazz",
    publicat: true,
    seients_disponibles: 100,
    seients_reservats: 20,
    seients_venuts: 30,
  },
  {
    id: "2",
    nom: "Jazz Night",
    data: "2025-07-15",
    hora: "21:00",
    recinte: "Jamboree",
    publicat: true,
    seients_disponibles: 50,
    seients_reservats: 5,
    seients_venuts: 10,
  },
  {
    id: "3",
    nom: "Espectacle Esborrany",
    data: "2025-08-20",
    hora: "19:00",
    recinte: "Teatre Municipal",
    publicat: false,
    seients_disponibles: 200,
    seients_reservats: 0,
    seients_venuts: 0,
  },
];

vi.mock("~/stores/auth", () => ({
  useAuthStore: vi.fn(() => ({ token: "fake-token" })),
}));

mockNuxtImport("useFetch", () =>
  vi.fn(() => ({
    data: ref(mockEvents),
    pending: ref(false),
    error: ref(null),
  })),
);

describe("pages/admin/events/index", () => {
  it("renderitza la taula amb tots els events", async () => {
    const wrapper = await mountSuspended(AdminEventsPage);

    const rows = wrapper.findAll("tbody tr");
    expect(rows).toHaveLength(3);
  });

  it("mostra badge 'Publicat' per a events publicats", async () => {
    const wrapper = await mountSuspended(AdminEventsPage);

    const badges = wrapper.findAll(".badge--published");
    expect(badges).toHaveLength(2);
    expect(badges[0]!.text()).toBe("Publicat");
  });

  it("mostra badge 'Esborrany' per a events amb publicat: false", async () => {
    const wrapper = await mountSuspended(AdminEventsPage);

    const draftBadges = wrapper.findAll(".badge--draft");
    expect(draftBadges).toHaveLength(1);
    expect(draftBadges[0]!.text()).toBe("Esborrany");
  });
});
