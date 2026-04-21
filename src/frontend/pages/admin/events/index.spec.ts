import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import AdminEventsPage from './index.vue';

const mockEvents = [
  {
    id: '1',
    nom: 'Concert Rock',
    data: '2025-06-01',
    hora: '20:00',
    recinte: 'Sala Razzmatazz',
    publicat: true,
    seients_disponibles: 100,
    seients_reservats: 20,
    seients_venuts: 30,
  },
  {
    id: '2',
    nom: 'Jazz Night',
    data: '2025-07-15',
    hora: '21:00',
    recinte: 'Jamboree',
    publicat: true,
    seients_disponibles: 50,
    seients_reservats: 5,
    seients_venuts: 10,
  },
  {
    id: '3',
    nom: 'Espectacle Esborrany',
    data: '2025-08-20',
    hora: '19:00',
    recinte: 'Teatre Municipal',
    publicat: false,
    seients_disponibles: 200,
    seients_reservats: 0,
    seients_venuts: 0,
  },
];

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({ token: 'fake-token' })),
}));

mockNuxtImport('useFetch', () =>
  vi.fn(() => ({
    data: ref(mockEvents),
    pending: ref(false),
    error: ref(null),
  })),
);

describe('pages/admin/events/index', () => {
  it('renderitza la taula amb tots els events', async () => {
    const wrapper = await mountSuspended(AdminEventsPage);

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(3);
  });

  it("mostra badge 'Publicat' per a events publicats", async () => {
    const wrapper = await mountSuspended(AdminEventsPage);

    const badges = wrapper.findAll('.badge--published');
    expect(badges).toHaveLength(2);
    expect(badges[0]!.text()).toBe('Publicat');
  });

  it("mostra badge 'Esborrany' per a events amb publicat: false", async () => {
    const wrapper = await mountSuspended(AdminEventsPage);

    const draftBadges = wrapper.findAll('.badge--draft');
    expect(draftBadges).toHaveLength(1);
    expect(draftBadges[0]!.text()).toBe('Esborrany');
  });
});

describe("pages/admin/events/index — modal d'eliminació", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('$fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clic 'Eliminar' obre el modal amb el nom de l'event", async () => {
    const wrapper = await mountSuspended(AdminEventsPage);

    const eliminarButtons = wrapper.findAll('button').filter((b) => b.text() === 'Eliminar');
    await eliminarButtons[0]!.trigger('click');

    expect(wrapper.find('.modal').exists()).toBe(true);
    expect(wrapper.find('.modal').text()).toContain('Concert Rock');
  });

  it("confirmació exitosa elimina l'event de la llista i tanca el modal", async () => {
    mockFetch.mockResolvedValueOnce(undefined);

    const wrapper = await mountSuspended(AdminEventsPage);

    const eliminarButtons = wrapper.findAll('button').filter((b) => b.text() === 'Eliminar');
    await eliminarButtons[0]!.trigger('click');

    const confirmarButton = wrapper.findAll('button').find((b) => b.text() === 'Confirmar');
    await confirmarButton!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/events/1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(wrapper.find('.modal').exists()).toBe(false);
    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(2);
  });

  it("error 422 mostra missatge d'error dins el modal", async () => {
    mockFetch.mockRejectedValueOnce({ statusCode: 422 });

    const wrapper = await mountSuspended(AdminEventsPage);

    const eliminarButtons = wrapper.findAll('button').filter((b) => b.text() === 'Eliminar');
    await eliminarButtons[0]!.trigger('click');

    const confirmarButton = wrapper.findAll('button').find((b) => b.text() === 'Confirmar');
    await confirmarButton!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.modal').exists()).toBe(true);
    expect(wrapper.find('.modal-error').text()).toContain('No es pot eliminar');
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
  });

  it("clic 'Cancel·lar' tanca el modal sense fer cap petició", async () => {
    const wrapper = await mountSuspended(AdminEventsPage);

    const eliminarButtons = wrapper.findAll('button').filter((b) => b.text() === 'Eliminar');
    await eliminarButtons[0]!.trigger('click');

    expect(wrapper.find('.modal').exists()).toBe(true);

    const cancelButton = wrapper.findAll('button').find((b) => b.text() === 'Cancel·lar');
    await cancelButton!.trigger('click');

    expect(wrapper.find('.modal').exists()).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
  });
});

describe('pages/admin/events/index — toggle de publicació', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('$fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clic 'Despublicar' crida PUT amb published: false i actualitza el badge", async () => {
    mockFetch.mockResolvedValueOnce({ published: false });

    const wrapper = await mountSuspended(AdminEventsPage);

    // First row (id: "1") has publicat: true → button says "Despublicar"
    const despublicarButtons = wrapper.findAll('button').filter((b) => b.text() === 'Despublicar');
    await despublicarButtons[0]!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/events/1',
      expect.objectContaining({
        method: 'PUT',
        body: { published: false },
      }),
    );

    // Badge should now show "Esborrany"
    const draftBadges = wrapper.findAll('.badge--draft');
    expect(draftBadges).toHaveLength(2);
  });

  it("clic 'Publicar' crida PUT amb published: true i actualitza el badge", async () => {
    mockFetch.mockResolvedValueOnce({ published: true });

    const wrapper = await mountSuspended(AdminEventsPage);

    // Find the first "Publicar" button (event with publicat: false)
    const publicarButtons = wrapper.findAll('button').filter((b) => b.text() === 'Publicar');
    const draftCountBefore = wrapper.findAll('.badge--draft').length;
    await publicarButtons[0]!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/events/'),
      expect.objectContaining({
        method: 'PUT',
        body: { published: true },
      }),
    );

    // Badge count should decrease by one
    const draftCountAfter = wrapper.findAll('.badge--draft').length;
    expect(draftCountAfter).toBe(draftCountBefore - 1);
  });

  it("error en el toggle mostra missatge d'error sense canviar l'estat", async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'));

    const wrapper = await mountSuspended(AdminEventsPage);

    const despublicarButtons = wrapper.findAll('button').filter((b) => b.text() === 'Despublicar');
    await despublicarButtons[0]!.trigger('click');
    await wrapper.vm.$nextTick();

    // Badge should remain "Publicat"
    const publishedBadges = wrapper.findAll('.badge--published');
    expect(publishedBadges).toHaveLength(2);

    // Error message should appear
    expect(wrapper.find('.toggle-error').exists()).toBe(true);
    expect(wrapper.find('.toggle-error').text()).toContain(
      "Error en canviar l'estat de publicació",
    );
  });

  it('error 422 has_sold_tickets mostra missatge específic sobre entrades venudes', async () => {
    mockFetch.mockRejectedValueOnce({
      statusCode: 422,
      data: { code: 'has_sold_tickets' },
    });

    const wrapper = await mountSuspended(AdminEventsPage);

    const despublicarButtons = wrapper.findAll('button').filter((b) => b.text() === 'Despublicar');
    await despublicarButtons[0]!.trigger('click');
    await wrapper.vm.$nextTick();

    // Badge should remain "Publicat"
    const publishedBadges = wrapper.findAll('.badge--published');
    expect(publishedBadges).toHaveLength(2);

    // Specific error message should appear
    expect(wrapper.find('.toggle-error').exists()).toBe(true);
    expect(wrapper.find('.toggle-error').text()).toContain('entrades venudes');
  });
});
