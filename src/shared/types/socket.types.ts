import { EstatSeient } from "./seat.types";

// Server → Room broadcasts
export interface SeientCanviEstatPayload {
  seatId: string;
  estat: EstatSeient;
  fila: string;
  numero: number;
}

export interface StatsActualitzacioPayload {
  disponibles: number;
  reservats: number;
  venuts: number;
  usuaris: number;
}

// Server → Client private responses
export interface ReservaConfirmadaPayload {
  seatId: string;
  expiraEn: string; // ISO timestamp
}

export interface ReservaRebutjadaPayload {
  seatId: string;
  motiu: string;
}

export interface CompraCompletadaPayload {
  orderId: string;
  seients: string[]; // seat labels e.g. ['A1', 'B3']
}

export interface ErrorGeneralPayload {
  codi: string;
  missatge: string;
}

// Client → Server events (payload types)
// Auth is handled at WS connection handshake via JWT Bearer token — no sessionToken needed per message
export interface EventUnirPayload {
  eventId: string;
}

export interface SeientReservarPayload {
  seatId: string;
}

export interface SeientAlliberarPayload {
  seatId: string;
}

export interface CompraConfirmarPayload {
  seients: string[]; // seat IDs to purchase
}
