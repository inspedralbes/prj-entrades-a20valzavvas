import { describe, it, expect } from 'vitest';
import { UserRole } from './auth.types';

describe('UserRole', () => {
  it('has the correct string values', () => {
    expect(UserRole.COMPRADOR).toBe('comprador');
    expect(UserRole.ADMIN).toBe('admin');
  });

  it('has exactly two members', () => {
    const values = Object.values(UserRole);
    expect(values).toHaveLength(2);
  });
});
