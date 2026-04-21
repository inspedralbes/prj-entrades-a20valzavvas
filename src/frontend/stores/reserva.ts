import { defineStore } from 'pinia';
import type { ReservaConfirmadaPayload } from '@shared/socket.types';

interface ReservaState {
  seients: Record<string, { expiraEn: string }>;
  maxSeientPerUsuari: number;
}

export const useReservaStore = defineStore('reserva', {
  state: (): ReservaState => ({
    seients: {},
    maxSeientPerUsuari: 4,
  }),

  getters: {
    seatIds: (state): string[] => Object.keys(state.seients),
    // Retorna el darrer seatId confirmat (compat amb el compte enrere)
    seatId: (state): string | null => {
      const ids = Object.keys(state.seients);
      return ids.length > 0 ? (ids[ids.length - 1] ?? null) : null;
    },
    // Retorna el expiraEn del darrer seient confirmat (compat amb el compte enrere)
    expiraEn: (state): string | null => {
      const ids = Object.keys(state.seients);
      return ids.length > 0 ? (state.seients[ids[ids.length - 1]]?.expiraEn ?? null) : null;
    },
    teReservaActiva: (state): boolean => Object.keys(state.seients).length > 0,
    limitAssolit: (state): boolean =>
      state.maxSeientPerUsuari > 0 && Object.keys(state.seients).length >= state.maxSeientPerUsuari,
    esSeleccionatPerMi:
      (state) =>
      (seatId: string): boolean =>
        seatId in state.seients,
  },

  actions: {
    confirmarReserva(payload: ReservaConfirmadaPayload) {
      this.seients[payload.seatId] = { expiraEn: payload.expiraEn };
    },

    netejarReserva() {
      this.seients = {};
    },

    alliberarSeient(seatId: string) {
      const { $socket } = useNuxtApp();
      ($socket as { emit: (event: string, data: unknown) => void }).emit('seient:alliberar', {
        seatId,
      });
    },

    removeSeient(seatId: string) {
      const { [seatId]: _, ...rest } = this.seients;
      this.seients = rest;
    },

    setMaxSeientPerUsuari(max: number) {
      this.maxSeientPerUsuari = max;
    },
  },
});
