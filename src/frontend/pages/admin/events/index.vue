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
</script>

<template>
  <div class="admin-events">
    <h1>Esdeveniments</h1>

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
            <button type="button">Eliminar</button>
            <button type="button">
              {{ event.publicat ? "Despublicar" : "Publicar" }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
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
</style>
