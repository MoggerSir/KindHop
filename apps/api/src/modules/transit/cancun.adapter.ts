import { CANCUN_DEMO_GEOJSON } from './adapters/cancun-demo.js';

// Cancún en la demo: rutas SIMULADAS (GeoJSON local, ADR-0008). Las reglas del hackatón no permiten consumir el
// servicio preexistente del autor (Rutas Cancún), así que el adaptador en vivo queda desactivado en
// adapters/cancun-live.ts. Lo simulado sale siempre con `dataStatus: 'DEMO'`, sin tarifa ni horario (nunca se
// inventan) y la web lo rotula como ilustrativo. CDMX (Metrobús GTFS, KH-007) sigue siendo REAL.

export type TransitStop = { id: string; name: string; coordinates: [number, number] };

export type TransitRoute = {
  id: string;
  name: string;
  mode: 'bus' | 'brt' | 'metro' | 'other';
  color?: string;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  stops: TransitStop[];
  fareCents?: number; // solo si una fuente REAL la publica; las rutas simuladas nunca la traen
};

export type TransitSource = {
  name: string;
  url: string;
  license: string;
  retrievedAt: string;
  dataStatus: 'REAL' | 'DEMO';
};

export type TransitPayload = { routes: TransitRoute[]; source: TransitSource };

export const CANCUN_DEMO_SOURCE: TransitSource = {
  name: 'KinHop · Rutas simuladas (DEMO, ilustrativas)',
  url: '',
  license: 'Trazados y paradas aproximados, creados por el equipo para la demo. No son rutas oficiales ni tienen tarifa u horario.',
  retrievedAt: '2026-11-20T00:00:00.000Z', // fecha en que se creó la simulación, no una consulta a una fuente
  dataStatus: 'DEMO',
};

export async function fetchCancunRoutes(): Promise<TransitPayload> {
  return {
    routes: CANCUN_DEMO_GEOJSON.features.map((f) => ({
      id: f.properties.id,
      name: f.properties.name,
      mode: f.properties.mode,
      geometry: f.geometry,
      stops: f.properties.stops,
    })),
    source: CANCUN_DEMO_SOURCE,
  };
}
