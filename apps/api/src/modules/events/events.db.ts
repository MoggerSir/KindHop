import { getPool } from '../../shared/db.js';

export type EventCategory = 'music' | 'art' | 'food' | 'culture' | 'other';
export type EventDataStatus = 'REAL' | 'DEMO' | 'UNVERIFIED';

export type Event = {
  id: string;
  title: string;
  venue?: string;
  category: EventCategory;
  startsAt: string;
  endsAt?: string;
  sourceUrl: string | null;
  dataStatus: EventDataStatus;
  // Solo si el evento apunta a un lugar de `places`: sus coordenadas salen de la BD, nunca se inventan.
  place?: {
    id: string;
    name: string;
    coordinates: [number, number]; // [lon, lat]
    dataStatus: 'REAL' | 'DEMO' | 'USER_REPORTED' | 'UNVERIFIED';
  };
  image?: {
    src: string;
    alt: string;
    author: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
    position?: string;
  };
};

type EventRow = {
  id: number;
  external_id: string | null;
  title: string;
  venue_name: string | null;
  category: string | null;
  starts_at: Date;
  ends_at: Date | null;
  source_url: string | null;
  data_status: EventDataStatus;
  image_url: string | null;
  image_author: string | null;
  image_license: string | null;
  image_license_url: string | null;
  image_source_url: string | null;
  i18n: { en?: { title?: string; venue?: string; imageAlt?: string } };
  place_id: string | number | null;
  place_name: string | null;
  place_lat: number | null;
  place_lon: number | null;
  place_data_status: NonNullable<Event['place']>['dataStatus'] | null;
  place_i18n: { en?: { name?: string } } | null;
};

const CONTRACT_CATEGORIES = new Set<EventCategory>(['music', 'art', 'food', 'culture', 'other']);

function mapCategory(raw: string | null): EventCategory {
  if (raw && CONTRACT_CATEGORIES.has(raw as EventCategory)) return raw as EventCategory;
  if (raw === 'markets') return 'food';
  if (raw === 'nightlife') return 'music';
  return 'other';
}

function pickText(
  lang: 'es' | 'en',
  spanish: string | null,
  i18n: EventRow['i18n'],
  key: 'title' | 'venue',
): string | undefined {
  const translated = lang === 'en' ? i18n?.en?.[key] : undefined;
  if (translated) return translated;
  return spanish ?? undefined;
}

function rowToEvent(row: EventRow, lang: 'es' | 'en'): Event {
  const title = pickText(lang, row.title, row.i18n, 'title') ?? row.title;
  const venue = pickText(lang, row.venue_name, row.i18n, 'venue');
  const id =
    row.data_status === 'DEMO' && row.external_id ? `demo-${row.external_id}` : String(row.id);

  const imageAlt = lang === 'en' ? row.i18n?.en?.imageAlt : undefined;
  const image =
    row.image_url && row.image_author && row.image_license && row.image_source_url
      ? {
          src: row.image_url,
          alt: imageAlt ?? title,
          author: row.image_author,
          license: row.image_license,
          licenseUrl: row.image_license_url ?? '',
          sourceUrl: row.image_source_url,
        }
      : undefined;

  const placeName = (lang === 'en' && row.place_i18n?.en?.name) || row.place_name;
  const place =
    row.place_id != null && placeName && row.place_lat != null && row.place_lon != null && row.place_data_status
      ? {
          id: String(row.place_id),
          name: placeName,
          coordinates: [Number(row.place_lon), Number(row.place_lat)] as [number, number],
          dataStatus: row.place_data_status,
        }
      : undefined;

  return {
    id,
    title,
    venue,
    category: mapCategory(row.category),
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at?.toISOString(),
    sourceUrl: row.source_url,
    dataStatus: row.data_status,
    ...(place ? { place } : {}),
    ...(image ? { image } : {}),
  };
}

export async function listUpcomingEvents(cityId: string, lang: 'es' | 'en'): Promise<Event[]> {
  const { rows } = await getPool().query<EventRow>(
    `SELECT e.id, e.external_id, e.title, e.venue_name, e.category, e.starts_at, e.ends_at, e.source_url, e.data_status,
            e.image_url, e.image_author, e.image_license, e.image_license_url, e.image_source_url, e.i18n,
            p.id AS place_id, p.name AS place_name, p.lat AS place_lat, p.lon AS place_lon,
            p.data_status AS place_data_status, p.i18n AS place_i18n
     FROM events e
     LEFT JOIN places p ON p.id = e.place_id AND p.city_id = e.city_id
     WHERE e.city_id = $1 AND COALESCE(e.ends_at, e.starts_at) > now()
     ORDER BY e.starts_at ASC, e.id ASC`,
    [cityId],
  );
  return rows.map((row) => rowToEvent(row, lang));
}