<script setup lang="ts">
import { useSeientStore } from "~/stores/seients";
import { useConnexioStore } from "~/stores/connexio";
import { useReservaStore } from "~/stores/reserva";

definePageMeta({ ssr: false });

const route = useRoute();
const seients = useSeientStore();
const connexio = useConnexioStore();

const slug = route.params.slug as string;
const reserva = useReservaStore();

onMounted(async () => {
  connexio.inicialitzar();
  await seients.inicialitzar(slug);
  if (seients.event) {
    seients.connectar();
  }
});

onUnmounted(() => {
  seients.desconnectar();
});
</script>

<template>
  <div class="event-page">
    <div class="event-container">
      <!-- Barra superior: indicador de connexió i temporitzador -->
      <div class="event-topbar">
        <TemporitzadorReserva v-if="reserva.teReservaActiva" />
        <ConnexioIndicador />
      </div>

      <!-- Capçalera de l'event -->
      <div v-if="seients.event" class="event-header">
        <h1 class="event-nom">{{ seients.event.nom }}</h1>
        <p class="event-meta">
          {{ seients.event.data }} · {{ seients.event.recinte }}
        </p>
      </div>

      <!-- Llegenda -->
      <LlegendaEstats />

      <!-- Loading state -->
      <div
        v-if="seients.isLoading"
        class="event-loading"
        role="status"
        aria-label="Carregant el mapa de seients..."
      >
        <div class="skeleton-screen" />
        <div class="skeleton-grid">
          <div v-for="n in 60" :key="n" class="skeleton-seat" />
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="seients.error" class="event-error">
        <NotificacioEstat :missatge="seients.error" tipus="error" />
        <NuxtLink to="/" class="btn-tornar">Tornar a la portada</NuxtLink>
      </div>

      <!-- Seat map -->
      <MapaSeients v-else />
    </div>
  </div>
</template>

<style scoped>
/* ── Pàgina ── */
.event-page {
  background: #0f0f23;
  min-height: 100dvh;
  width: 100%;
}

.event-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2.5rem;
}

/* ── Barra superior ── */
.event-topbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

/* ── Capçalera ── */
.event-header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.event-nom {
  font-size: 1.6rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 0.35rem;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.event-meta {
  font-size: 0.88rem;
  color: #475569;
  margin: 0;
}

/* ── Loading skeleton ── */
.event-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 0;
}

.skeleton-screen {
  width: 50%;
  max-width: 320px;
  height: 4px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  border-radius: 2px;
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
  max-width: 640px;
}

.skeleton-seat {
  width: 2rem;
  height: 1.85rem;
  border-radius: 5px 5px 2px 2px;
  background-color: #1a2235;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* ── Error ── */
.event-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
}

.btn-tornar {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background-color: #312e81;
  color: #e0e7ff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s ease;
}

.btn-tornar:hover {
  background-color: #3730a3;
}
</style>
