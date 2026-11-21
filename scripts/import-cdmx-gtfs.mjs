#!/usr/bin/env node
// Importa un subconjunto del GTFS estático de SEMOVI (CDMX) a transit_*.
// No descarga nada: lee una carpeta local (por defecto el fixture recortado).
// Upsert por (source_id, external_id). fare_cents solo si el feed trae tarifa.
// Un viaje representativo por ruta: el de más paradas en stop_times; empate por trip_id.
//
//   npm run db:import:cdmx
//   npm run db:import:cdmx -- --dir carpeta --dry-run

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';

const SOURCE_ID = 'cdmx-gtfs';
const CITY_ID = 'cdmx';
const FIXTURE_DIR = fileURLToPath(new URL('./fixtures/cdmx-gtfs/', import.meta.url));

const GTFS_FILES = ['agency.txt', 'routes.txt', 'trips.txt', 'stop_times.txt', 'stops.txt', 'shapes.txt'];

export function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < src.length; i += 1) {
    const char = src[i];
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && src[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell !== '')) rows.push(row);
  }
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  return body.map((cells) => {
    const record = {};
    header.forEach((key, index) => {
      record[key] = cells[index] ?? '';
    });
    return record;
  });
}

export function normalizeColor(raw) {
  const text = (raw ?? '').trim();
  if (!text) return null;
  const hex = text.startsWith('#') ? text.slice(1) : text;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return `#${hex.toUpperCase()}`;
}

function fold(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

// route_type GTFS: 1 metro, 3 bus. Metrobús publica type 3; el nombre de la agencia lo distingue.
export function modeFor(agencyName, routeType) {
  const name = fold(agencyName ?? '');
  if (name.includes('metrobus')) return 'brt';
  if (routeType === '1' || name.includes('metro')) return 'metro';
  if (routeType === '3') return 'bus';
  return 'other';
}

export function priceToCents(price) {
  if (typeof price !== 'string' || !/^\d+(\.\d{1,2})?$/.test(price)) return undefined;
  const [whole, frac = ''] = price.split('.');
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));
}

// Una sola tarifa de ruta, sin origen/destino. Si hay varias o el precio no es exacto, no inventamos.
export function fareCentsForRoute(routeId, attributes = [], rules = []) {
  if (attributes.length === 0 || rules.length === 0) return undefined;
  const fareIds = rules
    .filter((rule) => rule.route_id === routeId && !rule.origin_id && !rule.destination_id && !rule.contains_id)
    .map((rule) => rule.fare_id);
  const unique = [...new Set(fareIds)];
  if (unique.length !== 1) return undefined;
  const fare = attributes.find((row) => row.fare_id === unique[0]);
  if (!fare) return undefined;
  return priceToCents(fare.price);
}

export function pickRepresentativeTrip(trips, stopCounts) {
  const usable = trips.filter((trip) => trip.shape_id && (stopCounts.get(trip.trip_id) ?? 0) >= 2);
  usable.sort((a, b) => {
    const byStops = stopCounts.get(b.trip_id) - stopCounts.get(a.trip_id);
    if (byStops !== 0) return byStops;
    if (a.trip_id < b.trip_id) return -1;
    if (a.trip_id > b.trip_id) return 1;
    return 0;
  });
  return usable[0] ?? null;
}

function requireNumber(raw, label) {
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${label} no es un número: ${raw}`);
  return value;
}

function requireSequence(raw, label) {
  if (!/^\d+$/.test(raw ?? '')) throw new Error(`${label} no es un entero: ${raw}`);
  return Number(raw);
}

export function buildRoutes(tables) {
  const agencies = new Map((tables.agency ?? []).map((row) => [row.agency_id, row.agency_name ?? '']));
  const stopCounts = new Map();
  const timesByTrip = new Map();
  for (const row of tables.stopTimes ?? []) {
    stopCounts.set(row.trip_id, (stopCounts.get(row.trip_id) ?? 0) + 1);
    const list = timesByTrip.get(row.trip_id) ?? [];
    list.push(row);
    timesByTrip.set(row.trip_id, list);
  }
  const tripsByRoute = new Map();
  for (const trip of tables.trips ?? []) {
    const list = tripsByRoute.get(trip.route_id) ?? [];
    list.push(trip);
    tripsByRoute.set(trip.route_id, list);
  }
  const stopsById = new Map((tables.stops ?? []).map((row) => [row.stop_id, row]));
  const shapes = new Map();
  for (const point of tables.shapes ?? []) {
    const list = shapes.get(point.shape_id) ?? [];
    list.push(point);
    shapes.set(point.shape_id, list);
  }

  const routes = [];
  for (const route of tables.routes ?? []) {
    const trip = pickRepresentativeTrip(tripsByRoute.get(route.route_id) ?? [], stopCounts);
    if (!trip) throw new Error(`La ruta ${route.route_id} no tiene un viaje con trazo y al menos dos paradas`);
    const shape = (shapes.get(trip.shape_id) ?? []).slice().sort(
      (a, b) => requireSequence(a.shape_pt_sequence, 'shape_pt_sequence') - requireSequence(b.shape_pt_sequence, 'shape_pt_sequence'),
    );
    if (shape.length < 2) throw new Error(`La ruta ${route.route_id} no tiene trazo (shape ${trip.shape_id})`);
    const coordinates = shape.map((point) => {
      const lon = requireNumber(point.shape_pt_lon, 'shape_pt_lon');
      const lat = requireNumber(point.shape_pt_lat, 'shape_pt_lat');
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) throw new Error(`Coordenada de trazo fuera de rango en ${route.route_id}`);
      return [lon, lat];
    });
    const times = (timesByTrip.get(trip.trip_id) ?? []).slice().sort(
      (a, b) => requireSequence(a.stop_sequence, 'stop_sequence') - requireSequence(b.stop_sequence, 'stop_sequence'),
    );
    const sequences = times.map((row) => requireSequence(row.stop_sequence, 'stop_sequence'));
    if (new Set(sequences).size !== sequences.length) throw new Error(`stop_sequence repetido en el viaje ${trip.trip_id}`);
    const stops = times.map((row) => {
      const stop = stopsById.get(row.stop_id);
      if (!stop) throw new Error(`Falta la parada ${row.stop_id} en stops.txt`);
      const lat = requireNumber(stop.stop_lat, 'stop_lat');
      const lon = requireNumber(stop.stop_lon, 'stop_lon');
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) throw new Error(`Coordenada de parada fuera de rango: ${row.stop_id}`);
      const name = (stop.stop_name ?? '').trim();
      if (!name) throw new Error(`La parada ${row.stop_id} no tiene nombre`);
      return {
        externalId: row.stop_id,
        name,
        lat,
        lon,
        sequence: requireSequence(row.stop_sequence, 'stop_sequence'),
      };
    });
    const longName = (route.route_long_name ?? '').trim();
    const shortName = (route.route_short_name ?? '').trim();
    routes.push({
      externalId: route.route_id,
      name: longName || shortName || route.route_id,
      shortName: shortName || null,
      mode: modeFor(agencies.get(route.agency_id) ?? '', route.route_type ?? ''),
      color: normalizeColor(route.route_color),
      geometry: { type: 'LineString', coordinates },
      fareCents: fareCentsForRoute(route.route_id, tables.fareAttributes, tables.fareRules),
      representativeTripId: trip.trip_id,
      stops,
    });
  }
  if (routes.length === 0) throw new Error('El GTFS no tiene rutas');
  return routes;
}

async function readOptional(dir, name) {
  const path = join(dir, name);
  if (!existsSync(path)) return [];
  return parseCsv(await readFile(path, 'utf8'));
}

export async function readGtfsDirectory(dir) {
  const tables = {};
  for (const name of GTFS_FILES) {
    const path = join(dir, name);
    if (!existsSync(path)) throw new Error(`Falta ${name} en ${dir}`);
    tables[name.replace('.txt', '').replace('stop_times', 'stopTimes')] = parseCsv(await readFile(path, 'utf8'));
  }
  tables.agency = tables.agency ?? [];
  tables.fareAttributes = await readOptional(dir, 'fare_attributes.txt');
  tables.fareRules = await readOptional(dir, 'fare_rules.txt');
  const metaPath = join(dir, 'SOURCE.json');
  if (!existsSync(metaPath)) throw new Error(`Falta SOURCE.json en ${dir} (licencia y fecha de consulta; no se inventan)`);
  const meta = JSON.parse(await readFile(metaPath, 'utf8'));
  for (const key of ['name', 'datasetUrl', 'license', 'attribution', 'retrievedAt', 'notes']) {
    if (typeof meta[key] !== 'string' || !meta[key].trim()) throw new Error(`SOURCE.json: falta ${key}`);
  }
  if (Number.isNaN(Date.parse(meta.retrievedAt))) throw new Error('SOURCE.json: retrievedAt no es una fecha');
  return { routes: buildRoutes(tables), meta };
}

export async function upsertCdmxGtfs(client, routes, meta) {
  await client.query('BEGIN');
  try {
    const source = await client.query(`SELECT id FROM data_sources WHERE id = $1`, [SOURCE_ID]);
    if (source.rowCount === 0) throw new Error('Falta la fuente cdmx-gtfs. Ejecuta npm run db:migrate && npm run db:seed.');
    await client.query(
      `UPDATE data_sources
       SET name = $1, url = $2, license = $3, attribution = $4, data_status = 'REAL', retrieved_at = $5, notes = $6
       WHERE id = $7`,
      [meta.name, meta.datasetUrl, meta.license, meta.attribution, meta.retrievedAt, meta.notes, SOURCE_ID],
    );
    for (const route of routes) {
      const inserted = await client.query(
        `INSERT INTO transit_routes (
           city_id, source_id, external_id, name, short_name, mode, color, geometry, fare_cents
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
         ON CONFLICT (source_id, external_id) DO UPDATE SET
           city_id = EXCLUDED.city_id,
           name = EXCLUDED.name,
           short_name = EXCLUDED.short_name,
           mode = EXCLUDED.mode,
           color = EXCLUDED.color,
           geometry = EXCLUDED.geometry,
           fare_cents = EXCLUDED.fare_cents
         RETURNING id`,
        [
          CITY_ID,
          SOURCE_ID,
          route.externalId,
          route.name,
          route.shortName,
          route.mode,
          route.color,
          JSON.stringify(route.geometry),
          route.fareCents ?? null,
        ],
      );
      const routeId = inserted.rows[0].id;
      const linked = [];
      for (const stop of route.stops) {
        const stopRow = await client.query(
          `INSERT INTO transit_stops (city_id, source_id, external_id, name, lat, lon)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (source_id, external_id) DO UPDATE SET
             city_id = EXCLUDED.city_id,
             name = EXCLUDED.name,
             lat = EXCLUDED.lat,
             lon = EXCLUDED.lon
           RETURNING id`,
          [CITY_ID, SOURCE_ID, stop.externalId, stop.name, stop.lat, stop.lon],
        );
        linked.push({ id: stopRow.rows[0].id, sequence: stop.sequence });
      }
      await client.query(`DELETE FROM transit_route_stops WHERE route_id = $1`, [routeId]);
      for (const stop of linked) {
        await client.query(
          `INSERT INTO transit_route_stops (route_id, stop_id, sequence) VALUES ($1, $2, $3)`,
          [routeId, stop.id, stop.sequence],
        );
      }
    }
    await client.query('COMMIT');
    return {
      routes: routes.length,
      stops: routes.reduce((sum, route) => sum + route.stops.length, 0),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function clientConfig(connectionString) {
  const { databaseSsl } = await import('../apps/api/src/shared/db.ts');
  const ssl = databaseSsl(connectionString);
  return ssl ? { connectionString, ssl } : { connectionString };
}

function loadEnv() {
  const envFile = new URL('../apps/api/.env', import.meta.url);
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

export async function runImport({ dir = FIXTURE_DIR, dryRun = false } = {}) {
  const { routes, meta } = await readGtfsDirectory(dir);
  if (dryRun) return { routes, meta, written: null };
  loadEnv();
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL. Copia apps/api/.env.example y descomenta la línea.');
  const client = new pg.Client(await clientConfig(process.env.DATABASE_URL));
  await client.connect();
  try {
    const written = await upsertCdmxGtfs(client, routes, meta);
    return { routes, meta, written };
  } finally {
    await client.end();
  }
}

function parseArgs(argv) {
  const options = { dir: FIXTURE_DIR, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dir') {
      options.dir = argv[i + 1];
      if (!options.dir) throw new Error('--dir necesita una ruta');
      i += 1;
    } else throw new Error(`Argumento desconocido: ${arg}`);
  }
  return options;
}

function printSummary(result) {
  for (const route of result.routes) {
    console.log(
      `${route.shortName ?? route.externalId} ${route.name} · ${route.mode} · viaje ${route.representativeTripId} · ${route.stops.length} paradas · ${route.geometry.coordinates.length} puntos · tarifa ${route.fareCents ?? 'no publicada'}`,
    );
  }
  console.log(`Fuente: ${result.meta.name}`);
  console.log(`Consultado: ${result.meta.retrievedAt}`);
  if (result.written) console.log(`Escritura: ${result.written.routes} rutas, ${result.written.stops} paradas (upsert)`);
  else console.log('Dry-run: no se escribió en la base.');
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log('Uso: npm run db:import:cdmx -- [--dir carpeta-gtfs] [--dry-run]');
    return null;
  }
  const result = await runImport({ dir: options.dir, dryRun: options.dryRun });
  printSummary(result);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export const fixtureDir = FIXTURE_DIR;
export const scriptDir = dirname(fileURLToPath(import.meta.url));
