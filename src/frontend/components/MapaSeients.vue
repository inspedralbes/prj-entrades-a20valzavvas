<script setup lang="ts">
import { useSeientStore } from "~/stores/seients";

const seients = useSeientStore();

const files = computed(() => {
  const result: Array<{
    fila: string;
    seats: ReturnType<typeof seients.seientsPerFila.get>;
  }> = [];
  const keys = Array.from(seients.seientsPerFila.keys()).sort();
  for (const fila of keys) {
    result.push({ fila, seats: seients.seientsPerFila.get(fila) });
  }
  return result;
});
</script>

<template>
  <div class="mapa-seients-wrapper">
    <div class="mapa-seients">
      <div v-for="fila in files" :key="fila.fila" class="mapa-fila">
        <span class="fila-label">{{ fila.fila }}</span>
        <Seient v-for="seat in fila.seats" :key="seat.id" :seat="seat" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mapa-seients-wrapper {
  overflow-x: auto;
  width: 100%;
}

.mapa-seients {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: max-content;
  padding: 1rem;
}

.mapa-fila {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.fila-label {
  width: 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-align: center;
  flex-shrink: 0;
}
</style>
