<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ middleware: [] });

const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const isLoading = ref(false);
const errors = ref<Record<string, string>>({});

onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo("/");
  }
});

async function submit() {
  errors.value = {};

  if (password.value !== passwordConfirmation.value) {
    errors.value = {
      password_confirmation: "Les contrasenyes no coincideixen",
    };
    return;
  }

  isLoading.value = true;
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    await navigateTo("/");
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
  <div class="auth-register">
    <h1>Registrar-se</h1>
    <form v-if="!authStore.isAuthenticated" @submit.prevent="submit">
      <div class="field">
        <label for="name">Nom</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          autocomplete="name"
        />
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>
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
          minlength="8"
          autocomplete="new-password"
        />
        <span v-if="errors.password" class="field-error">{{
          errors.password
        }}</span>
      </div>
      <div class="field">
        <label for="password_confirmation">Confirma la contrasenya</label>
        <input
          id="password_confirmation"
          v-model="passwordConfirmation"
          type="password"
          required
          autocomplete="new-password"
        />
        <span v-if="errors.password_confirmation" class="field-error">{{
          errors.password_confirmation
        }}</span>
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Carregant..." : "Registrar-se" }}
      </button>
    </form>
  </div>
</template>
