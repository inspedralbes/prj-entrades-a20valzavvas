import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOrders } from './useOrders';

const mockToken = 'test-token';

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({ token: mockToken }),
}));

const mockOrder = {
  id: 'order-1',
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

describe('useOrders', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("fetchOrders popula orders i posa isLoading a false en cas d'èxit", async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([mockOrder]));

    const { orders, isLoading, error, fetchOrders } = useOrders();

    expect(isLoading.value).toBe(false);
    const promise = fetchOrders();
    expect(isLoading.value).toBe(true);
    await promise;

    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(orders.value).toHaveLength(1);
    expect(orders.value[0].id).toBe('order-1');
  });

  it('fetchOrders retorna array buit quan no hi ha ordres', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([]));

    const { orders, isLoading, fetchOrders } = useOrders();
    await fetchOrders();

    expect(isLoading.value).toBe(false);
    expect(orders.value).toHaveLength(0);
  });

  it("fetchOrders captura l'error i posa isLoading a false", async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({ data: { message: 'Unauthorized' } }));

    const { orders, isLoading, error, fetchOrders } = useOrders();
    await fetchOrders();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe('Unauthorized');
    expect(orders.value).toHaveLength(0);
  });

  it('fetchOrders envia el Bearer token correctament', async () => {
    const fetchMock = vi.fn().mockResolvedValue([]);
    vi.stubGlobal('$fetch', fetchMock);

    const { fetchOrders } = useOrders();
    await fetchOrders();

    expect(fetchMock).toHaveBeenCalledWith('/api/orders', {
      headers: { Authorization: `Bearer ${mockToken}` },
    });
  });
});
