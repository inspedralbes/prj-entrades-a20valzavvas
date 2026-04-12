<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ middleware: "auth", ssr: false });

const authStore = useAuthStore();
</script>

<template>
  <div class="page-dark">
    <button
      class="btn-logout"
      type="button"
      @click="
        () => {
          authStore.logout();
          navigateTo('/auth/login');
        }
      "
    >
      Tancar sessió
    </button>
    <!-- TODO: implementar contingut (PE-05) -->
  </div>
</template>

<style scoped>
.page-dark {
  min-height: 100dvh;
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  padding: 1.5rem;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: var(--color-accent-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-logout:hover {
  background: var(--color-accent-indigo);
}
</style>
