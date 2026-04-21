import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EntrádesPage from './entrades.vue';
import type { OrderWithDetails } from '~/composables/useOrders';

const mockOrder: OrderWithDetails = {
  id: 'order-uuid-1',
  total_amount: '28.00',
  status: 'completed',
  created_at: '2026-04-17T20:30:00Z',
  items: [
    {
      id: 'item-1',
      price: '14.00',
      seat: {
        id: 'seat-1',
        row: 'B',
        number: 5,
        price_category: { name: 'Preferent' },
        event: {
          id: 'event-1',
          name: 'Hamlet',
          slug: 'hamlet-2026',
          date: '2026-04-19T20:30:00Z',
          venue: 'Sala Principal',
          image_url: null,
        },
      },
    },
  ],
};

const mockFetchOrders = vi.fn();
const mockOrders = ref<OrderWithDetails[]>([]);
const mockIsLoading = ref(false);
const mockError = ref<string | null>(null);

vi.mock('~/composables/useOrders', () => ({
  useOrders: () => ({
    orders: mockOrders,
    isLoading: mockIsLoading,
    error: mockError,
    fetchOrders: mockFetchOrders,
  }),
}));

describe('pages/entrades', () => {
  beforeEach(() => {
    mockFetchOrders.mockReset();
    mockOrders.value = [];
    mockIsLoading.value = false;
    mockError.value = null;
  });

  it("no conté cap botó de 'Tancar sessió' inline", async () => {
    const wrapper = await mountSuspended(EntrádesPage);
    expect(wrapper.find('.btn-logout').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Tancar sessió');
  });

  it('mostra skeleton quan isLoading és true', async () => {
    mockIsLoading.value = true;

    const wrapper = await mountSuspended(EntrádesPage);
    expect(wrapper.find('.ticket-skeleton').exists()).toBe(true);
    expect(wrapper.find('.empty-state').exists()).toBe(false);
  });

  it("mostra l'estat buit quan no hi ha ordres i no s'està carregant", async () => {
    const wrapper = await mountSuspended(EntrádesPage);
    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.text()).toContain('Cap entrada encara');
    expect(wrapper.find('.ticket-card').exists()).toBe(false);
  });

  it('mostra les ticket cards quan hi ha ordres', async () => {
    mockOrders.value = [mockOrder];

    const wrapper = await mountSuspended(EntrádesPage);
    expect(wrapper.find('.ticket-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Hamlet');
    expect(wrapper.text()).toContain('28.00 €');
  });

  it("mostra el banner d'error quan error no és null", async () => {
    mockError.value = 'Error en carregar les entrades';

    const wrapper = await mountSuspended(EntrádesPage);
    expect(wrapper.find('.error-banner').exists()).toBe(true);
    expect(wrapper.text()).toContain('Error en carregar les entrades');
  });
});
