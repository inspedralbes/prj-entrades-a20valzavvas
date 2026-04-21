<script setup lang="ts">
const props = defineProps<{
  id: string;
  slug: string;
  name: string;
  date: string;
  venue: string;
  description?: string;
  image_url?: string;
  available_seats: number;
}>();

const formattedDate = computed(() => {
  const d = new Date(props.date);
  const weekday = new Intl.DateTimeFormat('ca-ES', { weekday: 'long' }).format(d);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat('ca-ES', { month: 'long' }).format(d);
  const time = new Intl.DateTimeFormat('ca-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} de ${month}, ${time}h`;
});

const badgeColor = computed(() => {
  if (props.available_seats === 0) return '#DC2626';
  if (props.available_seats <= 20) return '#D97706';
  return '#16A34A';
});

const badgeText = computed(() => {
  if (props.available_seats === 0) return 'Esgotat';
  return `${props.available_seats} seients disponibles`;
});
</script>

<template>
  <NuxtLink :to="'/events/' + slug" class="event-card">
    <div v-if="image_url" class="event-card__image">
      <img :src="image_url" :alt="name" loading="lazy" />
    </div>
    <div class="event-card__content">
      <div class="event-card__body">
        <h2 class="event-card__title">{{ name }}</h2>
        <p class="event-card__date">{{ formattedDate }}</p>
        <p class="event-card__venue">{{ venue }}</p>
        <p v-if="description" class="event-card__description">
          {{ description }}
        </p>
      </div>
      <div class="event-card__footer">
        <span class="event-card__badge" :style="{ backgroundColor: badgeColor }">
          {{ badgeText }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.event-card {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  background-color: #1a2235;
  color: #f1f5f9;
  border-radius: 0.75rem;
  border: 1px solid #2d3748;
  text-decoration: none;
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.event-card:hover {
  border-color: #7c3aed;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.15);
}

.event-card__image {
  flex-shrink: 0;
  width: 80px;
}

.event-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 1.1rem;
  min-width: 0;
}

.event-card__body {
  flex: 1;
}

.event-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 0.35rem;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-card__date {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0 0 0.2rem;
}

.event-card__venue {
  font-size: 0.8rem;
  color: #7c3aed;
  font-weight: 600;
  margin: 0 0 0.4rem;
}

.event-card__description {
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0.25rem 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card__footer {
  margin-top: 0.75rem;
}

.event-card__badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
}
</style>
