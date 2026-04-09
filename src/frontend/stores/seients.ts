import { defineStore } from "pinia";
import { EstatSeient } from "@shared/seat.types";

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
  },
});
