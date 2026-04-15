<script setup lang="ts">
import { EstatSeient } from "@shared/seat.types";
import type { SeatStateWithId } from "~/stores/seients";

const props = withDefaults(
  defineProps<{
    seat: SeatStateWithId;
    miSeat?: boolean;
    categoryName?: string;
  }>(),
  {
    miSeat: false,
    categoryName: undefined,
  },
);

const emit = defineEmits<{
  reservar: [seatId: string];
  alliberar: [seatId: string];
}>();

const isVip = computed(
  () => props.categoryName?.toLowerCase() === "vip",
);

const cssClass = computed(() => {
  if (props.miSeat) return "seient--seleccionat-per-mi";
  switch (props.seat.estat) {
    case EstatSeient.DISPONIBLE:
      return isVip.value ? "seient--vip" : "seient--disponible";
    case EstatSeient.RESERVAT:
      return "seient--reservat";
    case EstatSeient.VENUT:
      return "seient--venut";
    default:
      return "seient--disponible";
  }
});

function handleClick() {
  if (props.miSeat) {
    emit("alliberar", props.seat.id);
    return;
  }
  if (props.seat.estat !== EstatSeient.DISPONIBLE) return;
  emit("reservar", props.seat.id);
}
</script>

<template>
  <button
    type="button"
    class="seient"
    :class="cssClass"
    :aria-label="`Seient ${seat.fila}${seat.numero}${categoryName ? ` — ${categoryName}` : ''}`"
    :title="categoryName ? `${categoryName} · ${seat.preu.toFixed(2)} €` : undefined"
    :disabled="
      seat.estat === EstatSeient.VENUT ||
      (seat.estat === EstatSeient.RESERVAT && !miSeat)
    "
    @click="handleClick"
  >
    {{ seat.numero }}
  </button>
</template>

<style scoped>
.seient {
  width: 2rem;
  height: 1.85rem;
  border: none;
  border-radius: 5px 5px 2px 2px;
  font-size: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
  position: relative;
  outline: none;
}

.seient:focus-visible {
  outline: 2px solid #a78bfa;
  outline-offset: 2px;
}

/* ── Disponible ── */
.seient--disponible {
  background-color: #15803d;
  color: #bbf7d0;
}

.seient--disponible:hover {
  transform: scale(1.12) translateY(-2px);
  box-shadow: 0 0 10px rgba(22, 163, 74, 0.75);
  background-color: #16a34a;
}

/* ── VIP (disponible) ── */
.seient--vip {
  background-color: #b8860b;
  color: #fff8e7;
  box-shadow: 0 0 6px rgba(184, 134, 11, 0.4);
}

.seient--vip:hover {
  transform: scale(1.12) translateY(-2px);
  background-color: #daa520;
  box-shadow: 0 0 14px rgba(218, 165, 32, 0.65);
}

/* ── Reservat ── */
.seient--reservat {
  background-color: #b45309;
  color: #fde68a;
  cursor: not-allowed;
  opacity: 0.85;
}

/* ── Seleccionat per mi ── */
.seient--seleccionat-per-mi {
  background-color: #7c3aed;
  color: #ede9fe;
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.65);
}

.seient--seleccionat-per-mi:hover {
  transform: scale(1.08) translateY(-1px);
  box-shadow: 0 0 14px rgba(124, 58, 237, 0.85);
}

/* ── Venut ── */
.seient--venut {
  background-color: #1a2235;
  color: #2d3748;
  cursor: not-allowed;
}
</style>
