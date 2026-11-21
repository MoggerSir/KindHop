#!/usr/bin/env node
// Importa lugares de OpenStreetMap (Overpass) a places. KH-004.
// Caja acotada a Cancún: no consulta el planeta. Upsert por (source_id, external_id);
// no modifica filas DEMO. Nombre, licencia y URL de la fuente viven en data_sources;
// el enlace al objeto se arma con external_id (0003 retiró source_name, source_url y license de places).
// Los tests usan el fixture y no llaman a Overpass.
//
//   node scripts/fetch-osm-pois.mjs
//   node scripts/fetch-osm-pois.mjs --dry-run
//   node scripts/fetch-osm-pois.mjs --fixture scripts/fixtures/overpass-cancun-sample.json

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

// Zona urbana de Cancún y la zona hotelera (sur, oeste, norte, este). No incluye Puerto Morelos.
export const CANCUN_BBOX = Object.freeze({ south: 21.02, west: -86.98, north: 21.24, east: -86.74 });

// Espejos públicos. El primero es el oficial; si está saturado se prueba el siguiente.
// OVERPASS_URL fuerza un solo endpoint (sin respaldo).
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

const USER_AGENT = 'KinHop/0.1 (hackathon; https://github.com/MoggerSir/KindHop)';

const FOOD_AMENITIES = new Set(['restaurant', 'cafe', 'fast_food', 'ice_cream']);
const NIGHTLIFE_AMENITIES = new Set(['bar', 'pub', 'nightclub']);
const SHOPS = new Set(['supermarket', 'convenience', 'gift', 'souvenir', 'clothes', 'mall', 'department_store', 'art', 'craft', 'jewelry', 'shoes']);

// Orden = prioridad si un objeto trae varias etiquetas. Las plazas (place=square) no tienen
// id propio en categories: se guardan como culture, igual que el Zócalo DEMO.
const CATEGORY_RULES = [
  ['beaches', (tags) => tags.natural === 'beach'],
  ['museums', (tags) => tags.tourism === 'museum'],
  ['markets', (tags) => tags.amenity === 'marketplace'],
  ['parks', (tags) => tags.leisure === 'park'],
  ['culture', (tags) => tags.place === 'square'],
  // Comercios donde gasta el turista (KH-020, gasto local). Su marca de cadena decide si es "local".
  ['food', (tags) => FOOD_AMENITIES.has(tags.amenity) || tags.shop === 'bakery'],
  ['nightlife', (tags) => NIGHTLIFE_AMENITIES.has(tags.amenity)],
  ['shopping', (tags) => SHOPS.has(tags.shop)],
];

const OSM_TYPES = new Set(['node', 'way', 'relation']);

function assertBounded(bbox) {
  const latSpan = bbox.north - bbox.south;
  const lonSpan = bbox.east - bbox.west;
  if (!(latSpan > 0 && latSpan <= 1.5 && lonSpan > 0 && lonSpan <= 1.5)) {
    throw new Error('La consulta a Overpass tiene que ir acotada a una caja pequeña');
  }
}

export function buildOverpassQuery(bbox = CANCUN_BBOX) {
  assertBounded(bbox);
  const box = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  const filters = [
    '["natural"="beach"]["name"]',
    '["tourism"="museum"]["name"]',
    '["leisure"="park"]["name"]',
    '["amenity"="marketplace"]["name"]',
    '["place"="square"]["name"]',
    '["amenity"~"^(restaurant|cafe|fast_food|ice_cream|bar|pub|nightclub)$"]["name"]',
    '["shop"~"^(bakery|supermarket|convenience|gift|souvenir|clothes|mall|department_store|art|craft|jewelry|shoes)$"]["name"]',
  ];
  const clauses = filters.map((filter) => `  nwr${filter}(${box});`).join('\n');
  return `[out:json][timeout:90];\n(\n${clauses}\n);\nout center tags;`;
}

function clean(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text || null;
}

function categoryOf(tags) {
  for (const [id, test] of CATEGORY_RULES) if (test(tags)) return id;
  return null;
}

function spanishName(tags) {
  return clean(tags['name:es']) ?? clean(tags.name);
}

function coordinatesOf(element) {
  const point = element.type === 'node' ? element : element.center;
  const lat = point?.lat;
  const lon = point?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function addressOf(tags) {
  const street = clean(tags['addr:street']);
  const number = clean(tags['addr:housenumber']);
  if (street && number) return `${street} ${number}`;
  return street;
}

// Cadena = OSM registra una marca (brand o brand:wikidata). Sin marca → false: independiente según OSM.
// Solo para comercios (food, nightlife, shopping); en el resto no aplica (null).
const COMMERCE = new Set(['food', 'nightlife', 'shopping']);
export function chainOf(tags, category) {
  if (!COMMERCE.has(category)) return { isChain: null, brand: null };
  const brand = clean(tags.brand) ?? clean(tags['brand:es']) ?? clean(tags['brand:en']);
  const isChain = Boolean(brand || clean(tags['brand:wikidata']));
  return { isChain, brand: isChain ? (brand ?? spanishName(tags)).slice(0, 120) : null };
}

function isFreeOf(tags) {
  const fee = clean(tags.fee);
  if (fee === 'no') return true;
  if (fee === 'yes') return false;
  return null;
}

function emptySkipped() {
  return { unnamed: 0, uncategorized: 0, coords: 0, duplicate: 0, ignored: 0, generic: 0, notPlace: 0 };
}

// Nombres que no identifican un lugar: el valor por defecto de OSM o la categoría sola.
const GENERIC_NAMES = new Set([
  'sin nombre', 'unnamed', 'no name', 's/n', 'parque', 'park', 'playa', 'beach',
  'museo', 'museum', 'mercado', 'market', 'plaza', 'square',
]);

// leisure=park que no es un parque para quien camina: rotondas, camellones, fraccionamientos.
const NOT_A_PLACE = [/\bcamellon\b/, /\brotonda\b/, /\bglorieta\b/, /\bprivadas?\b/, /\bresidencial\b/, /^entrada\b/];

// Esas etiquetas llegan como parque; el id de categoría que les corresponde es sports.
const SPORTS_NAME = [
  /\bunidad des?portiva\b/,
  /\bcanchas?\b/,
  /\bcampo de futbol\b/,
  /\bskate park\b/,
  /\bparque de (futbol|basquet)/,
];

function normalizeName(name) {
  return name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function rejectReason(name) {
  const normalized = normalizeName(name);
  if (GENERIC_NAMES.has(normalized)) return 'generic';
  if (NOT_A_PLACE.some((pattern) => pattern.test(normalized))) return 'notPlace';
  return null;
}

function categoryFor(tags, name) {
  const category = categoryOf(tags);
  if (category !== 'parks') return category;
  const normalized = normalizeName(name);
  return SPORTS_NAME.some((pattern) => pattern.test(normalized)) ? 'sports' : category;
}

// Normaliza un JSON de Overpass al arreglo que se inserta. No toca la red ni la base.
export function mapOverpass(payload, bbox = CANCUN_BBOX) {
  assertBounded(bbox);
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.elements)) {
    throw new Error('La respuesta de Overpass no trae elements');
  }
  const places = [];
  const rejectedIds = [];
  const skipped = emptySkipped();
  const seen = new Set();
  for (const element of payload.elements) {
    if (!element || !OSM_TYPES.has(element.type) || element.id === undefined || element.id === null) {
      skipped.ignored += 1;
      continue;
    }
    const externalId = `${element.type}/${element.id}`;
    if (seen.has(externalId)) {
      skipped.duplicate += 1;
      continue;
    }
    seen.add(externalId);
    const tags = element.tags ?? {};
    const name = spanishName(tags);
    if (!name) {
      skipped.unnamed += 1;
      continue;
    }
    const rejection = rejectReason(name);
    if (rejection) {
      skipped[rejection] += 1;
      rejectedIds.push(externalId);
      continue;
    }
    const category = categoryFor(tags, name);
    if (!category) {
      skipped.uncategorized += 1;
      continue;
    }
    const coords = coordinatesOf(element);
    if (!coords) {
      skipped.coords += 1;
      continue;
    }
    const english = clean(tags['name:en']);
    places.push({
      externalId,
      name,
      category,
      lat: coords.lat,
      lon: coords.lon,
      address: addressOf(tags),
      isFree: isFreeOf(tags),
      ...chainOf(tags, category),
      i18n: english ? { en: { name: english } } : {},
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    });
  }
  return { places, skipped, rejectedIds };
}

export async function fetchOverpass(query, { fetchImpl = fetch, timeoutMs = 120_000 } = {}) {
  const endpoints = process.env.OVERPASS_URL ? [process.env.OVERPASS_URL] : OVERPASS_ENDPOINTS;
  let lastError = new Error('No hubo respuesta de Overpass');
  for (const url of endpoints) {
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        lastError = new Error(`Overpass ${url} respondió ${response.status}`);
        continue;
      }
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.elements)) {
        lastError = new Error(`Overpass ${url} no devolvió elements`);
        continue;
      }
      return { payload, url };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw lastError;
}

async function count(client, sql) {
  const { rows } = await client.query(sql);
  return rows[0].n;
}

// client es un pg.Client (una conexión): BEGIN/COMMIT no se pueden hacer sobre el pool.
export async function upsertOsmPlaces(client, places, retrievedAt, rejectedIds = []) {
  // REPEATABLE READ: el conteo DEMO no ve filas que otro test inserte a mitad de la transacción.
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
  try {
    const demoBefore = await count(
      client,
      `SELECT count(*)::int AS n FROM places
       WHERE data_status = 'DEMO' AND (external_id IS NULL OR external_id NOT LIKE 'test-kh013-%')`,
    );
    const osmBefore = await count(
      client,
      `SELECT count(*)::int AS n FROM places WHERE source_id = 'osm' AND city_id = 'cancun' AND data_status = 'REAL'`,
    );
    let removed = 0;
    if (rejectedIds.length > 0) {
      const deleted = await client.query(
        `DELETE FROM places
         WHERE source_id = 'osm' AND city_id = 'cancun' AND data_status = 'REAL'
           AND external_id = ANY($1::text[])`,
        [rejectedIds],
      );
      removed = deleted.rowCount ?? 0;
    }

    const source = await client.query(`SELECT id FROM data_sources WHERE id = 'osm'`);
    if (source.rowCount === 0) throw new Error('Falta la fuente osm. Ejecuta npm run db:migrate y npm run db:seed.');

    const ids = places.map((place) => place.externalId);
    const existing = await client.query(
      `SELECT external_id FROM places WHERE source_id = 'osm' AND external_id = ANY($1::text[])`,
      [ids],
    );
    const known = new Set(existing.rows.map((row) => row.external_id));

    let inserted = 0;
    let updated = 0;
    let untouched = 0;
    for (const place of places) {
      const result = await client.query(
        `INSERT INTO places (
           city_id, source_id, external_id, name, category, lat, lon, address, is_free,
           i18n, data_status, retrieved_at, is_chain, brand
         ) VALUES (
           'cancun', 'osm', $1, $2, $3, $4, $5, $6, $7,
           $8::jsonb, 'REAL', $9, $10, $11
         )
         ON CONFLICT (source_id, external_id) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           lat = EXCLUDED.lat,
           lon = EXCLUDED.lon,
           address = EXCLUDED.address,
           is_free = EXCLUDED.is_free,
           is_chain = EXCLUDED.is_chain,
           brand = EXCLUDED.brand,
           i18n = EXCLUDED.i18n,
           data_status = 'REAL',
           retrieved_at = EXCLUDED.retrieved_at,
           city_id = EXCLUDED.city_id
         WHERE places.source_id = 'osm' AND places.data_status <> 'DEMO'
         RETURNING id`,
        [
          place.externalId,
          place.name,
          place.category,
          place.lat,
          place.lon,
          place.address,
          place.isFree,
          JSON.stringify(place.i18n ?? {}),
          retrievedAt,
          place.isChain ?? null,
          place.brand ?? null,
        ],
      );
      if (result.rowCount === 0) untouched += 1;
      else if (known.has(place.externalId)) updated += 1;
      else inserted += 1;
    }

    await client.query(`UPDATE data_sources SET retrieved_at = $1 WHERE id = 'osm'`, [retrievedAt]);
    const demoAfter = await count(
      client,
      `SELECT count(*)::int AS n FROM places
       WHERE data_status = 'DEMO' AND (external_id IS NULL OR external_id NOT LIKE 'test-kh013-%')`,
    );
    const osmAfter = await count(
      client,
      `SELECT count(*)::int AS n FROM places WHERE source_id = 'osm' AND city_id = 'cancun' AND data_status = 'REAL'`,
    );
    if (demoAfter !== demoBefore) {
      throw new Error(`La importación iba a modificar filas DEMO (${demoBefore} → ${demoAfter}). Se deshace.`);
    }
    await client.query('COMMIT');
    return { inserted, updated, untouched, removed, demoBefore, demoAfter, osmBefore, osmAfter };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

// La regla vive en shared/db.ts (sslmode en la URL manda; DATABASE_SSL=true si no viene).
async function clientConfig(connectionString) {
  const { databaseSsl } = await import('../apps/api/src/shared/db.ts');
  const ssl = databaseSsl(connectionString);
  return ssl ? { connectionString, ssl } : { connectionString };
}

function loadEnv() {
  const envFile = new URL('../apps/api/.env', import.meta.url);
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

export async function runImport({ fixture, dryRun = false, fetchImpl } = {}) {
  let payload;
  let url = null;
  if (fixture) {
    payload = JSON.parse(await readFile(fixture, 'utf8'));
  } else {
    const fetched = await fetchOverpass(buildOverpassQuery(CANCUN_BBOX), { fetchImpl });
    payload = fetched.payload;
    url = fetched.url;
  }
  const mapped = mapOverpass(payload, CANCUN_BBOX);
  if (dryRun) return { ...mapped, url, written: null, osmTimestamp: payload.osm3s?.timestamp_osm_base ?? null };
  if (mapped.places.length < 1) throw new Error('La consulta no produjo lugares. No se escribió nada.');

  loadEnv();
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL. Copia apps/api/.env.example y descomenta la línea.');
  const retrievedAt = new Date();
  const client = new pg.Client(await clientConfig(process.env.DATABASE_URL));
  await client.connect();
  try {
    const written = await upsertOsmPlaces(client, mapped.places, retrievedAt, mapped.rejectedIds ?? []);
    return { ...mapped, url, written, retrievedAt: retrievedAt.toISOString(), osmTimestamp: payload.osm3s?.timestamp_osm_base ?? null };
  } finally {
    await client.end();
  }
}

function parseArgs(argv) {
  const options = { fixture: null, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--fixture') {
      options.fixture = argv[i + 1];
      if (!options.fixture) throw new Error('--fixture necesita una ruta');
      i += 1;
    } else throw new Error(`Argumento desconocido: ${arg}`);
  }
  return options;
}

function printSummary(result) {
  const byCategory = {};
  for (const place of result.places) byCategory[place.category] = (byCategory[place.category] ?? 0) + 1;
  const categories = Object.entries(byCategory).map(([id, n]) => `${id}=${n}`).join(', ');
  console.log(`Mapeados: ${result.places.length} (${categories || 'ninguno'})`);
  console.log(`Descartados: ${JSON.stringify(result.skipped)}`);
  if (result.url) console.log(`Overpass: ${result.url}`);
  if (result.osmTimestamp) console.log(`Marca de tiempo OSM: ${result.osmTimestamp}`);
  if (result.written) {
    const { inserted, updated, untouched, removed, demoBefore, demoAfter, osmBefore, osmAfter } = result.written;
    console.log(`Escritura: insertados ${inserted}, actualizados ${updated}, no tocados ${untouched}, retirados ${removed ?? 0}`);
    console.log(`Lugares REAL osm en Cancún: ${osmBefore} → ${osmAfter}`);
    console.log(`Filas DEMO: ${demoBefore} → ${demoAfter}`);
    console.log(`data_sources.osm.retrieved_at = ${result.retrievedAt}`);
  } else {
    console.log('Dry-run: no se escribió en la base.');
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log('Uso: npm run db:import-osm -- [--fixture archivo.json] [--dry-run]');
    return null;
  }
  const result = await runImport({ fixture: options.fixture, dryRun: options.dryRun });
  printSummary(result);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
