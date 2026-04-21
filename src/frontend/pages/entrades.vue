<script setup lang="ts">
import { useOrders } from '~/composables/useOrders';
import type { OrderWithDetails } from '~/composables/useOrders';

definePageMeta({ middleware: 'auth', ssr: false });

const { orders, isLoading, error, fetchOrders } = useOrders();

onMounted(fetchOrders);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function eventFromOrder(order: OrderWithDetails) {
  return order.items[0]?.seat?.event ?? null;
}

function seatsLabel(order: OrderWithDetails): string {
  return order.items.map((i) => `${i.seat.row}${i.seat.number}`).join(', ');
}
</script>

<template>
  <div class="entrades-page">
    <div class="entrades-container">
      <h1 class="page-title">Les meves entrades</h1>

      <!-- Loading skeleton -->
      <template v-if="isLoading">
        <div v-for="n in 3" :key="n" class="ticket-skeleton" />
      </template>

      <!-- Error -->
      <div v-else-if="error" class="error-banner">
        {{ error }}
      </div>

      <!-- Estat buit -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
            />
          </svg>
        </div>
        <p class="empty-title">Cap entrada encara</p>
        <p class="empty-subtitle">Aquí apareixeran les teves compres</p>
        <NuxtLink to="/" class="btn-primary">Descobreix els propers events</NuxtLink>
      </div>

      <!-- Llista de tickets -->
      <div v-else class="tickets-list">
        <article v-for="order in orders" :key="order.id" class="ticket-card">
          <!-- Capçalera del ticket -->
          <div class="ticket-header">
            <div class="ticket-header-left">
              <span class="ticket-event-name">{{
                eventFromOrder(order)?.name ?? 'Esdeveniment'
              }}</span>
              <span class="ticket-date">{{
                formatDate(eventFromOrder(order)?.date ?? order.created_at)
              }}</span>
              <span class="ticket-venue">{{ eventFromOrder(order)?.venue ?? '' }}</span>
            </div>
            <span class="ticket-badge">Complet</span>
          </div>

          <!-- Perforació -->
          <div class="ticket-perforation" aria-hidden="true">
            <div class="perf-circle perf-left" />
            <div class="perf-line" />
            <div class="perf-circle perf-right" />
          </div>

          <!-- Cos del ticket -->
          <div class="ticket-body">
            <div class="ticket-seats-info">
              <span class="ticket-label">Seients</span>
              <span class="ticket-seats">{{ seatsLabel(order) }}</span>
            </div>
            <div class="ticket-category-info">
              <span class="ticket-label">Categoria</span>
              <span class="ticket-category">{{
                order.items[0]?.seat?.price_category?.name ?? '—'
              }}</span>
            </div>
            <div class="ticket-total-info">
              <span class="ticket-label">Total</span>
              <span class="ticket-total">{{ parseFloat(order.total_amount).toFixed(2) }} €</span>
            </div>
          </div>

          <!-- Peu -->
          <div class="ticket-footer">
            <span class="ticket-ref">Ref: {{ order.id.slice(0, 8) }}…</span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.entrades-page {
  min-height: 100dvh;
  background: #0f0f23;
  color: #f8fafc;
  padding: 2rem 1rem;
}

.entrades-container {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-title {
  font-size: var(--font-size-2xl, 1.75rem);
  font-weight: var(--font-weight-bold, 700);
  margin: 0;
  letter-spacing: -0.02em;
}

/* Skeleton */
.ticket-skeleton {
  height: 180px;
  border-radius: 12px;
  background: linear-gradient(90deg, #1e1b4b 25%, #2d2a5e 50%, #1e1b4b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Error */
.error-banner {
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.4);
  border-radius: 8px;
  color: #fca5a5;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

/* Estat buit */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  color: #4c4785;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #f8fafc;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  background: #ca8a04;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background: #a16207;
}

/* Ticket card */
.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ticket-card {
  background: #1e1b4b;
  border: 1px solid #312e81;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.ticket-card:hover {
  box-shadow:
    0 0 0 1px #ca8a04,
    0 4px 24px rgba(202, 138, 4, 0.12);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem 1rem;
}

.ticket-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ticket-event-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.3;
}

.ticket-date {
  font-size: 0.8125rem;
  color: #94a3b8;
  text-transform: capitalize;
}

.ticket-venue {
  font-size: 0.8125rem;
  color: #64748b;
}

.ticket-badge {
  flex-shrink: 0;
  background: rgba(22, 163, 74, 0.15);
  border: 1px solid rgba(22, 163, 74, 0.4);
  color: #4ade80;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
}

/* Perforació */
.ticket-perforation {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 -12px;
  position: relative;
}

.perf-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0f0f23;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.perf-left {
  margin-left: -10px;
}

.perf-right {
  margin-right: -10px;
}

.perf-line {
  flex: 1;
  border-top: 2px dashed #312e81;
}

/* Cos del ticket */
.ticket-body {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
}

.ticket-seats-info,
.ticket-category-info,
.ticket-total-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ticket-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.ticket-seats,
.ticket-category {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f8fafc;
}

.ticket-total {
  font-size: 1rem;
  font-weight: 700;
  color: #ca8a04;
}

/* Peu */
.ticket-footer {
  padding: 0.5rem 1.5rem 0.875rem;
}

.ticket-ref {
  font-size: 0.6875rem;
  color: #475569;
  font-family: monospace;
}

/* Responsive */
@media (max-width: 480px) {
  .ticket-body {
    grid-template-columns: 1fr 1fr;
  }

  .ticket-total-info {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #312e81;
    padding-top: 0.5rem;
    margin-top: 0.25rem;
  }
}
</style>
