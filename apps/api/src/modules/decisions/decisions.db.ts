import { getPool } from '../../shared/db.js';
import {
  EARTH_RADIUS_M,
  MISSING_SOURCE,
  REPORT_RADIUS_M,
  SEARCH_RADIUS_M,
  SUGGESTION_LIMIT,
  searchBox,
  suggest,
  type Candidate,
  type DataStatus,
  type SuggestLang,
  type Suggestion,
} from './suggest.js';

// Consultas del motor. La caja lat/lon es el predicado del índice places_city_coords_idx;
// la distancia haversine ordena y descarta lo que queda fuera del radio. Sin PostGIS (ADR-0006).

const DEGREE_METERS = `(2 * pi() * ${EARTH_RADIUS_M}::float8 / 360.0)`;
const REPORT_BOX = `(${REPORT_RADIUS_M}::float8 * 1.1) / ${DEGREE_METERS}`;

function distanceSql(latA: string, lonA: string, latB: string, lonB: string): string {
  return `(${EARTH_RADIUS_M}::float8 * 2 * asin(LEAST(1::float8, sqrt(GREATEST(0::float8,
    power(sin(radians(${latB} - ${latA}) / 2), 2)
    + cos(radians(${latA})) * cos(radians(${latB})) * power(sin(radians(${lonB} - ${lonA}) / 2), 2)
  )))))`;
}

// Activa = no caducada y aún abierta. RESOLVED y REJECTED no desvían.
function activeReportNear(lat: string, lon: string, city: string): string {
  return `EXISTS (
    SELECT 1 FROM urban_reports r
    WHERE r.city_id = ${city}
      AND r.status IN ('UNVERIFIED', 'CONFIRMED')
      AND r.expires_at > now()
      AND r.lat BETWEEN ${lat} - ${REPORT_BOX} AND ${lat} + ${REPORT_BOX}
      AND r.lon BETWEEN ${lon} - ${REPORT_BOX} / GREATEST(cos(radians(${lat})), 0.2)
                     AND ${lon} + ${REPORT_BOX} / GREATEST(cos(radians(${lat})), 0.2)
      AND ${distanceSql(lat, lon, 'r.lat', 'r.lon')} < ${REPORT_RADIUS_M}
  )`;
}

const ORIGIN_SQL = `
  SELECT p.id::text AS id, p.name, p.category, p.lat, p.lon,
         ${activeReportNear('p.lat', 'p.lon', 'p.city_id')} AS report_nearby
  FROM places p
  WHERE p.city_id = $1 AND p.id = $2::bigint
`;

// $1 ciudad, $2 categoría, $3 id a excluir, $4..$7 caja, $8 lat origen, $9 lon origen, $10 presupuesto bajo.
export const CANDIDATE_SQL = `
  SELECT q.id, q.name, q.distance_m, q.is_free, q.source_name, q.as_of, q.data_status
  FROM (
    SELECT p.id::text AS id, p.name, p.lat, p.lon, p.city_id, p.is_free, p.data_status,
           ${distanceSql('$8', '$9', 'p.lat', 'p.lon')} AS distance_m,
           COALESCE(s.name, '${MISSING_SOURCE}') AS source_name,
           COALESCE(p.retrieved_at, s.retrieved_at, p.created_at) AS as_of
    FROM places p
    LEFT JOIN data_sources s ON s.id = p.source_id
    WHERE p.city_id = $1
      AND p.category = $2
      AND p.id <> $3::bigint
      AND p.lat BETWEEN $4 AND $5
      AND p.lon BETWEEN $6 AND $7
  ) q
  WHERE q.distance_m <= ${SEARCH_RADIUS_M}
    AND NOT ${activeReportNear('q.lat', 'q.lon', 'q.city_id')}
  ORDER BY
    CASE WHEN $10::boolean THEN (q.is_free IS TRUE)::int ELSE 0 END DESC,
    q.distance_m ASC,
    q.id::bigint ASC
  LIMIT ${SUGGESTION_LIMIT}
`;

type OriginRow = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  report_nearby: boolean;
};

type CandidateRow = {
  id: string;
  name: string;
  distance_m: number | string;
  is_free: boolean | null;
  source_name: string;
  as_of: Date | string;
  data_status: string;
};

const STATUSES = new Set<DataStatus>(['REAL', 'DEMO', 'USER_REPORTED', 'UNVERIFIED']);

export async function loadSuggestions(input: {
  cityId: string;
  placeId: string;
  lowBudget: boolean;
  lang: SuggestLang;
}): Promise<Suggestion[] | null> {
  const { rows } = await getPool().query<OriginRow>(ORIGIN_SQL, [input.cityId, input.placeId]);
  const origin = rows[0];
  if (!origin) return null;
  if (!origin.report_nearby && !input.lowBudget) return [];
  const { rows: candidateRows } = await getPool().query<CandidateRow>(
    CANDIDATE_SQL,
    candidateParams({ ...origin, cityId: input.cityId }, input.lowBudget),
  );
  return suggest({
    originName: origin.name,
    activeReportNearby: origin.report_nearby,
    lowBudget: input.lowBudget,
    lang: input.lang,
    candidates: candidateRows.map(mapCandidate),
  });
}

function candidateParams(
  origin: { cityId: string; id: string; category: string; lat: number; lon: number },
  lowBudget: boolean,
): unknown[] {
  const box = searchBox(origin.lat, origin.lon);
  return [origin.cityId, origin.category, origin.id, box.minLat, box.maxLat, box.minLon, box.maxLon, origin.lat, origin.lon, lowBudget];
}

function mapCandidate(row: CandidateRow): Candidate {
  if (!STATUSES.has(row.data_status as DataStatus)) {
    throw new Error(`data_status inesperado: ${row.data_status}`);
  }
  return {
    id: row.id,
    name: row.name,
    distanceM: Number(row.distance_m),
    isFree: row.is_free,
    sourceName: row.source_name,
    asOf: asIso(row.as_of),
    dataStatus: row.data_status as DataStatus,
  };
}

function asIso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('as_of inválido');
  return date.toISOString();
}

export type ExplainTarget = {
  cityId: string;
  placeId: string;
  category: string;
  lat: number;
  lon: number;
  lowBudget: boolean;
};

// EXPLAIN no acepta $1 sueltos: se prepara la misma sentencia y se pide el plan con literales ya validados.
export async function explainCandidatePlan(target: ExplainTarget): Promise<string> {
  const params = candidateParams(
    { cityId: target.cityId, id: target.placeId, category: target.category, lat: target.lat, lon: target.lon },
    target.lowBudget,
  );
  const client = await getPool().connect();
  const name = 'decisions_candidates_plan';
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL plan_cache_mode = 'force_custom_plan'");
    await client.query(`PREPARE ${name} (text, text, bigint, float8, float8, float8, float8, float8, float8, boolean) AS ${CANDIDATE_SQL}`);
    const { rows } = await client.query<{ 'QUERY PLAN': string }>(
      `EXPLAIN (COSTS, FORMAT TEXT) EXECUTE ${name}(${params.map(sqlLiteral).join(', ')})`,
    );
    await client.query('COMMIT');
    return rows.map((row) => row['QUERY PLAN']).join('\n');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.query(`DEALLOCATE ${name}`).catch(() => undefined);
    client.release();
  }
}

function sqlLiteral(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string' && /^[1-9]\d{0,15}$/.test(value)) return value;
  if (typeof value === 'string' && /^[a-z][a-z0-9_-]{0,31}$/.test(value)) return `'${value}'`;
  throw new Error('parámetro no explicable');
}
