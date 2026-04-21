<script setup lang="ts">
import { useConflicte } from '~/composables/useConflicte';

const { conflicte, tancarConflicte } = useConflicte();
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="conflicte"
        class="toast-wrapper"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="toast" @click="tancarConflicte">
          <!-- Warning icon -->
          <svg
            class="toast-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>

          <!-- Message -->
          <p class="toast-missatge">{{ conflicte.missatge }}</p>

          <!-- Close button — 44×44px touch target -->
          <button
            class="toast-tancar"
            aria-label="Tancar notificació"
            @click.stop="tancarConflicte"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <!-- Progress bar — key restarts animation on each new conflict -->
          <div class="toast-progress" aria-hidden="true">
            <div :key="conflicte.key" class="toast-progress-bar" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Wrapper: fills viewport corner, non-blocking ── */
.toast-wrapper {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  pointer-events: none; /* Does not block seat map clicks */
  max-width: 360px;
  width: calc(100vw - 3rem);
}

/* ── Toast card ── */
.toast {
  pointer-events: auto; /* The card itself is clickable */
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem 1.25rem; /* bottom padding for progress bar */
  background: #1c1208;
  border: 1px solid #92400e;
  border-left: 3px solid #f97316;
  border-radius: 10px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(249, 115, 22, 0.08);
  cursor: pointer;
  overflow: hidden;
}

/* ── Warning icon ── */
.toast-icon {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  color: #f97316;
  margin-top: 0.1rem;
}

/* ── Message text ── */
.toast-missatge {
  flex: 1;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: #fed7aa; /* orange-200 */
}

/* ── Close button — 44×44px touch target ── */
.toast-tancar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin: -0.5rem -0.5rem -0.5rem 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #92400e;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.toast-tancar:hover {
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
}

.toast-tancar:focus-visible {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}

/* ── Progress bar ── */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(146, 64, 14, 0.3);
}

.toast-progress-bar {
  height: 100%;
  width: 100%;
  background: #f97316;
  transform-origin: left;
  animation: progress-deplete 4s linear forwards;
}

@keyframes progress-deplete {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* ── Entrance / exit transitions ── */
.toast-enter-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.toast-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(0.75rem);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}

/* ── Respect reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.15s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }

  .toast-progress-bar {
    animation: none;
    transform: scaleX(0);
  }
}

/* ── Mobile: bottom-center ── */
@media (max-width: 480px) {
  .toast-wrapper {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
    max-width: none;
  }
}
</style>
