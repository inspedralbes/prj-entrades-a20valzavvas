import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import NotificacioEstat from './NotificacioEstat.vue';

vi.mock('~/composables/useConflicte', () => ({
  useConflicte: vi.fn(),
}));

import { useConflicte } from '~/composables/useConflicte';

describe('NotificacioEstat.vue', () => {
  const tancarConflicteMock = vi.fn();

  beforeEach(() => {
    tancarConflicteMock.mockClear();
  });

  afterEach(() => {
    // Clean up any DOM content teleported to body between tests
    document.body.innerHTML = '';
  });

  // 5.2 — toast visible quan conflicte.value no és null
  it('mostra el toast quan conflicte.value no és null', async () => {
    vi.mocked(useConflicte).mockReturnValue({
      conflicte: ref({
        missatge: 'El seient D4 acaba de ser reservat. Escull un altre seient.',
        key: 1,
      }),
      tancarConflicte: tancarConflicteMock,
    });

    await mountSuspended(NotificacioEstat);
    await nextTick();

    // Teleport renders to document.body, not inside the wrapper
    expect(document.body.textContent).toContain('El seient D4 acaba de ser reservat.');
    expect(document.body.querySelector('.toast')).not.toBeNull();
  });

  // 5.3 — toast ocult quan conflicte.value és null
  it('no mostra el toast quan conflicte.value és null', async () => {
    vi.mocked(useConflicte).mockReturnValue({
      conflicte: ref(null),
      tancarConflicte: tancarConflicteMock,
    });

    await mountSuspended(NotificacioEstat);
    await nextTick();

    expect(document.body.querySelector('.toast')).toBeNull();
  });

  // 5.4 — clic sobre el toast crida tancarConflicte()
  it('clic sobre el toast crida tancarConflicte()', async () => {
    vi.mocked(useConflicte).mockReturnValue({
      conflicte: ref({
        missatge: 'El seient B2 acaba de ser reservat. Escull un altre seient.',
        key: 1,
      }),
      tancarConflicte: tancarConflicteMock,
    });

    await mountSuspended(NotificacioEstat);
    await nextTick();

    const toast = document.body.querySelector<HTMLElement>('.toast');
    expect(toast).not.toBeNull();
    toast!.click();

    expect(tancarConflicteMock).toHaveBeenCalledTimes(1);
  });

  // Bonus — el botó de tancar crida tancarConflicte()
  it('el botó × crida tancarConflicte()', async () => {
    vi.mocked(useConflicte).mockReturnValue({
      conflicte: ref({
        missatge: 'Un seient acaba de ser reservat. Escull un altre seient.',
        key: 1,
      }),
      tancarConflicte: tancarConflicteMock,
    });

    await mountSuspended(NotificacioEstat);
    await nextTick();

    const closeBtn = document.body.querySelector<HTMLElement>('.toast-tancar');
    expect(closeBtn).not.toBeNull();
    closeBtn!.click();

    expect(tancarConflicteMock).toHaveBeenCalledTimes(1);
  });
});
