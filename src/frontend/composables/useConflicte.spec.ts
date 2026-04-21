import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSeientStore } from '~/stores/seients';
import { EstatSeient } from '@shared/seat.types';
import { handleReservaRebutjada, useConflicte } from './useConflicte';

function resetConflicteState() {
  // tancarConflicte clears the timer and sets conflicte.value = null
  const { tancarConflicte } = useConflicte();
  tancarConflicte();
}

describe('useConflicte / handleReservaRebutjada', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    resetConflicteState();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // 4.2 — seient existent → missatge amb fila + número
  it('reserva:rebutjada amb seient existent → conflicte.value conté fila + número', () => {
    const seients = useSeientStore();
    seients.llistat.set('seat-D4', {
      estat: EstatSeient.DISPONIBLE,
      fila: 'D',
      numero: 4,
      categoria: 'cat-1',
      preu: 10,
    });

    const { conflicte } = useConflicte();
    handleReservaRebutjada({ seatId: 'seat-D4', motiu: 'no_disponible' });

    expect(conflicte.value?.missatge).toBe(
      'El seient D4 acaba de ser reservat. Escull un altre seient.',
    );
  });

  // 4.3 — seient no trobat → missatge genèric
  it('reserva:rebutjada amb seient no trobat → conflicte.value conté el text genèric', () => {
    const { conflicte } = useConflicte();
    handleReservaRebutjada({ seatId: 'unknown-id', motiu: 'no_disponible' });

    expect(conflicte.value?.missatge).toBe(
      'Un seient acaba de ser reservat. Escull un altre seient.',
    );
  });

  // 4.4 — tancarConflicte() estableix conflicte.value = null immediatament
  it('tancarConflicte() estableix conflicte.value a null immediatament', () => {
    const { conflicte, tancarConflicte } = useConflicte();
    handleReservaRebutjada({ seatId: 'seat-A1', motiu: 'no_disponible' });
    expect(conflicte.value).not.toBeNull();

    tancarConflicte();

    expect(conflicte.value).toBeNull();
  });

  // 4.5 — auto-dismiss als 4000ms
  it('auto-dismiss als 4000ms via fake timers', () => {
    const { conflicte } = useConflicte();
    handleReservaRebutjada({ seatId: 'seat-A1', motiu: 'no_disponible' });
    expect(conflicte.value).not.toBeNull();

    vi.advanceTimersByTime(3999);
    expect(conflicte.value).not.toBeNull();

    vi.advanceTimersByTime(1);
    expect(conflicte.value).toBeNull();
  });

  // 4.6 — segon conflicte reseteja el timer i actualitza el missatge
  it('segon conflicte reseteja el timer i actualitza el missatge', () => {
    const seients = useSeientStore();
    seients.llistat.set('seat-D4', {
      estat: EstatSeient.DISPONIBLE,
      fila: 'D',
      numero: 4,
      categoria: 'cat-1',
      preu: 10,
    });
    seients.llistat.set('seat-B2', {
      estat: EstatSeient.DISPONIBLE,
      fila: 'B',
      numero: 2,
      categoria: 'cat-1',
      preu: 10,
    });

    const { conflicte } = useConflicte();
    handleReservaRebutjada({ seatId: 'seat-D4', motiu: 'no_disponible' });

    // Advance 2 seconds (timer running, 2s left)
    vi.advanceTimersByTime(2000);
    expect(conflicte.value).not.toBeNull();

    // Second conflict arrives — should reset the 4s window
    handleReservaRebutjada({ seatId: 'seat-B2', motiu: 'no_disponible' });
    expect(conflicte.value?.missatge).toBe(
      'El seient B2 acaba de ser reservat. Escull un altre seient.',
    );

    // 3.5 more seconds: previous timer (2s remaining) would have expired — but new timer hasn't
    vi.advanceTimersByTime(3500);
    expect(conflicte.value).not.toBeNull();

    // 0.5 more: new 4s window completes
    vi.advanceTimersByTime(500);
    expect(conflicte.value).toBeNull();
  });

  // 4.7 — actualitzarEstat cridat amb RESERVAT
  it('seients.actualitzarEstat és cridat amb (seatId, EstatSeient.RESERVAT) en rebre reserva:rebutjada', () => {
    const seients = useSeientStore();
    seients.llistat.set('seat-D4', {
      estat: EstatSeient.DISPONIBLE,
      fila: 'D',
      numero: 4,
      categoria: 'cat-1',
      preu: 10,
    });

    const spy = vi.spyOn(seients, 'actualitzarEstat');
    handleReservaRebutjada({ seatId: 'seat-D4', motiu: 'no_disponible' });

    expect(spy).toHaveBeenCalledWith('seat-D4', EstatSeient.RESERVAT);
  });

  // W2 — Doble actualització idempotent: actualitzarEstat cridat amb RESERVAT fins i tot si el seient ja és RESERVAT
  it('actualitzarEstat és cridat amb RESERVAT encara que el seient ja sigui RESERVAT (idempotent)', () => {
    const seients = useSeientStore();
    seients.llistat.set('seat-D4', {
      estat: EstatSeient.RESERVAT, // already RESERVAT — simulates broadcast arriving before the conflict event
      fila: 'D',
      numero: 4,
      categoria: 'cat-1',
      preu: 10,
    });

    const spy = vi.spyOn(seients, 'actualitzarEstat');
    handleReservaRebutjada({ seatId: 'seat-D4', motiu: 'no_disponible' });

    expect(spy).toHaveBeenCalledWith('seat-D4', EstatSeient.RESERVAT);
    expect(seients.llistat.get('seat-D4')?.estat).toBe(EstatSeient.RESERVAT);
  });

  // Cleanup check — tancarConflicte clears the timer
  it('tancarConflicte cancela el timer pendent (no esborra conflicte als 4s)', () => {
    const { conflicte, tancarConflicte } = useConflicte();
    handleReservaRebutjada({ seatId: 'seat-A1', motiu: 'no_disponible' });

    tancarConflicte();
    expect(conflicte.value).toBeNull();

    // Timer should be cleared — advancing time beyond 4s should not crash
    vi.advanceTimersByTime(5000);
    expect(conflicte.value).toBeNull();
  });
});
