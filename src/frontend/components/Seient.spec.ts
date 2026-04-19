import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Seient from "./Seient.vue";
import { EstatSeient } from "@shared/seat.types";

const makeSeat = (estat: EstatSeient, id = "seat-1") => ({
  id,
  estat,
  fila: "A",
  numero: 1,
  categoria: "cat-1",
  preu: 12.5,
});

describe("Seient.vue", () => {
  it("aplica classe seient--disponible quan estat és DISPONIBLE", async () => {
    const wrapper = await mountSuspended(Seient, {
      props: { seat: makeSeat(EstatSeient.DISPONIBLE) },
    });
    expect(wrapper.classes()).toContain("seient--disponible");
  });

  it("aplica classe seient--reservat quan estat és RESERVAT", async () => {
    const wrapper = await mountSuspended(Seient, {
      props: { seat: makeSeat(EstatSeient.RESERVAT) },
    });
    expect(wrapper.classes()).toContain("seient--reservat");
  });

  it("aplica classe seient--venut quan estat és VENUT", async () => {
    const wrapper = await mountSuspended(Seient, {
      props: { seat: makeSeat(EstatSeient.VENUT) },
    });
    expect(wrapper.classes()).toContain("seient--venut");
  });

  it("aplica classe seient--seleccionat-per-mi quan miSeat és true", async () => {
    const wrapper = await mountSuspended(Seient, {
      props: { seat: makeSeat(EstatSeient.DISPONIBLE), miSeat: true },
    });
    expect(wrapper.classes()).toContain("seient--seleccionat-per-mi");
  });

  it("cada estat produeix exactament una classe CSS de color diferent", async () => {
    const colorClasses = [
      "seient--disponible",
      "seient--reservat",
      "seient--venut",
      "seient--seleccionat-per-mi",
    ];
    const seatsEstats = [
      { seat: makeSeat(EstatSeient.DISPONIBLE), miSeat: false },
      { seat: makeSeat(EstatSeient.RESERVAT, "s2"), miSeat: false },
      { seat: makeSeat(EstatSeient.VENUT, "s3"), miSeat: false },
      { seat: makeSeat(EstatSeient.DISPONIBLE, "s4"), miSeat: true },
    ];
    const assignedClasses: string[] = [];
    for (const props of seatsEstats) {
      const wrapper = await mountSuspended(Seient, { props });
      const match = colorClasses.find((c) => wrapper.classes().includes(c));
      expect(match).toBeDefined();
      assignedClasses.push(match!);
    }
    // All four classes must be unique (each state → different class)
    expect(new Set(assignedClasses).size).toBe(4);
  });

  describe("click handler", () => {
    it("emet l'event reservar amb seatId quan el seient és DISPONIBLE", async () => {
      const wrapper = await mountSuspended(Seient, {
        props: { seat: makeSeat(EstatSeient.DISPONIBLE, "seat-B5") },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("reservar")).toBeDefined();
      expect(wrapper.emitted("reservar")?.[0]).toEqual(["seat-B5"]);
    });

    it("no emet l'event reservar quan el seient és RESERVAT", async () => {
      const wrapper = await mountSuspended(Seient, {
        props: { seat: makeSeat(EstatSeient.RESERVAT, "seat-B5") },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("reservar")).toBeUndefined();
    });

    it("no emet l'event reservar quan el seient és VENUT", async () => {
      const wrapper = await mountSuspended(Seient, {
        props: { seat: makeSeat(EstatSeient.VENUT, "seat-B5") },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("reservar")).toBeUndefined();
    });

    it("emet l'event alliberar amb seatId quan miSeat és true", async () => {
      const wrapper = await mountSuspended(Seient, {
        props: {
          seat: makeSeat(EstatSeient.RESERVAT, "seat-C3"),
          miSeat: true,
        },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("alliberar")).toBeDefined();
      expect(wrapper.emitted("alliberar")?.[0]).toEqual(["seat-C3"]);
    });

    it("no emet l'event reservar quan miSeat és true", async () => {
      const wrapper = await mountSuspended(Seient, {
        props: {
          seat: makeSeat(EstatSeient.RESERVAT, "seat-C3"),
          miSeat: true,
        },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("reservar")).toBeUndefined();
    });

    it("no emet reservar ni alliberar quan readOnly és true", async () => {
      const wrapper = await mountSuspended(Seient, {
        props: {
          seat: makeSeat(EstatSeient.DISPONIBLE, "seat-D1"),
          readOnly: true,
        },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("reservar")).toBeUndefined();
      expect(wrapper.emitted("alliberar")).toBeUndefined();
      expect(wrapper.find("button").classes()).toContain("seient--readonly");
    });
  });
});
