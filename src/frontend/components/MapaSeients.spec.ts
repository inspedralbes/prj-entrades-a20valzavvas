import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { EstatSeient } from '@shared/seat.types';
import MapaSeients from './MapaSeients.vue';
import Seient from './Seient.vue';

type SeatEntry = {
  id: string;
  estat: EstatSeient;
  fila: string;
  numero: number;
  categoria: string;
  preu: number;
};
const mockSeientsPerFila = vi.fn(() => new Map<string, SeatEntry[]>());
const mockReservaSeatIds = vi.fn<() => string[]>(() => []);

vi.mock('~/stores/seients', () => ({
  useSeientStore: vi.fn(() => ({
    seientsPerFila: mockSeientsPerFila(),
    categories: [],
  })),
}));

vi.mock('~/stores/reserva', () => ({
  useReservaStore: vi.fn(() => ({
    seatIds: mockReservaSeatIds(),
    limitAssolit: false,
    teReservaActiva: false,
    esSeleccionatPerMi: (seatId: string) => mockReservaSeatIds().includes(seatId),
  })),
}));

describe('MapaSeients.vue', () => {
  it('renderitza el nombre correcte de seients (.seient)', async () => {
    const map = new Map([
      [
        'A',
        [
          {
            id: 's1',
            estat: EstatSeient.DISPONIBLE,
            fila: 'A',
            numero: 1,
            categoria: 'c1',
            preu: 10,
          },
          {
            id: 's2',
            estat: EstatSeient.DISPONIBLE,
            fila: 'A',
            numero: 2,
            categoria: 'c1',
            preu: 10,
          },
        ],
      ],
      [
        'B',
        [
          {
            id: 's3',
            estat: EstatSeient.RESERVAT,
            fila: 'B',
            numero: 1,
            categoria: 'c1',
            preu: 10,
          },
        ],
      ],
    ]);
    mockSeientsPerFila.mockReturnValue(map);

    const wrapper = await mountSuspended(MapaSeients);
    const seients = wrapper.findAll('.seient');
    expect(seients).toHaveLength(3);
  });

  it('renderitza una fila per cada fila del store', async () => {
    const map = new Map([
      [
        'A',
        [
          {
            id: 's1',
            estat: EstatSeient.DISPONIBLE,
            fila: 'A',
            numero: 1,
            categoria: 'c1',
            preu: 10,
          },
        ],
      ],
      [
        'C',
        [
          {
            id: 's2',
            estat: EstatSeient.DISPONIBLE,
            fila: 'C',
            numero: 1,
            categoria: 'c1',
            preu: 10,
          },
        ],
      ],
    ]);
    mockSeientsPerFila.mockReturnValue(map);

    const wrapper = await mountSuspended(MapaSeients);
    const files = wrapper.findAll('.mapa-fila');
    expect(files).toHaveLength(2);
  });

  it('no renderitza seients quan el store és buit', async () => {
    mockSeientsPerFila.mockReturnValue(new Map());

    const wrapper = await mountSuspended(MapaSeients);
    const seients = wrapper.findAll('.seient');
    expect(seients).toHaveLength(0);
  });

  it('aplica seient--seleccionat-per-mi al seient que pertany a reserva.seatIds', async () => {
    const map = new Map([
      [
        'A',
        [
          {
            id: 's1',
            estat: EstatSeient.RESERVAT,
            fila: 'A',
            numero: 1,
            categoria: 'c1',
            preu: 10,
          },
          {
            id: 's2',
            estat: EstatSeient.DISPONIBLE,
            fila: 'A',
            numero: 2,
            categoria: 'c1',
            preu: 10,
          },
        ],
      ],
    ]);
    mockSeientsPerFila.mockReturnValue(map);
    mockReservaSeatIds.mockReturnValue(['s1']);

    const wrapper = await mountSuspended(MapaSeients);

    const seleccionat = wrapper.findAll('.seient--seleccionat-per-mi');
    expect(seleccionat).toHaveLength(1);
    expect(seleccionat[0].text()).toBe('1');

    const noSeleccionat = wrapper.findAll('.seient--disponible');
    expect(noSeleccionat).toHaveLength(1);
    expect(noSeleccionat[0].text()).toBe('2');
  });

  it('no aplica seient--seleccionat-per-mi quan reserva.seatIds és buit', async () => {
    const map = new Map([
      [
        'A',
        [
          {
            id: 's1',
            estat: EstatSeient.RESERVAT,
            fila: 'A',
            numero: 1,
            categoria: 'c1',
            preu: 10,
          },
        ],
      ],
    ]);
    mockSeientsPerFila.mockReturnValue(map);
    mockReservaSeatIds.mockReturnValue([]);

    const wrapper = await mountSuspended(MapaSeients);

    expect(wrapper.findAll('.seient--seleccionat-per-mi')).toHaveLength(0);
  });

  it('passa readOnly=true a tots els components Seient fills', async () => {
    const map = new Map([
      [
        'A',
        [
          {
            id: 's1',
            estat: EstatSeient.DISPONIBLE,
            fila: 'A',
            numero: 1,
            categoria: 'c1',
            preu: 10,
          },
          {
            id: 's2',
            estat: EstatSeient.DISPONIBLE,
            fila: 'A',
            numero: 2,
            categoria: 'c1',
            preu: 10,
          },
        ],
      ],
    ]);
    mockSeientsPerFila.mockReturnValue(map);

    const wrapper = await mountSuspended(MapaSeients, {
      props: { readOnly: true },
    });

    const seientComponents = wrapper.findAllComponents(Seient);
    expect(seientComponents).toHaveLength(2);
    for (const seient of seientComponents) {
      expect(seient.props('readOnly')).toBe(true);
    }
  });
});
