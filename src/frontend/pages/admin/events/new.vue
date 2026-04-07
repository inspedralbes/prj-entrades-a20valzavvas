<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ middleware: "admin", ssr: false });

const authStore = useAuthStore();
const router = useRouter();

interface PriceCategory {
  name: string;
  price: number | null;
  rows: string;
  seats_per_row: number | null;
}

const name = ref("");
const slug = ref("");
const description = ref("");
const date = ref("");
const venue = ref("");
const priceCategories = ref<PriceCategory[]>([
  { name: "", price: null, rows: "", seats_per_row: null },
]);

const slugError = ref<string | null>(null);
const serverErrors = ref<Record<string, string[]>>({});
const isSubmitting = ref(false);

watch(name, (newName) => {
  if (!slug.value || slug.value === toSlug(name.value)) {
    slug.value = toSlug(newName);
  }
});

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function addCategory() {
  priceCategories.value.push({ name: "", price: null, rows: "", seats_per_row: null });
}

function removeCategory(index: number) {
  priceCategories.value.splice(index, 1);
}

async function submit() {
  slugError.value = null;
  serverErrors.value = {};
  isSubmitting.value = true;

  const payload = {
    name: name.value,
    slug: slug.value || undefined,
    description: description.value || undefined,
    date: date.value,
    venue: venue.value,
    price_categories: priceCategories.value.map((cat) => ({
      name: cat.name,
      price: cat.price,
      rows: cat.rows.split(",").map((r) => r.trim()).filter(Boolean),
      seats_per_row: cat.seats_per_row,
    })),
  };

  try {
    await $fetch("/api/admin/events", {
      method: "POST",
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: payload,
    });
    await router.push("/admin/events");
  } catch (err: any) {
    if (err?.response?.status === 409) {
      slugError.value = "Slug already exists";
    } else if (err?.response?.status === 422) {
      serverErrors.value = err?.data?.errors ?? {};
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="new-event">
    <h1>Nou Esdeveniment</h1>

    <form @submit.prevent="submit">
      <div class="field">
        <label for="name">Nom *</label>
        <input id="name" v-model="name" type="text" required />
        <span v-if="serverErrors.name" class="error">{{ serverErrors.name[0] }}</span>
      </div>

      <div class="field">
        <label for="slug">Slug</label>
        <input id="slug" v-model="slug" type="text" />
        <span v-if="slugError" class="error slug-error">{{ slugError }}</span>
        <span v-if="serverErrors.slug" class="error">{{ serverErrors.slug[0] }}</span>
      </div>

      <div class="field">
        <label for="description">Descripció</label>
        <textarea id="description" v-model="description" />
      </div>

      <div class="field">
        <label for="date">Data i hora *</label>
        <input id="date" v-model="date" type="datetime-local" required />
        <span v-if="serverErrors.date" class="error">{{ serverErrors.date[0] }}</span>
      </div>

      <div class="field">
        <label for="venue">Recinte *</label>
        <input id="venue" v-model="venue" type="text" required />
        <span v-if="serverErrors.venue" class="error">{{ serverErrors.venue[0] }}</span>
      </div>

      <section class="categories">
        <h2>Categories de preu</h2>

        <div
          v-for="(cat, index) in priceCategories"
          :key="index"
          class="category"
        >
          <div class="field">
            <label>Nom de la categoria *</label>
            <input v-model="cat.name" type="text" required />
          </div>
          <div class="field">
            <label>Preu (€) *</label>
            <input v-model.number="cat.price" type="number" min="0" step="0.01" required />
          </div>
          <div class="field">
            <label>Files (separades per comes, ex: A,B,C) *</label>
            <input v-model="cat.rows" type="text" required placeholder="A,B,C" />
          </div>
          <div class="field">
            <label>Seients per fila *</label>
            <input v-model.number="cat.seats_per_row" type="number" min="1" required />
          </div>
          <button
            v-if="priceCategories.length > 1"
            type="button"
            class="btn-remove"
            @click="removeCategory(index)"
          >
            Eliminar categoria
          </button>
        </div>

        <button type="button" class="btn-add" @click="addCategory">
          + Afegir categoria
        </button>
      </section>

      <div class="actions">
        <NuxtLink to="/admin/events">Cancel·lar</NuxtLink>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Creant..." : "Crear Esdeveniment" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.new-event {
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
.categories {
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.category {
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}
.btn-add {
  margin-top: 0.5rem;
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
.btn-remove {
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
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
