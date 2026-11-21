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
  rating?: number;
  ratingCount?: number;
  imageUrl?: string;
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
  external_id: string | null;
  name: string;
  category: string;
  lon: number;
  lat: number;
  data_status: PoiDataStatus;
  i18n: unknown;
  rating: string | number | null;
  rating_count: number | null;
  image_url: string | null;
};

const PLACE_IMAGES: Record<string, string[]> = {
  markets: ['/demo/places/market-1.jpg', '/demo/places/market-2.jpg', '/demo/events/night-market.jpg', '/demo/events/ceramics.jpg'],
  beaches: ['/demo/places/beach-1.jpg', '/demo/places/beach-2.jpg'],
  museums: ['/demo/places/museum-1.jpg', '/demo/events/ceramics.jpg'],
  culture: ['/demo/places/museum-1.jpg', '/demo/events/ceramics.jpg'],
  art: ['/demo/events/ceramics.jpg', '/demo/places/museum-1.jpg'],
  default: ['/demo/places/park-1.jpg', '/demo/places/beach-2.jpg', '/demo/places/market-2.jpg', '/demo/places/museum-1.jpg'],
};

function fallbackPlaceImage(category: string, index: number): string {
  const list = PLACE_IMAGES[category] ?? PLACE_IMAGES.default;
  return list[index % list.length] ?? '/demo/places/park-1.jpg';
}

// 0003 retiró places.source_url. El enlace al objeto es el external_id (node/123, way/123, relation/123).
function osmObjectUrl(externalId: string | null): string | undefined {
  if (!externalId || !/^(node|way|relation)\/\d+$/.test(externalId)) return undefined;
  return `https://www.openstreetmap.org/${externalId}`;
}

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
    `SELECT id, external_id, name, category, lon, lat, data_status, i18n, rating, rating_count, image_url
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
    pois: places.rows.map((row, index) => {
      const i18n = englishName(row.i18n);
      const url = osmObjectUrl(row.external_id);
      const imageUrl = row.image_url ?? fallbackPlaceImage(row.category, index);
      return {
        id: String(row.id),
        name: row.name,
        category: row.category,
        coordinates: [Number(row.lon), Number(row.lat)],
        dataStatus: row.data_status,
        imageUrl,
        ...(url ? { url } : {}),
        ...(i18n ? { i18n } : {}),
        ...(row.rating != null ? { rating: Number(row.rating) } : {}),
        ...(row.rating_count != null ? { ratingCount: Number(row.rating_count) } : {}),
      };
    }),
  };
}
