import { CANCUN_DEMO_GEOJSON } from './adapters/cancun-demo.js';

// Rutas simuladas (GeoJSON DEMO) para Cancún: cumple reglas del hackatón sin consumir APIs externas
// ni proyectos previos del autor. Siempre identificadas con `dataStatus: 'DEMO'`.

export type TransitStop = { id: string; name: string; coordinates: [number, number] };

export type TransitRoute = {
  id: string;
  name: string;
  mode: 'bus' | 'brt' | 'metro' | 'other';
  color?: string;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  stops: TransitStop[];
  fareCents?: number;
};

export type TransitSource = {
  name: string;
  url: string;
  license: string;
  retrievedAt: string;
  dataStatus: 'DEMO';
};

export type TransitPayload = { routes: TransitRoute[]; source: TransitSource };

const DEMO_SOURCE: TransitSource = {
  name: 'KinHop · Rutas simuladas (DEMO)',
  url: '',
  license: 'GeoJSON simulado para demostración del hackatón (sin API externa)',
  retrievedAt: '2026-11-20T00:00:00.000Z',
  dataStatus: 'DEMO',
};

export async function fetchCancunRoutes(): Promise<TransitPayload> {
  return {
    routes: CANCUN_DEMO_GEOJSON.features.map((f) => ({
      id: f.properties.id,
      name: f.properties.name,
      mode: f.properties.mode,
      ...(f.properties.color ? { color: f.properties.color } : {}),
      geometry: f.geometry,
      stops: f.properties.stops,
      ...(f.properties.fareCents !== undefined ? { fareCents: f.properties.fareCents } : {}),
    })),
    source: DEMO_SOURCE,
  };
}
