import { getPool } from '../../shared/db.js';
import { AppError } from '../../shared/errors.js';

export type TransitMode = 'bus' | 'brt' | 'metro' | 'other';
export type TransitDataStatus = 'REAL' | 'DEMO' | 'USER_REPORTED' | 'UNVERIFIED';

export type TransitStop = {
  id: string;
  name: string;
  coordinates: [number, number];
};

export type TransitRoute = {
  id: string;
  name: string;
  shortName?: string;
  mode: TransitMode;
  color?: string;
  geometry: { type: 'LineString' | 'MultiLineString'; coordinates: number[][] | number[][][] };
  stops: TransitStop[];
  fareCents?: number;
};

export type TransitSource = {
  name: string;
  url: string;
  license: string;
  licenseUrl: string | null;
  attribution: string | null;
  retrievedAt: string | null;
  dataStatus: TransitDataStatus;
};

type SourceRow = {
  name: string;
  url: string | null;
  license: string;
  attribution: string | null;
  retrieved_at: Date | null;
  data_status: TransitDataStatus;
};

type RouteRow = {
  external_id: string;
  name: string;
  short_name: string | null;
  mode: TransitMode;
  color: string | null;
  geometry: TransitRoute['geometry'];
  fare_cents: string | null;
  stop_external_id: string | null;
  stop_name: string | null;
  lon: number | null;
  lat: number | null;
  sequence: number | null;
};

const SOURCE_ID = 'cdmx-gtfs';

function splitLicense(license: string): { license: string; licenseUrl: string | null } {
  const parts = license.split(' | ');
  if (parts.length === 2 && parts[1].startsWith('https://')) {
    return { license: parts[0], licenseUrl: parts[1] };
  }
  return { license, licenseUrl: null };
}

// Snapshot ya importado. No consulta el GTFS en cada request y no rellena tarifa ni horarios.
export async function listCdmxTransit(): Promise<{ routes: TransitRoute[]; source: TransitSource }> {
  const pool = getPool();
  const sourceResult = await pool.query<SourceRow>(
    `SELECT name, url, license, attribution, retrieved_at, data_status FROM data_sources WHERE id = $1`,
    [SOURCE_ID],
  );
  const sourceRow = sourceResult.rows[0];
  if (!sourceRow) throw new AppError(502, 'TRANSIT_UNAVAILABLE', 'No hay fuente de transporte cargada para esta ciudad');

  const rows = await pool.query<RouteRow>(
    `SELECT r.external_id, r.name, r.short_name, r.mode, r.color, r.geometry, r.fare_cents,
            s.external_id AS stop_external_id, s.name AS stop_name, s.lon, s.lat, rs.sequence
     FROM transit_routes r
     LEFT JOIN transit_route_stops rs ON rs.route_id = r.id
     LEFT JOIN transit_stops s ON s.id = rs.stop_id
     WHERE r.city_id = 'cdmx' AND r.source_id = $1
     ORDER BY r.external_id, rs.sequence`,
    [SOURCE_ID],
  );

  const byRoute = new Map<string, TransitRoute>();
  for (const row of rows.rows) {
    let route = byRoute.get(row.external_id);
    if (!route) {
      const fare = row.fare_cents == null ? undefined : Number(row.fare_cents);
      route = {
        id: row.external_id,
        name: row.name,
        mode: row.mode,
        geometry: row.geometry,
        stops: [],
        ...(row.short_name ? { shortName: row.short_name } : {}),
        ...(row.color ? { color: row.color } : {}),
        ...(fare != null && Number.isInteger(fare) ? { fareCents: fare } : {}),
      };
      byRoute.set(row.external_id, route);
    }
    if (row.stop_external_id && row.stop_name && row.lon != null && row.lat != null) {
      route.stops.push({
        id: row.stop_external_id,
        name: row.stop_name,
        coordinates: [Number(row.lon), Number(row.lat)],
      });
    }
  }

  const license = splitLicense(sourceRow.license);
  return {
    source: {
      name: sourceRow.name,
      url: sourceRow.url ?? '',
      license: license.license,
      licenseUrl: license.licenseUrl,
      attribution: sourceRow.attribution,
      retrievedAt: sourceRow.retrieved_at ? sourceRow.retrieved_at.toISOString() : null,
      dataStatus: sourceRow.data_status,
    },
    routes: [...byRoute.values()],
  };
}
