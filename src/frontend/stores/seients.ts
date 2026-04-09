import { defineStore } from "pinia";
import { EstatSeient } from "@shared/seat.types";
import type { SeientCanviEstatPayload } from "@shared/socket.types";

export interface SeatState {
  estat: EstatSeient;
  fila: string;
  numero: number;
  categoria: string;
  preu: number;
}

export interface SeatStateWithId extends SeatState {
  id: string;
}

interface SeientApiSeat {
  id: string;
  estat: string;
  fila: string;
  numero: number;
  id_categoria: string;
  preu: number;
}

interface SeientApiResponse {
  event: {
    id: string;
    nom: string;
    slug: string;
    data: string;
    recinte: string;
  };
  categories: Array<{ id: string; name: string; price: number }>;
  files: Record<string, SeientApiSeat[]>;
}

export const useSeientStore = defineStore("seients", {
  state: () => ({
    llistat: new Map<string, SeatState>(),
    event: null as SeientApiResponse["event"] | null,
    categories: [] as SeientApiResponse["categories"],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    seientsPerFila: (state): Map<string, SeatStateWithId[]> => {
      const map = new Map<string, SeatStateWithId[]>();
      for (const [id, seat] of state.llistat.entries()) {
        const fila = seat.fila;
        if (!map.has(fila)) {
          map.set(fila, []);
        }
        map.get(fila)!.push({ id, ...seat });
      }
      return new Map(
        Array.from(map.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([fila, seats]) => [
            fila,
            seats.sort((a, b) => a.numero - b.numero),
          ]),
      );
    },
  },

  actions: {
    async inicialitzar(slug: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await $fetch<SeientApiResponse>(
          `/api/events/${slug}/seats`,
        );
        this.event = data.event;
        this.categories = data.categories;
        this.llistat.clear();
        for (const seats of Object.values(data.files)) {
          for (const seat of seats) {
            this.llistat.set(seat.id, {
              estat: seat.estat as EstatSeient,
              fila: seat.fila,
              numero: seat.numero,
              categoria: seat.id_categoria,
              preu: seat.preu,
            });
          }
        }
      } catch {
        this.error = "Event no trobat";
      } finally {
        this.isLoading = false;
      }
    },

    actualitzarEstat(seatId: string, estat: EstatSeient) {
      const seat = this.llistat.get(seatId);
      if (seat) {
        seat.estat = estat;
      }
    },

    connectar() {
      const { $socket } = useNuxtApp();
      const socket = $socket as {
        connect: () => void;
        emit: (event: string, data: unknown) => void;
        on: (
          event: string,
          handler: (payload: SeientCanviEstatPayload) => void,
        ) => void;
      };

      socket.connect();

      socket.on("seient:canvi-estat", (payload: SeientCanviEstatPayload) => {
        this.actualitzarEstat(payload.seatId, payload.estat);
      });

      if (this.event) {
        socket.emit("event:unir", { eventId: this.event.id });
      }
    },

    desconnectar() {
      const { $socket } = useNuxtApp();
      const socket = $socket as {
        off: (event: string) => void;
        disconnect: () => void;
      };

      socket.off("seient:canvi-estat");
      socket.disconnect();
    },
  },
});
