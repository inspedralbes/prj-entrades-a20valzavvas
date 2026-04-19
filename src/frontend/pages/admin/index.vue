<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import type { StatsActualitzacioPayload } from "@shared/socket.types";

definePageMeta({ middleware: "admin", ssr: false });

interface AdminEvent {
  id: string;
  nom: string;
  data: string;
  hora: string;
  recinte: string;
  publicat: boolean;
}

const DEFAULT_STATS: StatsActualitzacioPayload = {
  disponibles: 0, reservats: 0, venuts: 0, totalSeients: 0,
  percentatgeVenuts: 0, percentatgeReservats: 0,
  usuaris: 0, reservesActives: 0, recaptacioTotal: 0,
};

const authStore = useAuthStore();

const { data: events, pending: eventsPending } = useFetch<AdminEvent[]>(
  "/api/admin/events",
  { headers: { Authorization: `Bearer ${authStore.token}` } },
);

const selectedEventId = ref<string | null>(null);
const stats = ref<StatsActualitzacioPayload>({ ...DEFAULT_STATS });
const isLoading = ref(false);
const statsError = ref<string | null>(null);

async function loadStats(eventId: string) {
  isLoading.value = true;
  statsError.value = null;
  try {
    const data = await $fetch<StatsActualitzacioPayload>(
      `/api/admin/events/${eventId}/stats`,
      { headers: { Authorization: `Bearer ${authStore.token}` } },
    );
    stats.value = data;
  } catch {
    statsError.value = "No s'han pogut carregar les estadístiques";
  } finally {
    isLoading.value = false;
  }
}

function onStatsUpdate(payload: unknown) {
  stats.value = payload as StatsActualitzacioPayload;
}

watch(events, (list) => {
  if (list && list.length > 0 && !selectedEventId.value) {
    selectedEventId.value = list[0].id;
  }
}, { immediate: true });

watch(selectedEventId, (id) => {
  if (id) loadStats(id);
});

onMounted(() => {
  const { $socket } = useNuxtApp();
  const socket = $socket as {
    connected: boolean;
    connect: () => void;
    emit: (event: string, data: unknown) => void;
    on: (event: string, handler: (payload: unknown) => void) => void;
  };
  if (!socket.connected) socket.connect();
  socket.on("stats:actualitzacio", onStatsUpdate);
});

onUnmounted(() => {
  const { $socket } = useNuxtApp();
  const socket = $socket as { off: (event: string, handler?: (p: unknown) => void) => void };
  socket.off("stats:actualitzacio", onStatsUpdate);
});

watch(selectedEventId, (id) => {
  if (!id) return;
  const { $socket } = useNuxtApp();
  const socket = $socket as { emit: (event: string, data: unknown) => void };
  socket.emit("event:unir", { eventId: id });
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ca-ES", { style: "currency", currency: "EUR" }).format(amount);
}
</script>

<template>
  <div class="page-dark">
    <header class="dashboard-header">
      <h1 class="dashboard-title">Dashboard en temps real</h1>

      <div v-if="!eventsPending && events && events.length > 0" class="event-selector">
        <label for="event-select" class="selector-label">Esdeveniment:</label>
        <select
          id="event-select"
          v-model="selectedEventId"
          class="selector-input"
        >
          <option v-for="event in events" :key="event.id" :value="event.id">
            {{ event.nom }} — {{ event.data }}
          </option>
        </select>
      </div>
    </header>

    <div v-if="eventsPending" class="status-msg">Carregant esdeveniments…</div>

    <div v-else-if="!events || events.length === 0" class="status-msg">
      No hi ha esdeveniments disponibles.
    </div>

    <template v-else-if="selectedEventId">
      <div v-if="isLoading" class="status-msg">Carregant estadístiques…</div>

      <div v-else-if="statsError" class="status-msg error">
        {{ statsError }}
      </div>

      <div v-else-if="stats" class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Disponibles</span>
          <span class="stat-value disponible">{{ stats.disponibles }}</span>
          <span class="stat-total">/ {{ stats.totalSeients }}</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">Reservats</span>
          <span class="stat-value reservat">{{ stats.reservats }}</span>
          <span class="stat-pct">({{ stats.percentatgeReservats }}%)</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">Venuts</span>
          <span class="stat-value venut">{{ stats.venuts }}</span>
          <span class="stat-pct">({{ stats.percentatgeVenuts }}%)</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">Usuaris connectats</span>
          <span class="stat-value">{{ stats.usuaris }}</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">Reserves actives</span>
          <span class="stat-value">{{ stats.reservesActives }}</span>
        </div>

        <div class="stat-card highlight">
          <span class="stat-label">Recaptació total</span>
          <span class="stat-value recaptacio">{{
            formatCurrency(stats.recaptacioTotal)
          }}</span>
        </div>
      </div>

      <div
        v-if="stats && stats.totalSeients > 0"
        class="progress-bar-wrapper"
      >
        <div class="progress-bar">
          <div
            class="progress-segment venut"
            :style="{ width: stats.percentatgeVenuts + '%' }"
          />
          <div
            class="progress-segment reservat"
            :style="{ width: stats.percentatgeReservats + '%' }"
          />
        </div>
        <p class="progress-legend">
          <span class="dot venut" /> Venuts
          <span class="dot reservat" /> Reservats
          <span class="dot disponible" /> Disponibles
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-dark {
  min-height: 100dvh;
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  padding: 1.5rem;
}

.dashboard-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  flex: 1;
}

.event-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selector-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #aaa);
}

.selector-input {
  background: var(--color-bg-surface, #1a1a2e);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border, #333);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-bg-surface, #1a1a2e);
  border: 1px solid var(--color-border, #333);
  border-radius: 0.75rem;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-card.highlight {
  border-color: var(--color-accent, #7c3aed);
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary, #aaa);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-value.disponible {
  color: var(--color-seat-available, #22c55e);
}

.stat-value.reservat {
  color: var(--color-seat-reserved, #f59e0b);
}

.stat-value.venut {
  color: var(--color-seat-sold, #ef4444);
}

.stat-value.recaptacio {
  color: var(--color-accent, #7c3aed);
}

.stat-pct,
.stat-total {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #aaa);
}

.progress-bar-wrapper {
  margin-top: 1rem;
}

.progress-bar {
  height: 12px;
  border-radius: 6px;
  background: var(--color-bg-surface, #1a1a2e);
  overflow: hidden;
  display: flex;
}

.progress-segment.venut {
  background: var(--color-seat-sold, #ef4444);
  transition: width 0.4s ease;
}

.progress-segment.reservat {
  background: var(--color-seat-reserved, #f59e0b);
  transition: width 0.4s ease;
}

.progress-legend {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary, #aaa);
  margin-top: 0.5rem;
  align-items: center;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.25rem;
}

.dot.venut {
  background: var(--color-seat-sold, #ef4444);
}

.dot.reservat {
  background: var(--color-seat-reserved, #f59e0b);
}

.dot.disponible {
  background: var(--color-seat-available, #22c55e);
}

.status-msg {
  color: var(--color-text-secondary, #aaa);
  font-size: 0.9rem;
  padding: 2rem 0;
}

.status-msg.error {
  color: var(--color-seat-sold, #ef4444);
}
</style>
