<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ middleware: "admin", ssr: false });

interface AdminEvent {
  id: string;
  nom: string;
  data: string;
  hora: string;
  recinte: string;
  publicat: boolean;
  seients_disponibles: number;
  seients_reservats: number;
  seients_venuts: number;
}

const authStore = useAuthStore();

const {
  data: events,
  pending,
  error,
} = useFetch<AdminEvent[]>("/api/admin/events", {
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
});

const deleteModal = reactive({
  open: false,
  eventId: "",
  eventName: "",
  error: "",
});

function openDeleteModal(event: AdminEvent) {
  deleteModal.eventId = event.id;
  deleteModal.eventName = event.nom;
  deleteModal.error = "";
  deleteModal.open = true;
}

function closeDeleteModal() {
  deleteModal.open = false;
  deleteModal.error = "";
}

async function confirmDelete() {
  deleteModal.error = "";
  try {
    await $fetch(`/api/admin/events/${deleteModal.eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (events.value) {
      events.value = events.value.filter((e) => e.id !== deleteModal.eventId);
    }
    closeDeleteModal();
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 422) {
      deleteModal.error =
        "No es pot eliminar: l'event té reserves actives o compres associades";
    } else {
      deleteModal.error = "Error inesperat en eliminar l'event.";
    }
  }
}

const toggleError = ref("");

async function togglePublish(event: AdminEvent) {
  toggleError.value = "";
  try {
    const updated = await $fetch<{ published: boolean }>(
      `/api/admin/events/${event.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        body: { published: !event.publicat },
      },
    );
    event.publicat = updated.published;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    const code = (err as { data?: { code?: string } })?.data?.code;
    if (status === 422 && code === "has_sold_tickets") {
      toggleError.value = "No es pot despublicar: l'event té entrades venudes.";
    } else {
      toggleError.value = "Error en canviar l'estat de publicació de l'event.";
    }
  }
}
</script>

<template>
  <div class="admin-events">
    <header class="admin-header">
      <h1 class="admin-title">Esdeveniments</h1>
      <NuxtLink to="/admin/events/new" class="btn-new">
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
        Nou event
      </NuxtLink>
    </header>

    <div v-if="pending" class="state-message">Carregant...</div>
    <div v-else-if="error" class="state-message state-message--error">
      Error en carregar els esdeveniments.
    </div>

    <div v-else class="table-wrapper">
      <table class="events-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Data</th>
            <th>Hora</th>
            <th>Recinte</th>
            <th>Estat</th>
            <th class="text-right">Disponibles</th>
            <th class="text-right">Reservats</th>
            <th class="text-right">Venuts</th>
            <th>Accions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event.id" class="events-table__row">
            <td class="col-nom">{{ event.nom }}</td>
            <td>{{ event.data }}</td>
            <td>{{ event.hora }}</td>
            <td>{{ event.recinte }}</td>
            <td>
              <span
                :class="
                  event.publicat
                    ? 'badge badge--published'
                    : 'badge badge--draft'
                "
              >
                {{ event.publicat ? "Publicat" : "Esborrany" }}
              </span>
            </td>
            <td class="text-right">{{ event.seients_disponibles }}</td>
            <td class="text-right">{{ event.seients_reservats }}</td>
            <td class="text-right">{{ event.seients_venuts }}</td>
            <td>
              <div class="row-actions">
                <NuxtLink
                  :to="`/admin/events/${event.id}`"
                  class="btn-action btn-action--edit"
                >
                  Editar
                </NuxtLink>
                <button
                  type="button"
                  class="btn-action btn-action--publish"
                  @click="togglePublish(event)"
                >
                  {{ event.publicat ? "Despublicar" : "Publicar" }}
                </button>
                <button
                  type="button"
                  class="btn-action btn-action--delete"
                  @click="openDeleteModal(event)"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="toggleError" class="toggle-error" role="alert">
      {{ toggleError }}
    </p>

    <div
      v-if="deleteModal.open"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      @click.self="closeDeleteModal"
    >
      <div class="modal">
        <h2 id="modal-title" class="modal-title">Eliminar event</h2>
        <p class="modal-body">
          Segur que vols eliminar
          <strong class="modal-event-name">{{ deleteModal.eventName }}</strong
          >? Aquesta acció no es pot desfer.
        </p>
        <p v-if="deleteModal.error" class="modal-error" role="alert">
          {{ deleteModal.error }}
        </p>
        <div class="modal-actions">
          <button
            type="button"
            class="btn-action btn-action--delete"
            @click="confirmDelete"
          >
            Confirmar
          </button>
          <button
            type="button"
            class="btn-action btn-action--cancel"
            @click="closeDeleteModal"
          >
            Cancel·lar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-events {
  min-height: 100dvh;
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  padding: 2rem 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
}

/* Header */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
}

.admin-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--color-accent-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: 0.5rem 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-new svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.btn-new:hover {
  background: var(--color-accent-primary-hover);
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

/* Table */
.table-wrapper {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  overflow-x: auto;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

.events-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  letter-spacing: 0.03em;
}

.events-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: middle;
}

.events-table__row:last-child td {
  border-bottom: none;
}

.events-table__row:hover td {
  background: var(--color-bg-card-hover);
}

.col-nom {
  font-weight: var(--font-weight-medium);
  white-space: normal;
  min-width: 180px;
}

.text-right {
  text-align: right;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.02em;
}

.badge--published {
  background: rgba(22, 163, 74, 0.15);
  color: #4ade80;
  border: 1px solid rgba(22, 163, 74, 0.3);
}

.badge--draft {
  background: rgba(217, 119, 6, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(217, 119, 6, 0.3);
}

/* Row actions */
.row-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
  white-space: nowrap;
}

.btn-action--edit {
  background: rgba(124, 58, 237, 0.15);
  color: #a78bfa;
  border-color: rgba(124, 58, 237, 0.3);
}

.btn-action--edit:hover {
  background: rgba(124, 58, 237, 0.25);
  border-color: rgba(124, 58, 237, 0.5);
}

.btn-action--publish {
  background: rgba(22, 163, 74, 0.12);
  color: #4ade80;
  border-color: rgba(22, 163, 74, 0.25);
}

.btn-action--publish:hover {
  background: rgba(22, 163, 74, 0.22);
  border-color: rgba(22, 163, 74, 0.4);
}

.btn-action--delete {
  background: rgba(220, 38, 38, 0.12);
  color: #f87171;
  border-color: rgba(220, 38, 38, 0.25);
}

.btn-action--delete:hover {
  background: rgba(220, 38, 38, 0.22);
  border-color: rgba(220, 38, 38, 0.4);
}

.btn-action--cancel {
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.btn-action--cancel:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-secondary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-card);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 0.75rem;
}

.modal-body {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 1rem;
  line-height: 1.6;
}

.modal-event-name {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.modal-error {
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--radius-md);
  color: #f87171;
  font-size: var(--font-size-sm);
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Toggle error */
.toggle-error {
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--radius-md);
  color: #f87171;
  font-size: var(--font-size-sm);
  padding: 0.5rem 0.75rem;
  margin-top: 1rem;
}
</style>
