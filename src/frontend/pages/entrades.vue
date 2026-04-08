<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ middleware: "auth", ssr: false });

const authStore = useAuthStore();
</script>

<template>
  <div>
    <button
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
