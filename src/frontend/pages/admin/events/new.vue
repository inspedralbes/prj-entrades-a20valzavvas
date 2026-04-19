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
const maxSeientPerUsuari = ref<number>(4);
const priceCategories = ref<PriceCategory[]>([
  { name: "", price: null, rows: "", seats_per_row: null },
]);

const slugError = ref<string | null>(null);
const serverErrors = ref<Record<string, string[]>>({});
const isSubmitting = ref(false);

/** Returns a Set of row letters that appear in more than one category */
const overlappingRows = computed<Set<string>>(() => {
  const seen = new Map<string, number>(); // row → category index first seen
  const duplicates = new Set<string>();
  priceCategories.value.forEach((cat, catIdx) => {
    const rows = cat.rows
      .split(",")
      .map((r) => r.trim().toUpperCase())
      .filter(Boolean);
    for (const row of rows) {
      if (seen.has(row) && seen.get(row) !== catIdx) {
        duplicates.add(row);
      } else {
        seen.set(row, catIdx);
      }
    }
  });
  return duplicates;
});

/** Returns the overlapping rows that belong to the given category */
function overlapsForCategory(cat: PriceCategory): string[] {
  const rows = cat.rows
    .split(",")
    .map((r) => r.trim().toUpperCase())
    .filter(Boolean);
  return rows.filter((r) => overlappingRows.value.has(r));
}

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
  priceCategories.value.push({
    name: "",
    price: null,
    rows: "",
    seats_per_row: null,
  });
}

function removeCategory(index: number) {
  priceCategories.value.splice(index, 1);
}

async function submit() {
  slugError.value = null;
  serverErrors.value = {};

  if (overlappingRows.value.size > 0) {
    return; // blocked by inline validation
  }

  isSubmitting.value = true;

  const payload = {
    name: name.value,
    slug: slug.value || undefined,
    description: description.value || undefined,
    date: date.value,
    venue: venue.value,
    max_seients_per_usuari: maxSeientPerUsuari.value,
    price_categories: priceCategories.value.map((cat) => ({
      name: cat.name,
      price: cat.price,
      rows: cat.rows
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
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
      <h1 class="admin-form-title">Nou Esdeveniment</h1>
    </header>

    <form @submit.prevent="submit" novalidate>
      <!-- General info card -->
      <div class="form-card">
        <h2 class="form-card-title">Informació general</h2>

        <div class="field">
          <label for="name">Nom *</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            :class="{ 'input-error': serverErrors.name }"
          />
          <span v-if="serverErrors.name" class="error-message">{{
            serverErrors.name[0]
          }}</span>
        </div>

        <div class="field">
          <label for="slug">Slug</label>
          <input
            id="slug"
            v-model="slug"
            type="text"
            :class="{ 'input-error': slugError || serverErrors.slug }"
          />
          <span v-if="slugError" class="error-message slug-error">{{ slugError }}</span>
          <span v-else-if="serverErrors.slug" class="error-message">{{
            serverErrors.slug[0]
          }}</span>
          <span class="field-hint"
            >S'autogenera a partir del nom. Identificador únic de l'URL.</span
          >
        </div>

        <div class="field">
          <label for="description">Descripció</label>
          <textarea id="description" v-model="description" rows="3" />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="date">Data i hora *</label>
            <input
              id="date"
              v-model="date"
              type="datetime-local"
              required
              :class="{ 'input-error': serverErrors.date }"
            />
            <span v-if="serverErrors.date" class="error-message">{{
              serverErrors.date[0]
            }}</span>
          </div>

          <div class="field">
            <label for="venue">Recinte *</label>
            <input
              id="venue"
              v-model="venue"
              type="text"
              required
              :class="{ 'input-error': serverErrors.venue }"
            />
            <span v-if="serverErrors.venue" class="error-message">{{
              serverErrors.venue[0]
            }}</span>
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
            :class="{ 'input-error': serverErrors.max_seients_per_usuari }"
          />
          <span
            v-if="serverErrors.max_seients_per_usuari"
            class="error-message"
          >
            {{ serverErrors.max_seients_per_usuari[0] }}
          </span>
        </div>
      </div>

      <!-- Categories card -->
      <div class="form-card">
        <div class="categories-header">
          <h2 class="form-card-title">Categories de preu</h2>
          <button type="button" class="btn-add-category" @click="addCategory">
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Afegir categoria
          </button>
        </div>

        <div
          v-for="(cat, index) in priceCategories"
          :key="index"
          class="category-block"
        >
          <div class="category-block-header">
            <span class="category-index">Categoria {{ index + 1 }}</span>
            <button
              v-if="priceCategories.length > 1"
              type="button"
              class="btn-remove-category"
              :aria-label="`Eliminar categoria ${index + 1}`"
              @click="removeCategory(index)"
            >
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
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              Eliminar
            </button>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Nom *</label>
              <input
                v-model="cat.name"
                type="text"
                required
                placeholder="ex: General, VIP..."
              />
            </div>
            <div class="field field--narrow">
              <label>Preu (€) *</label>
              <input
                v-model.number="cat.price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="25.00"
              />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Files *</label>
              <input
                v-model="cat.rows"
                type="text"
                required
                placeholder="A,B,C"
                :class="{ 'input-error': overlapsForCategory(cat).length > 0 }"
              />
              <span
                v-if="overlapsForCategory(cat).length > 0"
                class="error-message"
              >
                Les files
                <strong>{{ overlapsForCategory(cat).join(", ") }}</strong> ja
                estan assignades a una altra categoria.
              </span>
              <span v-else class="field-hint">Separades per comes</span>
            </div>
            <div class="field field--narrow">
              <label>Seients per fila *</label>
              <input
                v-model.number="cat.seats_per_row"
                type="number"
                min="1"
                required
                placeholder="10"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <NuxtLink to="/admin/events" class="btn-cancel">Cancel·lar</NuxtLink>
        <button
          type="submit"
          class="btn-submit"
          :disabled="isSubmitting || overlappingRows.size > 0"
        >
          {{ isSubmitting ? "Creant..." : "Crear Esdeveniment" }}
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

/* Cards */
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
  color: var(--color-text-primary);
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

.field input.input-error,
.field textarea.input-error {
  border-color: var(--color-error);
}

/* datetime-local color fix */
.field input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
  cursor: pointer;
}

.error-message {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.field-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Categories */
.categories-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.categories-header .form-card-title {
  margin: 0;
}

.btn-add-category {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(124, 58, 237, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: 0.4rem 0.875rem;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.btn-add-category svg {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.btn-add-category:hover {
  background: rgba(124, 58, 237, 0.25);
  border-color: rgba(124, 58, 237, 0.5);
}

.category-block {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 0.875rem;
  background: var(--color-bg-surface);
}

.category-block:last-of-type {
  margin-bottom: 0;
}

.category-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.875rem;
}

.category-index {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.btn-remove-category {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(220, 38, 38, 0.1);
  color: #f87171;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  padding: 0.3rem 0.625rem;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.btn-remove-category svg {
  width: 0.875rem;
  height: 0.875rem;
}

.btn-remove-category:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.35);
}

/* Form actions */
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
