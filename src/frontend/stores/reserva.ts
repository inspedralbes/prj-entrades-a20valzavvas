import { defineStore } from "pinia";
import type { ReservaConfirmadaPayload } from "@shared/socket.types";

interface ReservaState {
  seatId: string | null;
  expiraEn: string | null; // ISO timestamp
  seatIds: string[];
  maxSeientPerUsuari: number;
}

export const useReservaStore = defineStore("reserva", {
  state: (): ReservaState => ({
    seatId: null,
    expiraEn: null,
    seatIds: [],
    maxSeientPerUsuari: 4,
  }),

  getters: {
    teReservaActiva: (state): boolean => !!state.seatId,
    limitAssolit: (state): boolean =>
      state.maxSeientPerUsuari > 0 &&
      state.seatIds.length >= state.maxSeientPerUsuari,
  },

  actions: {
    confirmarReserva(payload: ReservaConfirmadaPayload) {
      this.seatId = payload.seatId;
      this.expiraEn = payload.expiraEn;
      if (!this.seatIds.includes(payload.seatId)) {
        this.seatIds.push(payload.seatId);
      }
    },

    netejarReserva() {
      this.seatId = null;
      this.expiraEn = null;
      this.seatIds = [];
    },

    alliberarSeient(seatId: string) {
      this.seatIds = this.seatIds.filter((id) => id !== seatId);
      if (this.seatId === seatId) {
        this.seatId = this.seatIds[this.seatIds.length - 1] ?? null;
        this.expiraEn = null;
      }
    },

    setMaxSeientPerUsuari(max: number) {
      this.maxSeientPerUsuari = max;
    },
  },
});
