<script setup lang="ts">
import { useSeientStore } from '~/stores/seients';
import { useConnexioStore } from '~/stores/connexio';
import { useReservaStore } from '~/stores/reserva';
import { useAuthStore } from '~/stores/auth';

definePageMeta({ ssr: false });

const route = useRoute();
const seients = useSeientStore();
const connexio = useConnexioStore();
const authStore = useAuthStore();

const slug = route.params.slug as string;
const reserva = useReservaStore();

const esAdmin = computed(() => authStore.user?.role === 'admin');

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
    <!-- Conflict toast — always mounted so reserva:rebutjada toasts render at any time -->
    <NotificacioEstat />

    <div class="event-container">
      <!-- Barra superior: indicador de connexió i temporitzador -->
      <div class="event-topbar">
        <div v-if="reserva.teReservaActiva && !esAdmin" class="topbar-reserva">
          <TemporitzadorReserva />
          <NuxtLink to="/checkout" class="btn-checkout">
            Confirmar compra ({{ reserva.seatIds.length }})
          </NuxtLink>
        </div>
        <ConnexioIndicador />
      </div>

      <!-- Capçalera de l'event -->
      <div v-if="seients.event" class="event-header">
        <div v-if="seients.event.image_url" class="event-header__image">
          <img
            :src="seients.event.image_url"
            :alt="seients.event.nom"
            loading="lazy"
            class="event-header__img"
          />
        </div>
        <div class="event-header__info">
          <h1 class="event-nom">{{ seients.event.nom }}</h1>
          <p class="event-meta">{{ seients.event.data }} · {{ seients.event.recinte }}</p>
          <p v-if="seients.event.description" class="event-description">
            {{ seients.event.description }}
          </p>
        </div>
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
        <p class="event-error-missatge" role="alert">{{ seients.error }}</p>
        <NuxtLink to="/" class="btn-tornar">Tornar a la portada</NuxtLink>
      </div>

      <!-- Seat map -->
      <MapaSeients v-else :read-only="esAdmin" />
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

.topbar-reserva {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-checkout {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.9rem;
  background: #7c3aed;
  color: #ede9fe;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.btn-checkout:hover {
  background: #6d28d9;
}

/* ── Capçalera ── */
.event-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #1e2d45;
}

.event-header__image {
  flex-shrink: 0;
  width: 110px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.event-header__img {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.event-header__info {
  flex: 1;
  min-width: 0;
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
  color: #7c3aed;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.event-description {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 480px) {
  .event-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .event-header__image {
    width: 90px;
  }
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
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
.event-error-missatge {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

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
