export enum EstatSeient {
  DISPONIBLE = 'DISPONIBLE',
  RESERVAT = 'RESERVAT',
  VENUT = 'VENUT',
}

export interface ISeient {
  id: string;
  fila: string;
  numero: number;
  estat: EstatSeient;
  preu: number;
  categoria: string;
  colorHex: string;
}
