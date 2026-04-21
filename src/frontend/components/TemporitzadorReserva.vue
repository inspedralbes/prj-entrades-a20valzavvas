<script setup lang="ts">
import { computed } from 'vue';
import { useReservaStore } from '~/stores/reserva';
import { useTemporitzador } from '~/composables/useTemporitzador';

const reserva = useReservaStore();
const { secondsLeft, isUrgent } = useTemporitzador();

const minuts = computed(() => String(Math.floor(secondsLeft.value / 60)).padStart(2, '0'));
const segons = computed(() => String(secondsLeft.value % 60).padStart(2, '0'));
</script>

<template>
  <div v-if="reserva.teReservaActiva" class="temporitzador">
    <div v-if="secondsLeft > 0" :class="['compte-enrere', { urgencia: isUrgent }]">
      <span class="etiqueta">Temps restant:</span>
      <span class="temps">{{ minuts }}:{{ segons }}</span>
    </div>
    <div v-else class="expiracio">La reserva ha expirat</div>
  </div>
</template>

<style scoped>
.temporitzador {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono, monospace);
}

.compte-enrere {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition:
    background 0.3s,
    border-color 0.3s;
}

.compte-enrere.urgencia {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.5);
}

.etiqueta {
  font-size: 0.8rem;
  color: #94a3b8;
}

.compte-enrere.urgencia .etiqueta {
  color: #fca5a5;
}

.temps {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #e2e8f0;
}

.compte-enrere.urgencia .temps {
  color: #ef4444;
}

.expiracio {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.5);
  font-size: 0.85rem;
  color: #fca5a5;
  font-weight: 500;
}
</style>
