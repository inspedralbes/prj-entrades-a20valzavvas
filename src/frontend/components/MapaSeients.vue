<script setup lang="ts">
import { useSeientStore } from "~/stores/seients";
import { useReservaStore } from "~/stores/reserva";
import type { SeatStateWithId } from "~/stores/seients";

const seients = useSeientStore();
const reserva = useReservaStore();
const { $socket } = useNuxtApp();

const files = computed(() => {
  const result: Array<{ fila: string; seats: SeatStateWithId[] }> = [];
  const keys = Array.from(seients.seientsPerFila.keys()).sort();
  for (const fila of keys) {
    const seats = seients.seientsPerFila.get(fila);
    if (seats) result.push({ fila, seats });
  }
  return result;
});

function curveOffset(globalIndex: number, total: number): number {
  if (total <= 2) return 0;
  const center = (total - 1) / 2;
  const distance = Math.abs(globalIndex - center) / center;
  return Math.round(distance * distance * 10);
}

function handleReservar(seatId: string) {
  if (reserva.limitAssolit) return;
  ($socket as { emit: (event: string, data: unknown) => void }).emit(
    "seient:reservar",
    { seatId },
  );
}
</script>

<template>
  <div class="cinema-wrapper">
    <!-- Pantalla -->
    <div class="cinema-screen-area">
      <div class="cinema-screen" />
      <p class="cinema-screen-label">PANTALLA</p>
      <div class="cinema-screen-glow" />
    </div>

    <!-- Mapa de seients -->
    <div class="mapa-scroll">
      <div class="mapa-seients">
        <div v-for="fila in files" :key="fila.fila" class="mapa-fila">
          <!-- Etiqueta esquerra -->
          <span class="fila-label">{{ fila.fila }}</span>

          <!-- Bloc esquerra -->
          <div class="fila-bloc">
            <span
              v-for="(seat, idx) in fila.seats.slice(
                0,
                Math.ceil(fila.seats.length / 2),
              )"
              :key="seat.id"
              class="seient-wrapper"
              :style="{
                transform: `translateY(${curveOffset(idx, fila.seats.length)}px)`,
              }"
            >
              <Seient :seat="seat" @reservar="handleReservar" />
            </span>
          </div>

          <!-- Passadís central -->
          <div class="passadis" />

          <!-- Bloc dreta -->
          <div class="fila-bloc">
            <span
              v-for="(seat, idx) in fila.seats.slice(
                Math.ceil(fila.seats.length / 2),
              )"
              :key="seat.id"
              class="seient-wrapper"
              :style="{
                transform: `translateY(${curveOffset(Math.ceil(fila.seats.length / 2) + idx, fila.seats.length)}px)`,
              }"
            >
              <Seient :seat="seat" @reservar="handleReservar" />
            </span>
          </div>

          <!-- Etiqueta dreta -->
          <span class="fila-label">{{ fila.fila }}</span>
        </div>
      </div>
    </div>

    <!-- Gradient de perspectiva inferior -->
    <div class="cinema-floor" />
  </div>
</template>

<style scoped>
/* ── Wrapper principal ── */
.cinema-wrapper {
  background: #0f0f23;
  border-radius: 14px;
  padding: 2rem 1.25rem 1.5rem;
  overflow: hidden;
  position: relative;
}

/* ── Pantalla ── */
.cinema-screen-area {
  text-align: center;
  margin-bottom: 2.5rem;
}

.cinema-screen {
  width: 58%;
  max-width: 440px;
  height: 5px;
  margin: 0 auto;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 15%,
    rgba(255, 255, 255, 0.75) 50%,
    rgba(255, 255, 255, 0.2) 85%,
    transparent 100%
  );
  border-radius: 2px;
  box-shadow:
    0 0 18px rgba(255, 255, 255, 0.3),
    0 0 50px rgba(255, 255, 255, 0.08);
}

.cinema-screen-label {
  margin: 0.45rem 0 0;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #4b5563;
  text-transform: uppercase;
}

.cinema-screen-glow {
  height: 50px;
  background: radial-gradient(
    ellipse 60% 100% at 50% 0%,
    rgba(255, 255, 255, 0.055) 0%,
    transparent 100%
  );
  margin-top: 0.2rem;
}

/* ── Mapa ── */
.mapa-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.mapa-seients {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: max-content;
  padding: 0 0.25rem 0.5rem;
}

.mapa-fila {
  display: flex;
  align-items: flex-end;
  gap: 0.35rem;
}

/* ── Etiquetes de fila ── */
.fila-label {
  width: 1.1rem;
  font-size: 0.6rem;
  font-weight: 700;
  color: #374151;
  text-align: center;
  flex-shrink: 0;
  padding-bottom: 0.15rem;
  font-variant-numeric: tabular-nums;
}

/* ── Blocs i passadís ── */
.fila-bloc {
  display: flex;
  gap: 0.35rem;
  align-items: flex-end;
}

.seient-wrapper {
  display: inline-flex;
}

.passadis {
  width: 1.5rem;
  flex-shrink: 0;
}

/* ── Gradient de terra ── */
.cinema-floor {
  height: 20px;
  margin-top: 1rem;
  background: radial-gradient(
    ellipse 50% 100% at 50% 100%,
    rgba(99, 102, 241, 0.06) 0%,
    transparent 100%
  );
}
</style>
