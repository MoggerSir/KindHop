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
  imageDataStatus?: 'REAL' | 'DEMO'; // DEMO = foto genérica ilustrativa, no de este lugar (ADR-0008)
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
  image_data_status: 'REAL' | 'DEMO' | null;
};

// Solo fotos que no exigen crédito junto a la imagen: las 6 ilustrativas del equipo (public/demo/places) y la CC0 del
// mercado nocturno. Las fotos CC BY / CC BY-SA de eventos no se reutilizan aquí porque la ficha de lugar no muestra autor.
const PLACE_IMAGES: Record<string, string[]> = {
  markets: ['/demo/places/market-1.jpg', '/demo/places/market-2.jpg', '/demo/events/night-market.jpg'],
  beaches: ['/demo/places/beach-1.jpg', '/demo/places/beach-2.jpg'],
  museums: ['/demo/places/museum-1.jpg'],
  culture: ['/demo/places/museum-1.jpg', '/demo/places/market-2.jpg'],
  art: ['/demo/places/market-2.jpg', '/demo/places/museum-1.jpg'],
  default: ['/demo/places/park-1.jpg', '/demo/places/beach-2.jpg', '/demo/places/market-2.jpg', '/demo/places/museum-1.jpg'],
};

// Foto genérica DEMO para lugares sin foto propia. `index` es la posición del lugar DENTRO de su categoría en el orden
// estable (name, id): la misma foto para el mismo lugar con o sin filtro, y fotos alternas entre vecinos.
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
    `SELECT id, external_id, name, category, lon, lat, data_status, i18n, rating, rating_count, image_url, image_data_status
     FROM places
     WHERE city_id = $1 AND source_id = 'osm' AND data_status = 'REAL'
       AND ($2::text IS NULL OR category = $2)
     ORDER BY name, id`,
    [cityId, category ?? null],
  );

  const perCategory = new Map<string, number>();
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
      const url = osmObjectUrl(row.external_id);
      const index = perCategory.get(row.category) ?? 0;
      perCategory.set(row.category, index + 1);
      const own = row.image_url && row.image_data_status;
      const imageUrl = own ? row.image_url! : fallbackPlaceImage(row.category, index);
      const imageDataStatus = own ? row.image_data_status! : 'DEMO';
      return {
        id: String(row.id),
        name: row.name,
        category: row.category,
        coordinates: [Number(row.lon), Number(row.lat)],
        dataStatus: row.data_status,
        imageUrl,
        imageDataStatus,
        ...(url ? { url } : {}),
        ...(i18n ? { i18n } : {}),
        ...(row.rating != null ? { rating: Number(row.rating) } : {}),
        ...(row.rating_count != null ? { ratingCount: Number(row.rating_count) } : {}),
      };
    }),
  };
}
