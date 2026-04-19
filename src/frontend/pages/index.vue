<script setup lang="ts">
interface EventItem {
  id: string;
  slug: string;
  name: string;
  date: string;
  venue: string;
  description?: string;
  image_url?: string;
  available_seats: number;
}

const config = useRuntimeConfig();

const {
  data: events,
  pending,
  error,
} = await useFetch<EventItem[]>("/api/events", {
  baseURL: config.laravelBaseUrl || undefined,
});
</script>

<template>
  <div class="home">
    <header class="home__header">
      <h1 class="home__title">Sala Onirica</h1>
      <p class="home__subtitle">Cinema independent de culte · Barcelona</p>
    </header>

    <main class="home__content">
      <div v-if="pending" class="home__skeletons">
        <div v-for="n in 4" :key="n" class="home__skeleton" />
      </div>

      <p v-else-if="error" class="home__message home__message--error">
        Error en carregar la programació. Torna-ho a intentar més tard.
      </p>

      <p v-else-if="!events || events.length === 0" class="home__message">
        No hi ha projeccions programades.
      </p>

      <div v-else class="home__grid">
        <EventCard
          v-for="event in events"
          :key="event.id"
          :id="event.id"
          :slug="event.slug"
          :name="event.name"
          :date="event.date"
          :venue="event.venue"
          :description="event.description"
          :image_url="event.image_url"
          :available_seats="event.available_seats"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #0d1117;
  color: #f1f5f9;
  padding: 2rem 1rem;
}

.home__header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.home__title {
  font-size: 2rem;
  font-weight: 800;
  color: #f1f5f9;
  margin: 0 0 0.5rem;
}

.home__subtitle {
  font-size: 1rem;
  color: #7c3aed;
  margin: 0;
}

.home__content {
  max-width: 72rem;
  margin: 0 auto;
}

.home__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1.25rem;
}

.home__skeletons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1.25rem;
}

.home__skeleton {
  height: 10rem;
  background-color: #1a2235;
  border-radius: 0.75rem;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

.home__message {
  text-align: center;
  color: #94a3b8;
  padding: 3rem 0;
}

.home__message--error {
  color: #f87171;
}
</style>
