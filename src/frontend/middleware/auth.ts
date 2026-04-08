import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    return navigateTo("/auth/login");
  }
});
