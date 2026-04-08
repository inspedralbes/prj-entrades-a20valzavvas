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
</script>

<template>
  <div class="admin-events">
    <header class="admin-header">
      <h1>Esdeveniments</h1>
      <button
        type="button"
        class="btn-logout"
        @click="
          () => {
            authStore.logout();
            navigateTo('/auth/login');
          }
        "
      >
        Tancar sessió
      </button>
    </header>

    <div v-if="pending">Carregant...</div>
    <div v-else-if="error">Error en carregar els esdeveniments.</div>
    <table v-else>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Data</th>
          <th>Hora</th>
          <th>Recinte</th>
          <th>Estat</th>
          <th>Disponibles</th>
          <th>Reservats</th>
          <th>Venuts</th>
          <th>Accions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in events" :key="event.id">
          <td>{{ event.nom }}</td>
          <td>{{ event.data }}</td>
          <td>{{ event.hora }}</td>
          <td>{{ event.recinte }}</td>
          <td>
            <span
              :class="
                event.publicat ? 'badge badge--published' : 'badge badge--draft'
              "
            >
              {{ event.publicat ? "Publicat" : "Esborrany" }}
            </span>
          </td>
          <td>{{ event.seients_disponibles }}</td>
          <td>{{ event.seients_reservats }}</td>
          <td>{{ event.seients_venuts }}</td>
          <td>
            <NuxtLink :to="`/admin/events/${event.id}`">Editar</NuxtLink>
            <button type="button" @click="openDeleteModal(event)">
              Eliminar
            </button>
            <button type="button">
              {{ event.publicat ? "Despublicar" : "Publicar" }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="deleteModal.open"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal">
        <p>
          Segur que vols eliminar <strong>{{ deleteModal.eventName }}</strong
          >?
        </p>
        <p v-if="deleteModal.error" class="modal-error" role="alert">
          {{ deleteModal.error }}
        </p>
        <div class="modal-actions">
          <button type="button" @click="confirmDelete">Confirmar</button>
          <button type="button" @click="closeDeleteModal">Cancel·lar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
}

.badge--published {
  background-color: #d1fae5;
  color: #065f46;
}

.badge--draft {
  background-color: #fef3c7;
  color: #92400e;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 320px;
}

.modal-error {
  color: #b91c1c;
  margin-top: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.admin-header h1 {
  margin: 0;
}

.btn-logout {
  padding: 0.4rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.btn-logout:hover {
  background: #f3f4f6;
}
</style>
