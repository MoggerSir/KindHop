import { z } from 'zod';
import { AppError } from '../../shared/errors.js';

// Catálogo público que pinta el mapa de rutascancun.com (fetch "/datos/catalogo.json").
// No es el GET /api/routes de api.rutascancun.com: ese exige JWT y no hay credencial pública.
export const RUTAS_CANCUN_CATALOG_URL = 'https://rutascancun.com/datos/catalogo.json';

const SOURCE_NAME = 'API Rutas Cancún (catálogo público, servicio externo preexistente)';
const SOURCE_LICENSE =
  'Sin licencia de redistribución. Términos: servicio informativo en https://rutascancun.com/terms (vigentes desde 2026-08-11). Content-Signal use=reference; no se guarda copia.';

const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 4_000;
const MAX_BODY_CHARS = 2_000_000;

const catalogSchema = z.object({
  generado: z.string().optional(),
  rutas: z.array(z.unknown()),
});

const routeSchema = z.object({
  codigo: z.string().trim().min(1).max(64),
  nombre: z.string().trim().min(1).max(160),
  polilinea: z.string().min(1),
  tarifaMxn: z.number().min(0).optional(),
});

export type TransitStop = { id: string; name: string; coordinates: [number, number] };

export type TransitRoute = {
  id: string;
  name: string;
  mode: 'bus' | 'brt' | 'metro' | 'other';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  stops: TransitStop[];
  fareCents?: number;
};

export type TransitSource = {
  name: string;
  url: string;
  license: string;
  retrievedAt: string;
  dataStatus: 'REAL';
};

export type TransitPayload = { routes: TransitRoute[]; source: TransitSource };

export type CancunFetcherOptions = {
  fetchImpl?: typeof fetch;
  now?: () => number;
  ttlMs?: number;
  timeoutMs?: number;
  catalogUrl?: string;
};

// Polyline de Google, precisión 5: el catálogo codifica latitud y luego longitud.
// GeoJSON pide [lon, lat]. Algoritmo público; no es código del repositorio Rutas Cancún.
export function decodePolyline(encoded: string, precision = 5): [number, number][] {
  const factor = 10 ** precision;
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    lat += readChunk();
    lng += readChunk();
    coordinates.push([lng / factor, lat / factor]);
  }
  return coordinates;

  function readChunk(): number {
    let result = 0;
    let shift = 0;
    let byte = 0;
    do {
      if (index >= encoded.length) throw new Error('polyline truncada');
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32);
    return result & 1 ? ~(result >> 1) : result >> 1;
  }
}

function fareCents(pesos: number | undefined): number | undefined {
  if (pesos === undefined || !Number.isFinite(pesos)) return undefined;
  const cents = Math.round(pesos * 100);
  if (!Number.isSafeInteger(cents) || cents < 0) return undefined;
  return cents;
}

function usableLine(encoded: string): [number, number][] | undefined {
  let coordinates: [number, number][];
  try {
    coordinates = decodePolyline(encoded);
  } catch {
    return undefined;
  }
  if (coordinates.length < 2) return undefined;
  const inRange = coordinates.every(
    ([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180,
  );
  return inRange ? coordinates : undefined;
}

function retrievedAt(generado: string | undefined, fetchedAt: Date): string {
  if (!generado) return fetchedAt.toISOString();
  const parsed = Date.parse(generado);
  if (!Number.isFinite(parsed)) return fetchedAt.toISOString();
  return new Date(parsed).toISOString();
}

// Normaliza el JSON del catálogo. Una ruta ilegible se omite; si ninguna sirve, la fuente falló.
// Paradas: el catálogo no las publica (metodología de Rutas Cancún). Quedan [].
// Modo: el sitio describe camiones y combis, así que `bus`. No hay metro ni BRT en esta fuente.
export function normalizeCancunCatalog(body: unknown, fetchedAt: Date): TransitPayload {
  const parsed = catalogSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(502, 'TRANSIT_UNAVAILABLE', 'La API Rutas Cancún devolvió un formato no usable');
  }

  const seen = new Set<string>();
  const routes: TransitRoute[] = [];
  for (const item of parsed.data.rutas) {
    const route = routeSchema.safeParse(item);
    if (!route.success || seen.has(route.data.codigo)) continue;
    const coordinates = usableLine(route.data.polilinea);
    if (!coordinates) continue;
    seen.add(route.data.codigo);
    const fare = fareCents(route.data.tarifaMxn);
    routes.push({
      id: route.data.codigo,
      name: route.data.nombre,
      mode: 'bus',
      geometry: { type: 'LineString', coordinates },
      stops: [],
      ...(fare === undefined ? {} : { fareCents: fare }),
    });
  }

  if (routes.length === 0 && parsed.data.rutas.length > 0) {
    throw new AppError(502, 'TRANSIT_UNAVAILABLE', 'La API Rutas Cancún devolvió un formato no usable');
  }

  return {
    routes,
    source: {
      name: SOURCE_NAME,
      url: RUTAS_CANCUN_CATALOG_URL,
      license: SOURCE_LICENSE,
      retrievedAt: retrievedAt(parsed.data.generado, fetchedAt),
      dataStatus: 'REAL',
    },
  };
}

function unavailable(): never {
  throw new AppError(502, 'TRANSIT_UNAVAILABLE', 'La API Rutas Cancún no respondió');
}

// Caché en memoria del proceso, TTL corto. Un fallo no se guarda: la siguiente petición reintenta.
export function createCancunRoutesFetcher(options: CancunFetcherOptions = {}): () => Promise<TransitPayload> {
  const ttlMs = options.ttlMs ?? CACHE_TTL_MS;
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  let cache: { url: string; expiresAt: number; value: TransitPayload } | null = null;
  let inFlight: Promise<TransitPayload> | null = null;

  return async function fetchCancunRoutes() {
    const url = options.catalogUrl ?? process.env.RUTAS_CANCUN_CATALOG_URL ?? RUTAS_CANCUN_CATALOG_URL;
    const now = options.now?.() ?? Date.now();
    if (cache && cache.url === url && cache.expiresAt > now) return cache.value;
    if (inFlight) return inFlight;

    inFlight = (async () => {
      const fetchImpl = options.fetchImpl ?? fetch;
      let response: Response;
      try {
        response = await fetchImpl(url, {
          headers: {
            accept: 'application/json',
            'user-agent': 'KindHop/0.1 (transit adapter; declared external read)',
          },
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        unavailable();
      }
      if (!response.ok) unavailable();

      let body: unknown;
      try {
        const text = await response.text();
        if (text.length > MAX_BODY_CHARS) unavailable();
        body = JSON.parse(text) as unknown;
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(502, 'TRANSIT_UNAVAILABLE', 'La API Rutas Cancún devolvió un formato no usable');
      }

      const value = normalizeCancunCatalog(body, new Date(now));
      cache = { url, expiresAt: now + ttlMs, value };
      return value;
    })();

    try {
      return await inFlight;
    } finally {
      inFlight = null;
    }
  };
}

export const fetchCancunRoutes = createCancunRoutesFetcher();
