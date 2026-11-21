import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../../app.js';
import '../../shared/env.js';
import { closePool, getPool } from '../../shared/db.js';
import { readGtfsDirectory, upsertCdmxGtfs, fixtureDir } from '../../../../../scripts/import-cdmx-gtfs.mjs';

const skip = !process.env.DATABASE_URL && 'sin DATABASE_URL';

let server: Server;
let base: string;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  server.close();
  if (process.env.DATABASE_URL) {
    await removeFixture();
    await closePool();
  }
});

async function get(path: string) {
  const response = await fetch(`${base}${path}`);
  return { status: response.status, body: await response.json() };
}

async function removeFixture(): Promise<void> {
  const { routes, meta } = await readGtfsDirectory(fixtureDir);
  const routeIds = routes.map((route: { externalId: string }) => route.externalId);
  const stopIds = routes.flatMap((route: { stops: { externalId: string }[] }) => route.stops.map((stop) => stop.externalId));
  const pool = getPool();
  await pool.query(`DELETE FROM transit_routes WHERE source_id = 'cdmx-gtfs' AND external_id = ANY($1::text[])`, [routeIds]);
  await pool.query(`DELETE FROM transit_stops WHERE source_id = 'cdmx-gtfs' AND external_id = ANY($1::text[])`, [stopIds]);
  await pool.query(
    `UPDATE data_sources
     SET name = $1, url = $2, license = $3, attribution = $4, data_status = 'REAL', retrieved_at = NULL, notes = $5
     WHERE id = 'cdmx-gtfs'`,
    [meta.name, meta.datasetUrl, meta.license, meta.attribution, meta.notes],
  );
}

describe('GET /transit', () => {
  it('Cancún no tiene adaptador -> 404 MODULE_UNAVAILABLE', async () => {
    const { status, body } = await get('/api/cities/cancun/transit');
    assert.equal(status, 404);
    assert.equal(body.error.code, 'MODULE_UNAVAILABLE');
  });

  it('ciudad desconocida -> 404 CITY_NOT_FOUND', async () => {
    const { status, body } = await get('/api/cities/merida/transit');
    assert.equal(status, 404);
    assert.equal(body.error.code, 'CITY_NOT_FOUND');
  });

  it('cityId malformado -> 400 INVALID_CITY_ID', async () => {
    const { status, body } = await get(`/api/cities/${encodeURIComponent('!')}/transit`);
    assert.equal(status, 400);
    assert.equal(body.error.code, 'INVALID_CITY_ID');
  });

  it('sin DATABASE_URL, CDMX responde 503 y Cancún sigue en 404', async () => {
    if (process.env.DATABASE_URL) return;
    const cdmx = await get('/api/cities/cdmx/transit');
    assert.equal(cdmx.status, 503);
    assert.equal(cdmx.body.error.code, 'DATABASE_UNAVAILABLE');
    const cancun = await get('/api/cities/cancun/transit');
    assert.equal(cancun.status, 404);
    assert.equal(cancun.body.error.code, 'MODULE_UNAVAILABLE');
  });
});

describe('GET /transit contra PostgreSQL', { skip, concurrency: 1 }, () => {
  it('lista vacía, luego el fixture, y un segundo import no duplica', async () => {
    await removeFixture();
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
