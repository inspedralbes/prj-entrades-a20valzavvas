import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { setActivePinia, createPinia } from 'pinia';
import type { useAuthStore as UseAuthStoreType } from '~/stores/auth';

const navigateToMock = vi.hoisted(() => vi.fn());

mockNuxtImport('navigateTo', () => navigateToMock);

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(),
}));

async function runMiddleware(isAuthenticated: boolean, role: string | null = null) {
  const { useAuthStore } = await import('~/stores/auth');
  vi.mocked(useAuthStore).mockReturnValue({
    isAuthenticated,
    user: role ? { id: '1', name: 'Test', email: 't@t.com', role } : null,
  } as ReturnType<typeof UseAuthStoreType>);

  const defineMiddleware = (fn: Function) => fn;
  vi.stubGlobal('defineNuxtRouteMiddleware', defineMiddleware);

  const mod = await import('./admin');
  const middleware = mod.default as Function;
  return middleware({} as any, {} as any);
}

describe('middleware/admin', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    navigateToMock.mockReset();
    vi.resetModules();
  });

  it("redirigeix a /auth/login si l'usuari no és autenticat", async () => {
    await runMiddleware(false);
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it("redirigeix a /auth/login si l'usuari té rol comprador", async () => {
    await runMiddleware(true, 'comprador');
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it("no redirigeix si l'usuari té rol admin", async () => {
    await runMiddleware(true, 'admin');
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('redirigeix a /auth/login des de subruta /admin/events amb rol comprador', async () => {
    await runMiddleware(true, 'comprador');
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login');
  });

  it('no redirigeix a subrutes admin amb rol admin', async () => {
    await runMiddleware(true, 'admin');
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
