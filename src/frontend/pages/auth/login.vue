<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ middleware: [] });

const authStore = useAuthStore();
const route = useRoute();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errors = ref<Record<string, string>>({});

onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo("/");
  }
});

async function submit() {
  errors.value = {};
  isLoading.value = true;
  try {
    await authStore.login({ email: email.value, password: password.value });
    const redirect = route.query.redirect as string | undefined;
    await navigateTo(redirect || "/");
  } catch (err: any) {
    const serverErrors: Record<string, string[]> = err?.data?.errors ?? {};
    const mapped: Record<string, string> = {};
    for (const [field, messages] of Object.entries(serverErrors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        mapped[field] = messages[0]!;
      }
    }
    if (Object.keys(mapped).length === 0 && err?.data?.message) {
      mapped.email = err.data.message;
    }
    errors.value = mapped;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-login">
    <h1>Iniciar sessió</h1>
    <form v-if="!authStore.isAuthenticated" @submit.prevent="submit">
      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
        />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>
      <div class="field">
        <label for="password">Contrasenya</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
        <span v-if="errors.password" class="field-error">{{
          errors.password
        }}</span>
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Carregant..." : "Iniciar sessió" }}
      </button>
    </form>
  </div>
</template>
