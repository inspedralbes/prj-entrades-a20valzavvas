<script setup lang="ts">
import { EstatSeient } from "@shared/seat.types";
import type { SeatStateWithId } from "~/stores/seients";

const props = withDefaults(
  defineProps<{
    seat: SeatStateWithId;
    miSeat?: boolean;
  }>(),
  {
    miSeat: false,
  },
);

const cssClass = computed(() => {
  if (props.miSeat) return "seient--seleccionat-per-mi";
  switch (props.seat.estat) {
    case EstatSeient.DISPONIBLE:
      return "seient--disponible";
    case EstatSeient.RESERVAT:
      return "seient--reservat";
    case EstatSeient.VENUT:
      return "seient--venut";
    default:
      return "seient--disponible";
  }
});
</script>

<template>
  <button
    type="button"
    class="seient"
    :class="cssClass"
    :aria-label="`Seient ${seat.fila}${seat.numero}`"
    :disabled="
      seat.estat === EstatSeient.VENUT || seat.estat === EstatSeient.RESERVAT
    "
  >
    {{ seat.numero }}
  </button>
</template>

<style scoped>
.seient {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}

.seient:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.seient--disponible {
  background-color: #16a34a;
  color: #fff;
}

.seient--reservat {
  background-color: #d97706;
  color: #fff;
}

.seient--seleccionat-per-mi {
  background-color: #7c3aed;
  color: #fff;
}

.seient--venut {
  background-color: #374151;
  color: #9ca3af;
}
</style>
