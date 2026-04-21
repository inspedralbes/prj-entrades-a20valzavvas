import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;
  const authStore = useAuthStore();
  if (authStore.user?.role === 'admin') {
    return navigateTo('/admin');
  }
});
