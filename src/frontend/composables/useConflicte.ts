import { ref } from "vue";
import { EstatSeient } from "@shared/seat.types";
import type { ReservaRebutjadaPayload } from "@shared/socket.types";
import { useSeientStore } from "~/stores/seients";

/** Public interface exposed by useConflicte(). */
export interface ConflicteToast {
  missatge: string;
  /** Internal key used to restart the progress-bar CSS animation on each new conflict. */
  key: number;
}

// Module-level singleton state — safe for client-only (ssr:false) pages
const conflicte = ref<ConflicteToast | null>(null);
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let conflicteKey = 0;

function tancarConflicte(): void {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  conflicte.value = null;
}

/**
 * Called by the seients store when `reserva:rebutjada` is received.
 * Handles optimistic UI update and conflict toast display.
 */
export function handleReservaRebutjada(payload: ReservaRebutjadaPayload): void {
  const seients = useSeientStore();

  // Optimistic update: show the seat as RESERVAT immediately without waiting for broadcast
  seients.actualitzarEstat(payload.seatId, EstatSeient.RESERVAT);

  // Build notification message using seat fila + numero if available
  const seat = seients.llistat.get(payload.seatId);
  const missatge = seat
    ? `El seient ${seat.fila}${seat.numero} acaba de ser reservat. Escull un altre seient.`
    : "Un seient acaba de ser reservat. Escull un altre seient.";

  // Reset any running dismiss timer (second conflict restarts the 4s window)
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer);
  }

  // Increment key so the progress bar animation restarts on new conflict
  conflicteKey++;
  conflicte.value = { missatge, key: conflicteKey };

  dismissTimer = setTimeout(tancarConflicte, 4000);
}

export function useConflicte() {
  return { conflicte, tancarConflicte };
}
