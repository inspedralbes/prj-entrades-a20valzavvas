import { EstatSeient } from './seat.types';

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
  totalSeients: number;
  percentatgeVenuts: number;
  percentatgeReservats: number;
  usuaris: number;
  reservesActives: number;
  recaptacioTotal: number;
}

// Server → Client private responses
export interface ReservaConfirmadaPayload {
  seatId: string;
  expiraEn: string; // ISO timestamp
}

export type ReservaRebutjadaMotiu =
  | 'no_disponible'
  | 'seient_no_trobat'
  | 'limit_assolit'
  | 'error_intern';

export interface ReservaRebutjadaPayload {
  seatId: string;
  motiu: ReservaRebutjadaMotiu | string;
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
  orderId: string;
  eventId: string;
  seients: Array<{ seatId: string; fila: string; numero: number }>;
}
