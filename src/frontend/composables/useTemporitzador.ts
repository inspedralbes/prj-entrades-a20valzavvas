import { ref, computed, onUnmounted, watch } from "vue";
import { useReservaStore } from "~/stores/reserva";
import { useSeientStore } from "~/stores/seients";
import { EstatSeient } from "@shared/seat.types";

export function useTemporitzador() {
  const reserva = useReservaStore();
  const seients = useSeientStore();

  const secondsLeft = ref<number>(0);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function calcularSegonesRestants(): number {
    if (!reserva.expiraEn) return 0;
    const remaining = Math.floor(
      (new Date(reserva.expiraEn).getTime() - Date.now()) / 1000,
    );
    return Math.max(0, remaining);
  }

  function aturarInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function iniciarInterval() {
    aturarInterval();
    intervalId = setInterval(() => {
      secondsLeft.value = calcularSegonesRestants();
      if (secondsLeft.value === 0) {
        aturarInterval();
        for (const seatId of reserva.seatIds) {
          seients.actualitzarEstat(seatId, EstatSeient.DISPONIBLE);
        }
        reserva.netejarReserva();
      }
    }, 1000);
  }

  const isUrgent = computed(
    () => secondsLeft.value > 0 && secondsLeft.value <= 60,
  );

  // Watch expiraEn with immediate so the initial value is computed on setup
  watch(
    () => reserva.expiraEn,
    (newVal) => {
      aturarInterval();
      if (newVal) {
        secondsLeft.value = calcularSegonesRestants();
        if (secondsLeft.value > 0) {
          iniciarInterval();
        }
      } else {
        secondsLeft.value = 0;
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    aturarInterval();
  });

  return { secondsLeft, isUrgent };
}
