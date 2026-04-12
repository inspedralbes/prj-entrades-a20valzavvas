import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import EventCard from "./EventCard.vue";

const defaultProps = {
  id: "event-1",
  slug: "dune-4k-2026",
  name: "Dune 4K Dolby",
  date: "2026-06-15T20:00:00",
  venue: "Sala Onirica",
  available_seats: 50,
};

describe("EventCard.vue", () => {
  it("renderitza el nom de l'event", async () => {
    const wrapper = await mountSuspended(EventCard, { props: defaultProps });
    expect(wrapper.text()).toContain("Dune 4K Dolby");
  });

  it("renderitza el link cap a /events/{slug}", async () => {
    const wrapper = await mountSuspended(EventCard, { props: defaultProps });
    const link = wrapper.find("a");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/events/dune-4k-2026");
  });

  it("renderitza el nom del recinte", async () => {
    const wrapper = await mountSuspended(EventCard, { props: defaultProps });
    expect(wrapper.text()).toContain("Sala Onirica");
  });

  it("badge verd quan available_seats > 20", async () => {
    const wrapper = await mountSuspended(EventCard, {
      props: { ...defaultProps, available_seats: 50 },
    });
    const badge = wrapper.find(".event-card__badge");
    expect(badge.attributes("style")).toContain("#16A34A");
  });

  it("badge groc quan available_seats <= 20 i > 0", async () => {
    const wrapper = await mountSuspended(EventCard, {
      props: { ...defaultProps, available_seats: 10 },
    });
    const badge = wrapper.find(".event-card__badge");
    expect(badge.attributes("style")).toContain("#D97706");
  });

  it("badge vermell i text 'Esgotat' quan available_seats = 0", async () => {
    const wrapper = await mountSuspended(EventCard, {
      props: { ...defaultProps, available_seats: 0 },
    });
    const badge = wrapper.find(".event-card__badge");
    expect(badge.attributes("style")).toContain("#DC2626");
    expect(badge.text()).toBe("Esgotat");
  });

  it("no mostra descripció si no s'ha passat la prop", async () => {
    const wrapper = await mountSuspended(EventCard, { props: defaultProps });
    expect(wrapper.find(".event-card__description").exists()).toBe(false);
  });

  it("mostra descripció si s'ha passat la prop", async () => {
    const wrapper = await mountSuspended(EventCard, {
      props: { ...defaultProps, description: "Una projecció especial en 4K." },
    });
    expect(wrapper.find(".event-card__description").text()).toBe(
      "Una projecció especial en 4K.",
    );
  });
});
