import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import NewEventPage from './new.vue';

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({ token: 'fake-token' })),
}));

describe('pages/admin/events/new', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('$fetch', mockFetch);
  });

  it('renderitza el formulari amb tots els camps', async () => {
    const wrapper = await mountSuspended(NewEventPage);

    expect(wrapper.find('#name').exists()).toBe(true);
    expect(wrapper.find('#slug').exists()).toBe(true);
    expect(wrapper.find('#date').exists()).toBe(true);
    expect(wrapper.find('#venue').exists()).toBe(true);
    expect(wrapper.find('#description').exists()).toBe(true);
  });

  it('autocompleta el slug a partir del nom', async () => {
    const wrapper = await mountSuspended(NewEventPage);

    const nameInput = wrapper.find('#name');
    await nameInput.setValue('Blade Runner 2049 4K');
    await wrapper.vm.$nextTick();

    const slugInput = wrapper.find<HTMLInputElement>('#slug');
    expect(slugInput.element.value).toBe('blade-runner-2049-4k');
  });

  it('mostra error inline en cas de 409 (slug duplicat)', async () => {
    mockFetch.mockRejectedValueOnce({
      response: { status: 409 },
      data: { message: 'Slug already exists' },
    });

    const wrapper = await mountSuspended(NewEventPage);
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.slug-error').exists()).toBe(true);
    expect(wrapper.find('.slug-error').text()).toBe('Slug already exists');
  });

  it("crida $fetch amb POST quan s'envia el formulari i no mostra errors", async () => {
    mockFetch.mockResolvedValueOnce({ id: 'uuid', name: 'Test' });

    const wrapper = await mountSuspended(NewEventPage);
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/events',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(wrapper.find('.slug-error').exists()).toBe(false);
  });
});
