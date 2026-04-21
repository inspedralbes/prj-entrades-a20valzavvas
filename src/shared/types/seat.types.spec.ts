import { describe, it, expect } from 'vitest';
import { EstatSeient } from './seat.types';
import type { ISeient } from './seat.types';

describe('EstatSeient', () => {
  it('has the correct string values', () => {
    expect(EstatSeient.DISPONIBLE).toBe('DISPONIBLE');
    expect(EstatSeient.RESERVAT).toBe('RESERVAT');
    expect(EstatSeient.VENUT).toBe('VENUT');
  });

  it('has exactly three members', () => {
    const values = Object.values(EstatSeient);
    expect(values).toHaveLength(3);
  });
});

describe('ISeient shape', () => {
  it('accepts a valid seat object', () => {
    const seient: ISeient = {
      id: 'uuid-a1',
      fila: 'A',
      numero: 1,
      estat: EstatSeient.DISPONIBLE,
      preu: 15.5,
      categoria: 'standard',
      colorHex: '#4ade80',
    };

    expect(seient.id).toBe('uuid-a1');
    expect(seient.estat).toBe(EstatSeient.DISPONIBLE);
    expect(seient.preu).toBeGreaterThan(0);
  });
});
