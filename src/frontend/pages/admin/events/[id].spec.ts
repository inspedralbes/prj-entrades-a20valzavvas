import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EditEventPage from './[id].vue';

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({ token: 'fake-token' })),
}));

const fakeEvent = {
  id: 'test-event-uuid',
  name: 'Dune 4K',
  slug: 'dune-4k',
  description: 'Una gran pel·lícula',
  date: '2027-05-10T20:00:00',
  venue: 'Sala Onirica',
  published: false,
  price_categories: [],
};

describe('pages/admin/events/[id]', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('$fetch', mockFetch);
  });

  it("carrega les dades de l'event i les mostra al formulari", async () => {
    mockFetch.mockResolvedValueOnce(fakeEvent);

    const wrapper = await mountSuspended(EditEventPage);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const nameInput = wrapper.find<HTMLInputElement>('#name');
    const slugInput = wrapper.find<HTMLInputElement>('#slug');
    const venueInput = wrapper.find<HTMLInputElement>('#venue');

    expect(nameInput.element.value).toBe('Dune 4K');
    expect(slugInput.element.value).toBe('dune-4k');
    expect(venueInput.element.value).toBe('Sala Onirica');
  });

  it('crida PUT en enviar el formulari i redirigeix a /admin/events', async () => {
    mockFetch
      .mockResolvedValueOnce(fakeEvent)
      .mockResolvedValueOnce({ ...fakeEvent, description: 'Updated' });

    const wrapper = await mountSuspended(EditEventPage);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const mockPush = vi.fn().mockResolvedValue(undefined);
    wrapper.vm.$router.push = mockPush;

    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/events/'),
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(mockPush).toHaveBeenCalledWith('/admin/events');
    expect(wrapper.find('.server-error').exists()).toBe(false);
  });

  it('mostra error inline en cas de 422 (reserves actives)', async () => {
    mockFetch.mockResolvedValueOnce(fakeEvent).mockRejectedValueOnce({
      response: { status: 422 },
      data: {
        message: 'No és possible modificar les categories mentre hi ha reserves actives',
      },
    });

    const wrapper = await mountSuspended(EditEventPage);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.server-error').exists()).toBe(true);
    expect(wrapper.find('.server-error').text()).toContain('No és possible modificar');
  });

  it('mostra slug-error en cas de 409 (slug duplicat)', async () => {
    mockFetch.mockResolvedValueOnce(fakeEvent).mockRejectedValueOnce({
      response: { status: 409 },
      data: { message: 'Slug already exists' },
    });

    const wrapper = await mountSuspended(EditEventPage);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.slug-error').exists()).toBe(true);
    expect(wrapper.find('.slug-error').text()).toBe('Slug already exists');
  });

  it('mostra error de càrrega si el GET falla', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = await mountSuspended(EditEventPage);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Error en carregar l'event");
  });
});
