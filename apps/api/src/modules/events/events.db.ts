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

  return {
    id,
    title,
    venue,
    category: mapCategory(row.category),
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at?.toISOString(),
    sourceUrl: row.source_url,
    dataStatus: row.data_status,
    ...(image ? { image } : {}),
  };
}

export async function listUpcomingEvents(cityId: string, lang: 'es' | 'en'): Promise<Event[]> {
  const { rows } = await getPool().query<EventRow>(
    `SELECT id, external_id, title, venue_name, category, starts_at, ends_at, source_url, data_status,
            image_url, image_author, image_license, image_license_url, image_source_url, i18n
     FROM events
     WHERE city_id = $1 AND COALESCE(ends_at, starts_at) > now()
     ORDER BY starts_at ASC`,
    [cityId],
  );
  return rows.map((row) => rowToEvent(row, lang));
}