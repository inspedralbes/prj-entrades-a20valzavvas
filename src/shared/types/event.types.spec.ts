import { describe, it, expect, expectTypeOf } from 'vitest';
import type { IEvent } from './event.types';

describe('IEvent', () => {
  it('accepts a valid event object', () => {
    const event: IEvent = {
      id: 'uuid-ev-001',
      slug: 'dune-4k-dolby-2026',
      nom: 'Dune: Projecció Especial 4K Dolby Atmos',
      data: '2026-06-15',
      hora: '21:00',
      recinte: 'Sala Onirica',
      imatgeUrl: 'https://example.com/dune.jpg',
      totalSeients: 200,
      seientsDisponibles: 200,
    };

    expect(event.slug).toBe('dune-4k-dolby-2026');
    expect(event.totalSeients).toBe(200);
    expect(event.seientsDisponibles).toBeLessThanOrEqual(event.totalSeients);
  });

  it('has all required fields typed correctly', () => {
    expectTypeOf<IEvent>().toHaveProperty('id');
    expectTypeOf<IEvent>().toHaveProperty('slug');
    expectTypeOf<IEvent>().toHaveProperty('nom');
    expectTypeOf<IEvent>().toHaveProperty('data');
    expectTypeOf<IEvent>().toHaveProperty('hora');
    expectTypeOf<IEvent>().toHaveProperty('recinte');
    expectTypeOf<IEvent>().toHaveProperty('imatgeUrl');
    expectTypeOf<IEvent>().toHaveProperty('totalSeients');
    expectTypeOf<IEvent>().toHaveProperty('seientsDisponibles');
  });

  it('data i hora are strings', () => {
    expectTypeOf<IEvent['data']>().toBeString();
    expectTypeOf<IEvent['hora']>().toBeString();
  });
});
