import { ref, onMounted, onUnmounted } from 'vue';
import type { StatsActualitzacioPayload } from '@shared/socket.types';
import { useAuthStore } from '~/stores/auth';

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

export function useAdminStats(eventId: string) {
  const stats = ref<StatsActualitzacioPayload>({ ...DEFAULT_STATS });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchInitialStats() {
    isLoading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      const data = await $fetch<StatsActualitzacioPayload>(`/api/admin/events/${eventId}/stats`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      stats.value = data;
    } catch {
      error.value = "No s'han pogut carregar les estadístiques";
    } finally {
      isLoading.value = false;
    }
  }

  function onStatsUpdate(payload: unknown) {
    stats.value = payload as StatsActualitzacioPayload;
  }

  function initSocket() {
    const { $socket } = useNuxtApp();
    const socket = $socket as {
      connected: boolean;
      connect: () => void;
      emit: (event: string, data: unknown) => void;
      on: (event: string, handler: (payload: unknown) => void) => void;
      off: (event: string, handler?: (payload: unknown) => void) => void;
    };
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('event:unir', { eventId });
    socket.on('stats:actualitzacio', onStatsUpdate);
    return socket;
  }

  onMounted(async () => {
    await fetchInitialStats();
    initSocket();
  });

  onUnmounted(() => {
    const { $socket } = useNuxtApp();
    const socket = $socket as {
      off: (event: string, handler?: (payload: unknown) => void) => void;
    };
    socket.off('stats:actualitzacio', onStatsUpdate);
  });

  return { stats, isLoading, error, fetchInitialStats, initSocket };
}
