<script setup lang="ts">
import { useSeientStore } from "~/stores/seients";

definePageMeta({ ssr: false });

const route = useRoute();
const seients = useSeientStore();

onMounted(async () => {
  await seients.inicialitzar(route.params.slug as string);
});
</script>

<template>
  <div class="event-page">
    <!-- Llegenda always visible -->
    <LlegendaEstats />

    <!-- Event info header -->
    <div v-if="seients.event" class="event-header">
      <h1 class="event-nom">
        {{ seients.event.nom }}
      </h1>
      <p class="event-meta">
        {{ seients.event.data }} · {{ seients.event.recinte }}
      </p>
    </div>

    <!-- Loading state -->
    <div
      v-if="seients.isLoading"
      class="event-loading"
      role="status"
      aria-label="Carregant el mapa de seients..."
    >
      <div class="skeleton-grid">
        <div v-for="n in 40" :key="n" class="skeleton-seat" />
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="seients.error" class="event-error">
      <NotificacioEstat :missatge="seients.error" tipus="error" />
      <NuxtLink to="/" class="btn-tornar"> Tornar a la portada </NuxtLink>
    </div>

    <!-- Seat map -->
    <MapaSeients v-else />
  </div>
</template>

<style scoped>
.event-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
}

.event-header {
  margin-bottom: 1rem;
}

.event-nom {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.event-meta {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.event-loading {
  padding: 1rem;
}

.skeleton-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.skeleton-seat {
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  background-color: #e5e7eb;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.event-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
}

.btn-tornar {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #374151;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-tornar:hover {
  background-color: #1f2937;
}
</style>
