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
  <div class="edit-event">
    <h1>Editar Esdeveniment</h1>

    <div v-if="isLoading">Carregant...</div>
    <div v-else-if="loadError" class="error">{{ loadError }}</div>
    <form v-else @submit.prevent="submit">
      <div class="field">
        <label for="name">Nom *</label>
        <input id="name" v-model="name" type="text" required />
      </div>

      <div class="field">
        <label for="slug">Slug</label>
        <input id="slug" v-model="slug" type="text" />
        <span v-if="slugError" class="error slug-error">{{ slugError }}</span>
      </div>

      <div class="field">
        <label for="description">Descripció</label>
        <textarea id="description" v-model="description" />
      </div>

      <div class="field">
        <label for="date">Data i hora *</label>
        <input id="date" v-model="date" type="datetime-local" required />
      </div>

      <div class="field">
        <label for="venue">Recinte *</label>
        <input id="venue" v-model="venue" type="text" required />
      </div>

      <div class="field">
        <label for="max-seients">Màxim de seients per usuari *</label>
        <input
          id="max-seients"
          v-model.number="maxSeientPerUsuari"
          type="number"
          min="1"
          required
        />
      </div>

      <div v-if="serverError" class="error server-error">{{ serverError }}</div>

      <div class="actions">
        <NuxtLink to="/admin/events">Cancel·lar</NuxtLink>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Desant..." : "Desar canvis" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-event {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 1rem;
}
.field label {
  font-weight: 600;
  font-size: 0.9rem;
}
.field input,
.field textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.error {
  color: #dc2626;
  font-size: 0.85rem;
}
.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1.5rem;
}
.actions button {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
