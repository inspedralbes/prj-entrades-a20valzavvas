<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ middleware: "admin", ssr: false });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const eventId = route.params.id as string;

const name = ref("");
const slug = ref("");
const description = ref("");
const date = ref("");
const venue = ref("");
const maxSeientPerUsuari = ref<number>(4);

const isLoading = ref(true);
const loadError = ref<string | null>(null);
const slugError = ref<string | null>(null);
const serverError = ref<string | null>(null);
const isSubmitting = ref(false);

onMounted(async () => {
  try {
    const event = await $fetch<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      date: string;
      venue: string;
      max_seients_per_usuari: number;
    }>(`/api/admin/events/${eventId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });

    name.value = event.name;
    slug.value = event.slug;
    description.value = event.description ?? "";
    date.value = event.date.slice(0, 16); // datetime-local format
    venue.value = event.venue;
    maxSeientPerUsuari.value = event.max_seients_per_usuari;
  } catch {
    loadError.value = "Error en carregar l'event.";
  } finally {
    isLoading.value = false;
  }
});

async function submit() {
  slugError.value = null;
  serverError.value = null;
  isSubmitting.value = true;

  const payload: Record<string, string | number> = {
    name: name.value,
    slug: slug.value,
    description: description.value,
    date: date.value,
    venue: venue.value,
    max_seients_per_usuari: maxSeientPerUsuari.value,
  };

  try {
    await $fetch(`/api/admin/events/${eventId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: payload,
    });
    await router.push("/admin/events");
  } catch (err: any) {
    if (err?.response?.status === 409) {
      slugError.value = "Slug already exists";
    } else if (err?.response?.status === 422) {
      serverError.value = err?.data?.message ?? "Error de validació.";
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="admin-form-page">
    <header class="admin-form-header">
      <NuxtLink to="/admin/events" class="btn-back">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Tornar
      </NuxtLink>
      <h1 class="admin-form-title">Editar Esdeveniment</h1>
    </header>

    <div v-if="isLoading" class="state-message">Carregant...</div>
    <div v-else-if="loadError" class="state-message state-message--error">
      {{ loadError }}
    </div>

    <form v-else @submit.prevent="submit" novalidate>
      <div class="form-card">
        <h2 class="form-card-title">Informació general</h2>

        <div class="field">
          <label for="name">Nom *</label>
          <input id="name" v-model="name" type="text" required />
        </div>

        <div class="field">
          <label for="slug">Slug</label>
          <input
            id="slug"
            v-model="slug"
            type="text"
            :class="{ 'input-error': slugError }"
          />
          <span v-if="slugError" class="error-message slug-error">{{ slugError }}</span>
        </div>

        <div class="field">
          <label for="description">Descripció</label>
          <textarea id="description" v-model="description" rows="3" />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="date">Data i hora *</label>
            <input id="date" v-model="date" type="datetime-local" required />
          </div>

          <div class="field">
            <label for="venue">Recinte *</label>
            <input id="venue" v-model="venue" type="text" required />
          </div>
        </div>

        <div class="field field--narrow">
          <label for="max-seients">Màxim de seients per usuari *</label>
          <input
            id="max-seients"
            v-model.number="maxSeientPerUsuari"
            type="number"
            min="1"
            required
          />
        </div>
      </div>

      <div v-if="serverError" class="error-banner server-error" role="alert">
        {{ serverError }}
      </div>

      <div class="form-actions">
        <NuxtLink to="/admin/events" class="btn-cancel">Cancel·lar</NuxtLink>
        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Desant..." : "Desar canvis" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.admin-form-page {
  min-height: 100dvh;
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  padding: 2rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Header */
.admin-form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    color 0.15s,
    border-color 0.15s;
  flex-shrink: 0;
}

.btn-back svg {
  width: 1rem;
  height: 1rem;
}

.btn-back:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-secondary);
}

.admin-form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

/* States */
.state-message {
  color: var(--color-text-secondary);
  padding: 2rem 0;
  font-size: var(--font-size-sm);
}

.state-message--error {
  color: var(--color-error);
}

/* Card */
.form-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}

.form-card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin: 0 0 1.25rem;
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.1rem;
}

.field:last-child {
  margin-bottom: 0;
}

.field--narrow {
  max-width: 200px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.1rem;
}

@media (max-width: 560px) {
  .field-row {
    grid-template-columns: 1fr;
  }

  .field--narrow {
    max-width: 100%;
  }
}

.field label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.field input,
.field textarea {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  padding: 0.6rem 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--color-border-focus);
}

.field input.input-error {
  border-color: var(--color-error);
}

.field input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
  cursor: pointer;
}

.error-message {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

/* Error banner */
.error-banner {
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--radius-md);
  color: #f87171;
  font-size: var(--font-size-sm);
  padding: 0.6rem 0.875rem;
  margin-bottom: 1.25rem;
}

/* Actions */
.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.btn-cancel:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  padding: 0.65rem 1.5rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-accent-primary-hover);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
