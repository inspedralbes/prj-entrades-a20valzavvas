<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ middleware: [] });

const authStore = useAuthStore();
const route = useRoute();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errors = ref<Record<string, string>>({});

function homeForRole() {
  return authStore.user?.role === "admin" ? "/admin/events" : "/";
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo(homeForRole());
  }
});

async function submit() {
  errors.value = {};
  isLoading.value = true;
  try {
    await authStore.login({ email: email.value, password: password.value });
    const redirect = route.query.redirect as string | undefined;
    await navigateTo(redirect || homeForRole());
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
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Iniciar sessió</h1>
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
  </div>
</template>

<style scoped>
.auth-page {
  flex: 1;
  min-height: 100%;
  background: var(--color-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.field label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.field input {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.625rem 0.75rem;
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  outline: none;
  transition: border-color 0.15s ease;
}

.field input:focus {
  border-color: var(--color-border-focus);
}

.field-error {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

button[type="submit"] {
  width: 100%;
  padding: 0.625rem 1rem;
  background: var(--color-accent-primary);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-base);
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.15s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background: var(--color-accent-primary-hover);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
