import { getPool } from '../../shared/db.js';
import { AppError } from '../../shared/errors.js';

export type PoiDataStatus = 'REAL' | 'DEMO' | 'USER_REPORTED' | 'UNVERIFIED';

export type Poi = {
  id: string;
  name: string;
  category: string;
  coordinates: [number, number];
  dataStatus: PoiDataStatus;
  url?: string;
  i18n?: { en: { name: string } };
};

export type PoiSource = {
  name: string;
  url: string;
  license: string;
  attribution: string | null;
  retrievedAt: string | null;
  dataStatus: PoiDataStatus;
};

type SourceRow = {
  name: string;
  url: string | null;
  license: string;
  attribution: string | null;
  retrieved_at: Date | null;
  data_status: PoiDataStatus;
};

type PlaceRow = {
  id: string | number;
  name: string;
  category: string;
  lon: number;
  lat: number;
  data_status: PoiDataStatus;
  source_url: string | null;
  i18n: unknown;
};

function englishName(i18n: unknown): { en: { name: string } } | undefined {
  if (!i18n || typeof i18n !== 'object') return undefined;
  const name = (i18n as { en?: { name?: unknown } }).en?.name;
  if (typeof name !== 'string' || !name.trim()) return undefined;
  return { en: { name } };
}

// Lugares REAL de OpenStreetMap. Las filas DEMO se quedan en la tabla y no se mezclan con esta fuente.
export async function listOsmPois(cityId: string, category?: string): Promise<{ pois: Poi[]; source: PoiSource }> {
  const pool = getPool();
  const sourceResult = await pool.query<SourceRow>(
    `SELECT name, url, license, attribution, retrieved_at, data_status FROM data_sources WHERE id = 'osm'`,
  );
  const sourceRow = sourceResult.rows[0];
  if (!sourceRow) throw new AppError(500, 'INTERNAL', 'La fuente osm no está en el catálogo');

  const places = await pool.query<PlaceRow>(
    `SELECT id, name, category, lon, lat, data_status, source_url, i18n
     FROM places
     WHERE city_id = $1 AND source_id = 'osm' AND data_status = 'REAL'
       AND ($2::text IS NULL OR category = $2)
     ORDER BY name, id`,
    [cityId, category ?? null],
  );

  return {
    source: {
      name: sourceRow.name,
      url: sourceRow.url ?? '',
      license: sourceRow.license,
      attribution: sourceRow.attribution,
      retrievedAt: sourceRow.retrieved_at ? sourceRow.retrieved_at.toISOString() : null,
      dataStatus: sourceRow.data_status,
    },
    pois: places.rows.map((row) => {
      const i18n = englishName(row.i18n);
      return {
        id: String(row.id),
        name: row.name,
        category: row.category,
        coordinates: [Number(row.lon), Number(row.lat)],
        dataStatus: row.data_status,
        ...(row.source_url ? { url: row.source_url } : {}),
        ...(i18n ? { i18n } : {}),
      };
    }),
  };
}
