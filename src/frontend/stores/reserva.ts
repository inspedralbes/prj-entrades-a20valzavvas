import { defineStore } from "pinia";
import type { ReservaConfirmadaPayload } from "@shared/socket.types";

interface ReservaState {
  seatId: string | null;
  expiraEn: string | null; // ISO timestamp
}

export const useReservaStore = defineStore("reserva", {
  state: (): ReservaState => ({
    seatId: null,
    expiraEn: null,
  }),

  getters: {
    teReservaActiva: (state): boolean => !!state.seatId,
  },

  actions: {
    confirmarReserva(payload: ReservaConfirmadaPayload) {
      this.seatId = payload.seatId;
      this.expiraEn = payload.expiraEn;
    },

    netejarReserva() {
      this.seatId = null;
      this.expiraEn = null;
    },
  },
});
