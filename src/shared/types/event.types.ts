export interface IEvent {
  id: string;
  slug: string;
  nom: string;
  data: string; // ISO date, e.g. '2026-06-15'
  hora: string; // HH:MM, e.g. '21:00'
  recinte: string;
  imatgeUrl: string;
  totalSeients: number;
  seientsDisponibles: number;
  maxSeientPerUsuari: number;
}
