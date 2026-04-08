<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ ssr: false });

const authStore = useAuthStore();

onMounted(() => {
  if (!authStore.isAuthenticated) {
    navigateTo("/auth/login");
  } else if (authStore.user?.role === "admin") {
    navigateTo("/admin/events");
  } else {
    navigateTo("/entrades");
  }
});
</script>

<template>
  <div />
</template>
