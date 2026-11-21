import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../../app.js';
import '../../shared/env.js';
import { closePool, getPool } from '../../shared/db.js';
import { readGtfsDirectory, upsertCdmxGtfs, fixtureDir } from '../../../../../scripts/import-cdmx-gtfs.mjs';

// Transporte de CDMX (KH-007): snapshot GTFS en transit_*. Cancún (lectura en vivo) se prueba en transit.test.ts.
const skip = !process.env.DATABASE_URL && 'sin DATABASE_URL';

let server: Server;
let base: string;

before(async () => {
  server = createApp({ requireAuth: false }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  server.close();
  if (process.env.DATABASE_URL) {
    await restoreRealState();
    await closePool();
  }
});

async function get(path: string) {
  const response = await fetch(`${base}${path}`);
  return { status: response.status, body: await response.json() };
}

// El fixture es el mismo recorte que importa `npm run db:import:cdmx`: sus external_id son los reales.
// Antes de tocar nada se guardan las filas cdmx-gtfs (rutas, paradas, enlaces) y la fila de data_sources,
// y al final se restauran tal cual, así la suite no borra la importación real ni cambia retrieved_at.
type Snapshot = { routes: unknown[]; stops: unknown[]; links: unknown[]; source: unknown[] };
let saved: Snapshot | undefined;

async function snapshotRealState(): Promise<void> {
  const pool = getPool();
  const one = async (sql: string) => ((await pool.query<{ rows: unknown[] | null }>(sql)).rows[0]?.rows ?? []) as unknown[];
  saved = {
    routes: await one(`SELECT jsonb_agg(to_jsonb(r)) AS rows FROM transit_routes r WHERE source_id = 'cdmx-gtfs'`),
    stops: await one(`SELECT jsonb_agg(to_jsonb(s)) AS rows FROM transit_stops s WHERE source_id = 'cdmx-gtfs'`),
    links: await one(
      `SELECT jsonb_agg(to_jsonb(rs)) AS rows FROM transit_route_stops rs
       JOIN transit_routes r ON r.id = rs.route_id WHERE r.source_id = 'cdmx-gtfs'`,
    ),
    source: await one(`SELECT jsonb_agg(to_jsonb(d)) AS rows FROM data_sources d WHERE id = 'cdmx-gtfs'`),
  };
}

async function removeCdmxGtfs(): Promise<void> {
  const pool = getPool();
  await pool.query(`DELETE FROM transit_routes WHERE source_id = 'cdmx-gtfs'`);
  await pool.query(`DELETE FROM transit_stops WHERE source_id = 'cdmx-gtfs'`);
}

async function restoreRealState(): Promise<void> {
  if (!saved) return;
  const pool = getPool();
  const snapshot = saved;
  saved = undefined;
  await removeCdmxGtfs();
  if (snapshot.routes.length > 0) {
    await pool.query(`INSERT INTO transit_routes SELECT * FROM jsonb_populate_recordset(NULL::transit_routes, $1::jsonb)`, [
      JSON.stringify(snapshot.routes),
    ]);
  }
  if (snapshot.stops.length > 0) {
    await pool.query(`INSERT INTO transit_stops SELECT * FROM jsonb_populate_recordset(NULL::transit_stops, $1::jsonb)`, [
      JSON.stringify(snapshot.stops),
    ]);
  }
  if (snapshot.links.length > 0) {
    await pool.query(
      `INSERT INTO transit_route_stops SELECT * FROM jsonb_populate_recordset(NULL::transit_route_stops, $1::jsonb)`,
      [JSON.stringify(snapshot.links)],
    );
  }
  if (snapshot.source.length > 0) {
    await pool.query(
      `UPDATE data_sources d SET name = s.name, url = s.url, license = s.license, attribution = s.attribution,
         data_status = s.data_status, retrieved_at = s.retrieved_at, notes = s.notes
       FROM jsonb_populate_recordset(NULL::data_sources, $1::jsonb) s WHERE d.id = s.id`,
      [JSON.stringify(snapshot.source)],
    );
  }
}

async function resetToEmpty(): Promise<void> {
  const { meta } = await readGtfsDirectory(fixtureDir);
  await removeCdmxGtfs();
  await getPool().query(
    `UPDATE data_sources
     SET name = $1, url = $2, license = $3, attribution = $4, data_status = 'REAL', retrieved_at = NULL, notes = $5
     WHERE id = 'cdmx-gtfs'`,
    [meta.name, meta.datasetUrl, meta.license, meta.attribution, meta.notes],
  );
}

describe('GET /api/cities/cdmx/transit sin base', () => {
  it('sin DATABASE_URL, CDMX responde 503 DATABASE_UNAVAILABLE', async () => {
    if (process.env.DATABASE_URL) return;
    const cdmx = await get('/api/cities/cdmx/transit');
    assert.equal(cdmx.status, 503);
    assert.equal(cdmx.body.error.code, 'DATABASE_UNAVAILABLE');
  });
});

describe('GET /transit contra PostgreSQL', { skip, concurrency: 1 }, () => {
  before(snapshotRealState);
  after(restoreRealState);

  it('lista vacía, luego el fixture, y un segundo import no duplica', async () => {
    await resetToEmpty();
    const empty = await get('/api/cities/cdmx/transit');
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body.routes, []);
    assert.equal(empty.body.source.name, 'GTFS estático CDMX (SEMOVI)');
    assert.equal(empty.body.source.license, 'CC BY 4.0');
    assert.equal(empty.body.source.licenseUrl, 'https://creativecommons.org/licenses/by/4.0/deed.es');
    assert.equal(empty.body.source.dataStatus, 'REAL');
    assert.equal(empty.body.source.retrievedAt, null);

    const { routes, meta } = await readGtfsDirectory(fixtureDir);
    const client = await getPool().connect();
    try {
      await upsertCdmxGtfs(client, routes, meta);
      await upsertCdmxGtfs(client, routes, meta);
    } finally {
      client.release();
    }

    const { status, body } = await get('/api/cities/cdmx/transit');
    assert.equal(status, 200);
    assert.equal(body.routes.length, 1);
    const route = body.routes[0];
    assert.equal(route.id, 'B_CMX0300L1');
    assert.equal(route.name, 'Indios Verdes - El Caminero');
    assert.equal(route.shortName, '1');
    assert.equal(route.mode, 'brt');
    assert.equal(route.color, '#D40D0D');
    assert.equal(route.geometry.type, 'LineString');
    assert.equal(route.geometry.coordinates.length, 131);
    assert.equal(route.stops.length, 46);
    assert.equal(route.stops[0].name, 'Indios Verdes');
    assert.equal(route.stops[0].coordinates[0] < 0, true);
    assert.equal(route.fareCents, undefined);
    assert.equal('arrivalTime' in route, false);
    assert.equal(body.source.dataStatus, 'REAL');
    assert.equal(body.source.retrievedAt, '2026-11-21T02:50:00.000Z');
    assert.equal(body.source.attribution, 'Secretaría de Movilidad (SEMOVI), Gobierno de la Ciudad de México');
    assert.equal(body.source.url, 'https://datos.cdmx.gob.mx/dataset/gtfs');

    const counts = await getPool().query<{ routes: number; stops: number }>(
      `SELECT
         (SELECT count(*)::int FROM transit_routes WHERE source_id = 'cdmx-gtfs' AND external_id = 'B_CMX0300L1') AS routes,
         (SELECT count(*)::int FROM transit_route_stops rs
            JOIN transit_routes r ON r.id = rs.route_id
           WHERE r.source_id = 'cdmx-gtfs' AND r.external_id = 'B_CMX0300L1') AS stops`,
    );
    assert.equal(counts.rows[0].routes, 1);
    assert.equal(counts.rows[0].stops, 46);
  });
});
