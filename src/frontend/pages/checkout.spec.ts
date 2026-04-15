import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import CheckoutPage from "./checkout.vue";

// ── Mock Nuxt composables ─────────────────────────────────────────────────
const navigateToMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
mockNuxtImport("navigateTo", () => navigateToMock);

// ── Mock stores ───────────────────────────────────────────────────────────
vi.mock("~/stores/reserva", () => ({ useReservaStore: vi.fn() }));
vi.mock("~/stores/auth", () => ({ useAuthStore: vi.fn() }));

import { useReservaStore } from "~/stores/reserva";
import { useAuthStore } from "~/stores/auth";

// ── Mock $fetch (Nuxt global) ─────────────────────────────────────────────
const fetchMock = vi.fn();

// ── Shared test data ──────────────────────────────────────────────────────
const mockSeatDetails = [
  { id: "seat-1", fila: "A", numero: 1, categoria: "Platea", preu: 25.0 },
];

function makeReservaStore(active = true) {
  return {
    teReservaActiva: active,
    seatIds: active ? ["seat-1"] : [],
    netejarReserva: vi.fn(),
  };
}

function makeAuthStore() {
  return {
    token: "test-token",
    user: { id: "u1", name: "Test User", email: "test@example.com", role: "comprador" },
  };
}

describe("pages/checkout", () => {
  beforeEach(() => {
    navigateToMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("$fetch", fetchMock);
  });

  // 4.1 — Redirecció sense reserves
  it("redirects to / when there are no active reservations", async () => {
    vi.mocked(useReservaStore).mockReturnValue(makeReservaStore(false) as any);
    vi.mocked(useAuthStore).mockReturnValue(makeAuthStore() as any);

    await mountSuspended(CheckoutPage);

    expect(navigateToMock).toHaveBeenCalledWith("/");
  });

  it("does not redirect when reservations are active", async () => {
    vi.mocked(useReservaStore).mockReturnValue(makeReservaStore(true) as any);
    vi.mocked(useAuthStore).mockReturnValue(makeAuthStore() as any);
    fetchMock.mockResolvedValue(mockSeatDetails);

    await mountSuspended(CheckoutPage);

    expect(navigateToMock).not.toHaveBeenCalledWith("/");
  });

  // 4.2 — Error inline email invàlid
  it("shows email error and does not POST when email is invalid", async () => {
    vi.mocked(useReservaStore).mockReturnValue(makeReservaStore() as any);
    vi.mocked(useAuthStore).mockReturnValue(makeAuthStore() as any);
    fetchMock.mockResolvedValueOnce(mockSeatDetails); // GET /api/seats

    const wrapper = await mountSuspended(CheckoutPage);

    await wrapper.find("#email").setValue("no-es-un-email");
    await wrapper.find("#nom").setValue("Joan García");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).toContain("Introdueix un email vàlid");
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the seats fetch
  });

  // 4.3 — Error inline nom buit
  it("shows nom error and does not POST when nom is empty", async () => {
    vi.mocked(useReservaStore).mockReturnValue(makeReservaStore() as any);
    vi.mocked(useAuthStore).mockReturnValue(makeAuthStore() as any);
    fetchMock.mockResolvedValueOnce(mockSeatDetails);

    const wrapper = await mountSuspended(CheckoutPage);

    await wrapper.find("#nom").setValue("");
    await wrapper.find("#email").setValue("joan@example.com");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).toContain("El nom complet és obligatori");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // 4.4 — Submit correcte
  it("calls POST /api/orders and clears reserva store on success", async () => {
    const netejarReserva = vi.fn();
    vi.mocked(useReservaStore).mockReturnValue({
      ...makeReservaStore(),
      netejarReserva,
    } as any);
    vi.mocked(useAuthStore).mockReturnValue(makeAuthStore() as any);
    fetchMock
      .mockResolvedValueOnce(mockSeatDetails) // GET /api/seats
      .mockResolvedValueOnce({ id: "order-uuid", total_amount: "25.00" }); // POST /api/orders

    const wrapper = await mountSuspended(CheckoutPage);

    await wrapper.find("#nom").setValue("Joan García");
    await wrapper.find("#email").setValue("joan@example.com");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const orderCall = fetchMock.mock.calls[1];
    expect(orderCall?.[0]).toBe("/api/orders");
    expect((orderCall?.[1] as { method: string }).method).toBe("POST");
    expect(netejarReserva).toHaveBeenCalledOnce();
    expect(wrapper.text()).toContain("Compra completada!");
  });

  // nom > 100 chars — validació client-side
  it("shows nom error and does not POST when nom exceeds 100 chars", async () => {
    vi.mocked(useReservaStore).mockReturnValue(makeReservaStore() as any);
    vi.mocked(useAuthStore).mockReturnValue(makeAuthStore() as any);
    fetchMock.mockResolvedValueOnce(mockSeatDetails);

    const wrapper = await mountSuspended(CheckoutPage);

    await wrapper.find("#nom").setValue("a".repeat(101));
    await wrapper.find("#email").setValue("joan@example.com");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).toContain("El nom no pot superar els 100 caràcters");
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the seats fetch
  });

  // 4.5 — Error del servidor
  it("shows error message and keeps store active on server error", async () => {
    const netejarReserva = vi.fn();
    vi.mocked(useReservaStore).mockReturnValue({
      ...makeReservaStore(),
      netejarReserva,
    } as any);
    vi.mocked(useAuthStore).mockReturnValue(makeAuthStore() as any);
    fetchMock
      .mockResolvedValueOnce(mockSeatDetails)
      .mockRejectedValueOnce({ data: { error: "No tens reserves actives." } });

    const wrapper = await mountSuspended(CheckoutPage);

    await wrapper.find("#nom").setValue("Joan García");
    await wrapper.find("#email").setValue("joan@example.com");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("No tens reserves actives.");
    expect(netejarReserva).not.toHaveBeenCalled();
  });
});
