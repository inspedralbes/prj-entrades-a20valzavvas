<script setup lang="ts">
import { useReservaStore } from "~/stores/reserva";
import { useAuthStore } from "~/stores/auth";
import { useSeientStore } from "~/stores/seients";

definePageMeta({ middleware: "auth", ssr: false });

interface SeatDetail {
  id: string;
  fila: string;
  numero: number;
  categoria: string;
  preu: number;
}

const reservaStore = useReservaStore();
const authStore = useAuthStore();
const seientStore = useSeientStore();

const backUrl = computed(() =>
  seientStore.event?.slug ? `/events/${seientStore.event.slug}` : "/",
);

const seats = ref<SeatDetail[]>([]);
const isLoadingSeats = ref(false);

const nom = ref(authStore.user?.name ?? "");
const email = ref(authStore.user?.email ?? "");
const errors = ref<{ nom?: string; email?: string; general?: string }>({});
const isSubmitting = ref(false);
const orderConfirmed = ref(false);
const orderId = ref<string | null>(null);
const orderTotal = ref<string | null>(null);
const confirmedSeats = ref<SeatDetail[]>([]);

const totalPrice = computed(() =>
  seats.value.reduce((sum, s) => sum + s.preu, 0),
);

onMounted(async () => {
  if (!reservaStore.teReservaActiva) {
    await navigateTo("/");
    return;
  }

  isLoadingSeats.value = true;
  try {
    const ids = reservaStore.seatIds;
    const query = ids.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&");
    seats.value = await $fetch<SeatDetail[]>(`/api/seats?${query}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
  } finally {
    isLoadingSeats.value = false;
  }
});

function validate(): boolean {
  errors.value = {};
  if (!nom.value.trim()) {
    errors.value.nom = "El nom complet és obligatori";
  } else if (nom.value.trim().length > 100) {
    errors.value.nom = "El nom no pot superar els 100 caràcters";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    errors.value.email = "L'email és obligatori";
  } else if (!emailRegex.test(email.value.trim())) {
    errors.value.email = "Introdueix un email vàlid";
  }
  return Object.keys(errors.value).length === 0;
}

async function submit() {
  if (!validate()) return;

  isSubmitting.value = true;
  errors.value = {};
  try {
    const result = await $fetch<{ id: string; total_amount: string }>(
      "/api/orders",
      {
        method: "POST",
        body: {
          nom: nom.value.trim(),
          email: email.value.trim(),
          seat_ids: reservaStore.seatIds,
        },
        headers: { Authorization: `Bearer ${authStore.token}` },
      },
    );

    orderId.value = result.id;
    orderTotal.value = result.total_amount;
    confirmedSeats.value = [...seats.value];

    const eventId = seientStore.event?.id;
    if (eventId) {
      const { $socket } = useNuxtApp();
      ($socket as { emit: (event: string, data: unknown) => void }).emit(
        "compra:confirmar",
        {
          orderId: result.id,
          eventId,
          seients: seats.value.map((s) => ({
            seatId: s.id,
            fila: s.fila,
            numero: s.numero,
          })),
        },
      );
    }

    reservaStore.netejarReserva();
    orderConfirmed.value = true;
  } catch (err: unknown) {
    const apiError = err as {
      data?: {
        errors?: Record<string, string[]>;
        error?: string;
        seients_expirats?: string[];
      };
    };

    const seients_expirats = apiError?.data?.seients_expirats;
    if (seients_expirats && seients_expirats.length > 0) {
      const expiredLabels = seients_expirats
        .map((expiredId) => {
          const seat = seats.value.find((s) => s.id === expiredId);
          return seat ? `${seat.fila}${seat.numero}` : expiredId;
        })
        .join(", ");
      errors.value.general = `Els seients ${expiredLabels} han expirat. Torna al mapa per escollir-ne de nous.`;
    } else {
      const serverErrors = apiError?.data?.errors ?? {};
      if (serverErrors.email?.[0]) {
        errors.value.email = serverErrors.email[0];
      }
      if (serverErrors.nom?.[0]) {
        errors.value.nom = serverErrors.nom[0];
      }
      if (Object.keys(errors.value).length === 0) {
        errors.value.general =
          apiError?.data?.error ??
          "Ha ocorregut un error. Torna-ho a intentar.";
      }
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <!-- Confirmació d'ordre -->
      <div v-if="orderConfirmed" class="confirmation-card">
        <div class="confirmation-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 class="confirmation-title">Compra confirmada!</h1>
        <p class="confirmation-text">
          Les teves entrades han estat reservades amb èxit. T'hem enviat un
          email de confirmació.
        </p>

        <!-- Resum de seients -->
        <div class="confirmation-summary">
          <table class="confirmation-seats-table">
            <thead>
              <tr>
                <th>Fila</th>
                <th>Seient</th>
                <th>Categoria</th>
                <th class="text-right">Preu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="seat in confirmedSeats" :key="seat.id">
                <td>{{ seat.fila }}</td>
                <td>{{ seat.numero }}</td>
                <td>{{ seat.categoria }}</td>
                <td class="text-right">{{ seat.preu.toFixed(2) }} €</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="confirmation-total-row">
                <td colspan="3" class="total-label">Total</td>
                <td class="text-right confirmation-total-amount">
                  {{
                    orderTotal
                      ? parseFloat(orderTotal).toFixed(2)
                      : totalPrice.toFixed(2)
                  }}
                  €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p class="confirmation-order-id">Ref: {{ orderId }}</p>

        <div class="confirmation-actions">
          <NuxtLink to="/entrades" class="btn-primary"
            >Veure les meves entrades</NuxtLink
          >
          <NuxtLink to="/" class="btn-secondary">Tornar als events</NuxtLink>
        </div>
      </div>

      <!-- Checkout form -->
      <template v-else>
        <div class="checkout-header">
          <div class="checkout-header-left">
            <NuxtLink :to="backUrl" class="btn-back">← Tornar</NuxtLink>
            <h1 class="checkout-title">Confirmar compra</h1>
          </div>
          <TemporitzadorReserva />
        </div>

        <!-- Resum de seients -->
        <div class="summary-card">
          <h2 class="summary-title">Resum de la reserva</h2>
          <div v-if="isLoadingSeats" class="summary-loading">
            Carregant detalls...
          </div>
          <table v-else class="seats-table">
            <thead>
              <tr>
                <th>Fila</th>
                <th>Seient</th>
                <th>Categoria</th>
                <th class="text-right">Preu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="seat in seats" :key="seat.id">
                <td>{{ seat.fila }}</td>
                <td>{{ seat.numero }}</td>
                <td>{{ seat.categoria }}</td>
                <td class="text-right">{{ seat.preu.toFixed(2) }} €</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" class="total-label">Total</td>
                <td class="text-right total-amount">
                  {{ totalPrice.toFixed(2) }} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Formulari -->
        <div class="form-card">
          <h2 class="form-title">Les teves dades</h2>
          <form @submit.prevent="submit">
            <div v-if="errors.general" class="error-general">
              {{ errors.general }}
            </div>

            <div class="field">
              <label for="nom">Nom complet</label>
              <input
                id="nom"
                v-model="nom"
                type="text"
                maxlength="100"
                autocomplete="name"
                :class="{ 'input-error': errors.nom }"
                placeholder="Introdueix el teu nom complet"
              />
              <span v-if="errors.nom" class="error-message">{{
                errors.nom
              }}</span>
            </div>

            <div class="field">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="email"
                type="text"
                autocomplete="email"
                :class="{ 'input-error': errors.email }"
                placeholder="Introdueix el teu email"
              />
              <span v-if="errors.email" class="error-message">{{
                errors.email
              }}</span>
            </div>

            <button
              type="submit"
              class="btn-primary btn-submit"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Processant..." : "Confirmar compra" }}
            </button>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  min-height: 100dvh;
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  padding: 2rem 1rem;
}

.checkout-container {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.checkout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.checkout-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-back {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s;
}

.btn-back:hover {
  color: var(--color-accent-primary);
}

.checkout-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.summary-card,
.form-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.summary-title,
.form-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin: 0 0 1rem;
  color: var(--color-text-primary);
}

.summary-loading {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.seats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.seats-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  font-weight: var(--font-weight-medium);
}

.seats-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.seats-table tbody tr:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right;
}

.total-row td {
  border-top: 2px solid var(--color-border);
  border-bottom: none;
}

.total-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  padding-top: 0.75rem;
}

.total-amount {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  padding-top: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.field label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.field input {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  padding: 0.6rem 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: var(--color-border-focus);
}

.field input.input-error {
  border-color: var(--color-error);
}

.error-message {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.error-general {
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.4);
  border-radius: var(--radius-md);
  color: #fca5a5;
  font-size: var(--font-size-sm);
  padding: 0.6rem 0.875rem;
  margin-bottom: 1.25rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  padding: 0.7rem 1.5rem;
  cursor: pointer;
  transition: background 0.15s;
  text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit {
  width: 100%;
}

.confirmation-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2.5rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.confirmation-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.confirmation-text {
  color: var(--color-text-secondary);
  margin: 0;
}

.confirmation-order-id {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  font-family: monospace;
}

.confirmation-summary {
  width: 100%;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.confirmation-seats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.confirmation-seats-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  font-weight: var(--font-weight-medium);
}

.confirmation-seats-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.confirmation-seats-table tbody tr:last-child td {
  border-bottom: none;
}

.confirmation-total-row td {
  border-top: 2px solid var(--color-border);
  border-bottom: none;
  padding-top: 0.625rem;
  font-weight: var(--font-weight-bold);
}

.confirmation-total-amount {
  color: var(--color-warning);
  font-size: var(--font-size-lg);
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 100%;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  padding: 0.7rem 1.5rem;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
  text-decoration: none;
  width: 100%;
}

.btn-secondary:hover {
  border-color: var(--color-border-focus);
  color: var(--color-text-primary);
}

.confirmation-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: rgba(22, 163, 74, 0.15);
  border: 2px solid var(--color-success);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
