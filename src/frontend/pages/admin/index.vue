<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import type { StatsActualitzacioPayload } from '@shared/socket.types';

definePageMeta({ middleware: 'admin', ssr: false });

interface AdminEvent {
  id: string;
  nom: string;
  data: string;
  hora: string;
  recinte: string;
  publicat: boolean;
}

interface CategoryReportRow {
  category_id: string;
  event_nom: string;
  nom: string;
  preu: string;
  total_seients: number;
  seients_venuts: number;
  percentatge_ocupacio: number;
  recaptacio: string;
}

const DEFAULT_STATS: StatsActualitzacioPayload = {
  disponibles: 0,
  reservats: 0,
  venuts: 0,
  totalSeients: 0,
  percentatgeVenuts: 0,
  percentatgeReservats: 0,
  usuaris: 0,
  reservesActives: 0,
  recaptacioTotal: 0,
};

const authStore = useAuthStore();

const { data: events, pending: eventsPending } = useFetch<AdminEvent[]>('/api/admin/events', {
  headers: { Authorization: `Bearer ${authStore.token}` },
});

const selectedEventId = ref<string | null>(null);
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const selectedEvent = computed(() => events.value?.find((e) => e.id === selectedEventId.value));

function selectEvent(id: string) {
  selectedEventId.value = id;
  isDropdownOpen.value = false;
}

function handleOutsideClick(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false;
  }
}

const stats = ref<StatsActualitzacioPayload>({ ...DEFAULT_STATS });
const isLoading = ref(false);
const statsError = ref<string | null>(null);

async function loadStats(eventId: string) {
  isLoading.value = true;
  statsError.value = null;
  try {
    const data = await $fetch<StatsActualitzacioPayload>(`/api/admin/events/${eventId}/stats`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
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

watch(
  events,
  (list) => {
    if (list && list.length > 0 && !selectedEventId.value) {
      selectedEventId.value = list[0].id;
    }
  },
  { immediate: true },
);

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
  socket.on('stats:actualitzacio', onStatsUpdate);
  document.addEventListener('click', handleOutsideClick);
  loadReports();
});

onUnmounted(() => {
  const { $socket } = useNuxtApp();
  const socket = $socket as {
    off: (event: string, handler?: (p: unknown) => void) => void;
  };
  socket.off('stats:actualitzacio', onStatsUpdate);
  document.removeEventListener('click', handleOutsideClick);
});

watch(selectedEventId, (id) => {
  if (!id) return;
  const { $socket } = useNuxtApp();
  const socket = $socket as { emit: (event: string, data: unknown) => void };
  socket.emit('event:unir', { eventId: id });
});

function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(amount));
}

const reports = ref<CategoryReportRow[]>([]);
const reportsPending = ref(false);
const reportsError = ref<string | null>(null);

async function loadReports() {
  reportsPending.value = true;
  reportsError.value = null;
  try {
    const data = await $fetch<CategoryReportRow[]>('/api/admin/reports', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    reports.value = data;
  } catch {
    reportsError.value = "No s'han pogut carregar els informes";
  } finally {
    reportsPending.value = false;
  }
}
</script>

<template>
  <div class="admin-dashboard">
    <!-- Real-time dashboard section -->
    <section class="dashboard-section">
      <header class="admin-header">
        <h1 class="admin-title">Dashboard en temps real</h1>

        <div
          v-if="!eventsPending && events && events.length > 0"
          ref="dropdownRef"
          class="event-selector"
        >
          <span class="selector-label">Esdeveniment:</span>
          <button
            type="button"
            class="selector-trigger"
            :aria-expanded="isDropdownOpen"
            aria-haspopup="listbox"
            @click.stop="isDropdownOpen = !isDropdownOpen"
          >
            <span class="selector-trigger__text">
              {{ selectedEvent ? `${selectedEvent.nom} — ${selectedEvent.data}` : '—' }}
            </span>
            <svg
              class="selector-trigger__chevron"
              :class="{ 'is-open': isDropdownOpen }"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <Transition name="dropdown">
            <ul
              v-if="isDropdownOpen"
              class="selector-list"
              role="listbox"
              aria-label="Selecciona un esdeveniment"
            >
              <li
                v-for="event in events"
                :key="event.id"
                role="option"
                class="selector-option"
                :class="{ 'is-active': event.id === selectedEventId }"
                :aria-selected="event.id === selectedEventId"
                @click.stop="selectEvent(event.id)"
              >
                <span>{{ event.nom }} — {{ event.data }}</span>
                <svg
                  v-if="event.id === selectedEventId"
                  class="selector-option__check"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </li>
            </ul>
          </Transition>
        </div>
      </header>

      <div v-if="eventsPending" class="state-message">Carregant esdeveniments…</div>

      <div v-else-if="!events || events.length === 0" class="state-message">
        No hi ha esdeveniments disponibles.
      </div>

      <Transition v-else-if="selectedEventId" name="fade-stats" mode="out-in">
        <div v-if="isLoading" key="loading" class="state-message">Carregant estadístiques…</div>

        <div v-else-if="statsError" key="error" class="state-message state-message--error">
          {{ statsError }}
        </div>

        <div v-else-if="stats" :key="selectedEventId" class="stats-block">
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Disponibles</span>
              <span class="stat-value disponible">{{ stats.disponibles }}</span>
              <span class="stat-sub">/ {{ stats.totalSeients }}</span>
            </div>

            <div class="stat-card">
              <span class="stat-label">Reservats</span>
              <span class="stat-value reservat">{{ stats.reservats }}</span>
              <span class="stat-sub">({{ stats.percentatgeReservats }}%)</span>
            </div>

            <div class="stat-card">
              <span class="stat-label">Venuts</span>
              <span class="stat-value venut">{{ stats.venuts }}</span>
              <span class="stat-sub">({{ stats.percentatgeVenuts }}%)</span>
            </div>

            <div class="stat-card">
              <span class="stat-label">Usuaris connectats</span>
              <span class="stat-value">{{ stats.usuaris }}</span>
            </div>

            <div class="stat-card">
              <span class="stat-label">Reserves actives</span>
              <span class="stat-value">{{ stats.reservesActives }}</span>
            </div>

            <div class="stat-card stat-card--highlight">
              <span class="stat-label">Recaptació total</span>
              <span class="stat-value recaptacio">{{ formatCurrency(stats.recaptacioTotal) }}</span>
            </div>
          </div>

          <div v-if="stats.totalSeients > 0" class="progress-bar-wrapper">
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
              <span class="dot dot--venut" /> Venuts <span class="dot dot--reservat" /> Reservats
              <span class="dot dot--disponible" /> Disponibles
            </p>
          </div>
        </div>
      </Transition>
    </section>

    <!-- Sales report section -->
    <section class="reports-section">
      <header class="admin-header">
        <h2 class="admin-title">Informe de vendes per categoria</h2>
      </header>

      <div v-if="reportsPending" class="state-message">Carregant informes…</div>

      <div v-else-if="reportsError" class="state-message state-message--error">
        {{ reportsError }}
      </div>

      <div v-else-if="reports.length === 0" class="state-message">
        No hi ha dades d'informes disponibles.
      </div>

      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Esdeveniment</th>
              <th class="text-right">Preu</th>
              <th class="text-right">Total seients</th>
              <th class="text-right">Venuts</th>
              <th class="text-right">% Ocupació</th>
              <th class="text-right">Recaptació</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in reports" :key="row.category_id" class="data-table__row">
              <td class="col-primary">{{ row.nom }}</td>
              <td>{{ row.event_nom }}</td>
              <td class="text-right">{{ formatCurrency(row.preu) }}</td>
              <td class="text-right">{{ row.total_seients }}</td>
              <td class="text-right">{{ row.seients_venuts }}</td>
              <td class="text-right">{{ row.percentatge_ocupacio }}%</td>
              <td class="text-right col-recaptacio">
                {{ formatCurrency(row.recaptacio) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Page container ─────────────────────────────────────── */
.admin-dashboard {
  min-height: 100dvh;
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  padding: 2rem 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
}

/* ── Section layout ─────────────────────────────────────── */
.dashboard-section {
  margin-bottom: 3rem;
}

.reports-section {
  padding-top: 2.5rem;
  border-top: 1px solid var(--color-border);
}

/* ── Header (matches events/index.vue) ──────────────────── */
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

/* ── Event selector (custom dropdown) ───────────────────── */
.event-selector {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selector-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.selector-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.375rem 0.625rem 0.375rem 0.75rem;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
  max-width: 280px;
}

.selector-trigger:hover {
  border-color: var(--color-border-focus);
}

.selector-trigger:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.selector-trigger__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.selector-trigger__chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.selector-trigger__chevron.is-open {
  transform: rotate(180deg);
}

.selector-list {
  position: absolute;
  top: calc(100% + 0.375rem);
  right: 0;
  z-index: 50;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  min-width: 220px;
  max-width: 340px;
  max-height: 240px;
  overflow-y: auto;
  padding: 0.25rem;
  list-style: none;
  margin: 0;
}

.selector-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background 0.15s;
  color: var(--color-text-primary);
}

.selector-option:hover {
  background: var(--color-bg-card-hover);
}

.selector-option.is-active {
  background: var(--color-accent-primary);
  color: #fff;
}

.selector-option.is-active:hover {
  background: var(--color-accent-primary-hover);
}

.selector-option__check {
  flex-shrink: 0;
}

/* ── Dropdown open/close transition ─────────────────────── */
.dropdown-enter-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Stats panel fade transition ─────────────────────────── */
.fade-stats-enter-active,
.fade-stats-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-stats-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-stats-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── State messages (matches events/index.vue) ──────────── */
.state-message {
  color: var(--color-text-secondary);
  padding: 2rem 0;
  font-size: var(--font-size-sm);
}

.state-message--error {
  color: var(--color-error);
}

/* ── Stats grid ─────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-card--highlight {
  border-color: var(--color-accent-primary);
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.stat-value.disponible {
  color: var(--color-success);
}
.stat-value.reservat {
  color: var(--color-warning);
}
.stat-value.venut {
  color: var(--color-error);
}
.stat-value.recaptacio {
  color: var(--color-accent-primary);
}

.stat-sub {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* ── Progress bar ───────────────────────────────────────── */
.progress-bar-wrapper {
  margin-top: 1rem;
}

.progress-bar {
  height: 12px;
  border-radius: 6px;
  background: var(--color-bg-card);
  overflow: hidden;
  display: flex;
}

.progress-segment.venut {
  background: var(--color-error);
  transition: width 0.4s ease;
}

.progress-segment.reservat {
  background: var(--color-warning);
  transition: width 0.4s ease;
}

.progress-legend {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
  align-items: center;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.25rem;
  flex-shrink: 0;
}

.dot--venut {
  background: var(--color-error);
}
.dot--reservat {
  background: var(--color-warning);
}
.dot--disponible {
  background: var(--color-success);
}

/* ── Table card (matches events/index.vue) ──────────────── */
.table-wrapper {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table thead th {
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table__row:hover td {
  background: var(--color-bg-card-hover);
  transition: background 0.15s;
}

.text-right {
  text-align: right;
}

.col-primary {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.col-recaptacio {
  color: var(--color-accent-primary);
  font-weight: var(--font-weight-medium);
}
</style>
