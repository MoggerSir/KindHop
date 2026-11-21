import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { fileURLToPath } from 'node:url';
import { createApp } from '../../app.js';
import '../../shared/env.js';
import { closePool, getPool } from '../../shared/db.js';
import { CANCUN_BBOX, mapOverpass, upsertOsmPlaces } from '../../../../../scripts/fetch-osm-pois.mjs';

const fixturePath = fileURLToPath(new URL('../../../../../scripts/fixtures/overpass-cancun-sample.json', import.meta.url));
const skip = !process.env.DATABASE_URL && 'sin DATABASE_URL';
const FAKE_DEMO = 'node/9000000000001';
const FAKE_I18N = 'node/9000000000002';

let server: Server;
let base: string;

before(async () => {
  server = createApp({ requireAuth: false }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

function importedExternalIds(): string[] {
  const payload = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const { places } = mapOverpass(payload, CANCUN_BBOX);
  return [...places.map((place: { externalId: string }) => place.externalId), FAKE_DEMO, FAKE_I18N];
}

async function removeTestPlaces(): Promise<void> {
  await getPool().query(
    `DELETE FROM places WHERE source_id = 'osm' AND external_id = ANY($1::text[])`,
    [importedExternalIds()],
  );
}

// El fixture usa ids OSM reales (Playa Delfines, etc.). Si la base ya tiene la importación real,
// el test guarda esas filas y la fecha de data_sources.osm antes de tocarlas y las restaura al final,
// así la suite no borra datos REAL ni deja retrieved_at con la fecha del fixture.
let savedPlaces: unknown[] | undefined;
let savedRetrievedAt: Date | null | undefined;
let savedEventLinks: { id: string; place_id: string }[] = [];

async function snapshotRealState(): Promise<void> {
  const rows = await getPool().query<{ rows: unknown[] | null }>(
    `SELECT jsonb_agg(to_jsonb(p)) AS rows FROM places p WHERE source_id = 'osm' AND external_id = ANY($1::text[])`,
    [importedExternalIds()],
  );
  savedPlaces = rows.rows[0].rows ?? [];
  // events.place_id es ON DELETE SET NULL: guarda los enlaces para no perderlos al restaurar.
  const links = await getPool().query<{ id: string; place_id: string }>(
    `SELECT e.id, e.place_id FROM events e JOIN places p ON p.id = e.place_id
     WHERE p.source_id = 'osm' AND p.external_id = ANY($1::text[])`,
    [importedExternalIds()],
  );
  savedEventLinks = links.rows;
  const source = await getPool().query<{ retrieved_at: Date | null }>(
    `SELECT retrieved_at FROM data_sources WHERE id = 'osm'`,
  );
  savedRetrievedAt = source.rows[0]?.retrieved_at ?? null;
}

async function restoreRealState(): Promise<void> {
  if (savedPlaces === undefined) return; // ya restaurado (o la suite con base no corrió)
  await removeTestPlaces();
  if (savedPlaces.length > 0) {
    await getPool().query(
      `INSERT INTO places SELECT * FROM jsonb_populate_recordset(NULL::places, $1::jsonb)`,
      [JSON.stringify(savedPlaces)],
    );
  }
  for (const link of savedEventLinks) {
    await getPool().query(`UPDATE events SET place_id = $2 WHERE id = $1`, [link.id, link.place_id]);
  }
  await getPool().query(`UPDATE data_sources SET retrieved_at = $1 WHERE id = 'osm'`, [savedRetrievedAt]);
  savedPlaces = undefined;
  savedRetrievedAt = undefined;
  savedEventLinks = [];
}

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

describe('GET /pois', () => {
  it('CDMX no tiene adaptador -> 404 MODULE_UNAVAILABLE', async () => {
    const { status, body } = await get('/api/cities/cdmx/pois');
    assert.equal(status, 404);
    assert.equal(body.error.code, 'MODULE_UNAVAILABLE');
  });

  it('ciudad desconocida -> 404 CITY_NOT_FOUND', async () => {
    const { status, body } = await get('/api/cities/merida/pois');
    assert.equal(status, 404);
    assert.equal(body.error.code, 'CITY_NOT_FOUND');
  });

  it('cityId malformado -> 400 INVALID_CITY_ID', async () => {
    const { status, body } = await get(`/api/cities/${encodeURIComponent('<script>')}/pois`);
    assert.equal(status, 400);
    assert.equal(body.error.code, 'INVALID_CITY_ID');
  });

  it('categoría malformada -> 400 VALIDATION', async () => {
    const { status, body } = await get('/api/cities/cancun/pois?category=Playa');
    assert.equal(status, 400);
    assert.equal(body.error.code, 'VALIDATION');
  });

  it('sin DATABASE_URL, Cancún responde 503 y CDMX sigue en 404', async () => {
    if (process.env.DATABASE_URL) return;
    const cancun = await get('/api/cities/cancun/pois');
    assert.equal(cancun.status, 503);
    assert.equal(cancun.body.error.code, 'DATABASE_UNAVAILABLE');
    const cdmx = await get('/api/cities/cdmx/pois');
    assert.equal(cdmx.status, 404);
    assert.equal(cdmx.body.error.code, 'MODULE_UNAVAILABLE');
  });
});

describe('GET /pois contra PostgreSQL', { skip }, () => {
  const retrievedAt = new Date('2026-11-21T03:00:00.000Z');

  before(async () => {
    await snapshotRealState();
    await removeTestPlaces();
    const payload = JSON.parse(readFileSync(fixturePath, 'utf8'));
    const { places } = mapOverpass(payload, CANCUN_BBOX);
    const client = await getPool().connect();
    try {
      await upsertOsmPlaces(client, places, retrievedAt);
    } finally {
      client.release();
    }
  });

  after(restoreRealState);

  it('devuelve los lugares REAL del fixture con fuente ODbL y filtra por categoría', async () => {
    const all = await get('/api/cities/cancun/pois');
    assert.equal(all.status, 200);
    assert.equal(all.body.source.name, 'OpenStreetMap vía Overpass');
    assert.equal(all.body.source.license, 'ODbL 1.0');
    assert.equal(all.body.source.attribution, '© OpenStreetMap contributors');
    assert.equal(all.body.source.url, 'https://www.openstreetmap.org/copyright');
    assert.equal(all.body.source.dataStatus, 'REAL');
    assert.equal(all.body.source.retrievedAt, '2026-11-21T03:00:00.000Z');
    assert.ok(all.body.pois.every((poi: { dataStatus: string }) => poi.dataStatus === 'REAL'));
    const counted = await getPool().query<{ n: number }>(
      `SELECT count(*)::int AS n FROM places WHERE city_id = 'cancun' AND source_id = 'osm' AND data_status = 'REAL'`,
    );
    assert.equal(all.body.pois.length, counted.rows[0].n);

    const beach = all.body.pois.find((poi: { name: string }) => poi.name === 'Playa Delfines');
    assert.ok(beach);
    assert.equal(beach.category, 'beaches');
    assert.deepEqual(beach.coordinates, [-86.778583, 21.0619642]);
    assert.equal(beach.url, 'https://www.openstreetmap.org/node/2611777999');
    assert.equal(beach.i18n, undefined);
    assert.match(beach.id, /^\d+$/);

    const beaches = await get('/api/cities/cancun/pois?category=beaches');
    assert.ok(beaches.body.pois.every((poi: { category: string }) => poi.category === 'beaches'));
    assert.ok(beaches.body.pois.some((poi: { name: string }) => poi.name === 'Playa Delfines'));
    assert.equal(beaches.body.pois.some((poi: { name: string }) => poi.name === 'Museo Maya de Cancún'), false);

    const museums = await get('/api/cities/cancun/pois?category=museums');
    assert.ok(museums.body.pois.some((poi: { name: string }) => poi.name === 'Museo Maya de Cancún'));

    const emptyCategory = await get('/api/cities/cancun/pois?category=');
    assert.equal(emptyCategory.status, 200);
    assert.equal(emptyCategory.body.pois.length, all.body.pois.length);
  });

  it('las fotos genéricas de lugares REAL salen como DEMO, estables con o sin filtro y sin escribir en la BD', async () => {
    const all = await get('/api/cities/cancun/pois');
    for (const poi of all.body.pois as { imageUrl: string; imageDataStatus: string }[]) {
      assert.match(poi.imageUrl, /^\/demo\//);
      assert.equal(poi.imageDataStatus, 'DEMO');
    }
    const beaches = await get('/api/cities/cancun/pois?category=beaches');
    for (const poi of beaches.body.pois as { id: string; imageUrl: string }[]) {
      assert.equal(poi.imageUrl, all.body.pois.find((p: { id: string }) => p.id === poi.id).imageUrl);
    }
    const stored = await getPool().query<{ n: number }>(
      `SELECT count(*)::int AS n FROM places WHERE source_id = 'osm' AND data_status = 'REAL' AND image_url IS NOT NULL`,
    );
    assert.equal(stored.rows[0].n, 0);
  });

  it('reimportar el mismo fixture no duplica y no toca filas DEMO', async () => {
    const before = await getPool().query<{ n: number; demo: number }>(
      `SELECT (count(*) FILTER (WHERE source_id = 'osm' AND city_id = 'cancun' AND data_status = 'REAL'))::int AS n,
              (count(*) FILTER (WHERE data_status = 'DEMO' AND (external_id IS NULL OR external_id NOT LIKE 'test-kh013-%')))::int AS demo
       FROM places`,
    );
    const demoPlace = await getPool().query<{ name: string; data_status: string }>(
      `SELECT name, data_status FROM places WHERE source_id = 'kindhop-demo' AND external_id = 'cun-palapas'`,
    );
    await getPool().query(
      `INSERT INTO places (city_id, source_id, external_id, name, category, lat, lon, data_status)
       VALUES ('cancun', 'osm', $1, 'NO TOCAR', 'parks', 21.1, -86.8, 'DEMO')`,
      [FAKE_DEMO],
    );

    const payload = JSON.parse(readFileSync(fixturePath, 'utf8'));
    const { places } = mapOverpass(payload, CANCUN_BBOX);
    places.push({
      externalId: FAKE_DEMO,
      name: 'Intento de sobrescritura',
      category: 'parks',
      lat: 21.2,
      lon: -86.9,
      address: null,
      isFree: null,
      i18n: {},
      sourceUrl: 'https://www.openstreetmap.org/node/9000000000001',
    });
    const client = await getPool().connect();
    try {
      const written = await upsertOsmPlaces(client, places, retrievedAt);
      assert.equal(written.inserted, 0);
      assert.equal(written.untouched, 1);
      assert.equal(written.demoBefore, written.demoAfter);
    } finally {
      client.release();
    }

    const after = await getPool().query<{ n: number; demo: number }>(
      `SELECT (count(*) FILTER (WHERE source_id = 'osm' AND city_id = 'cancun' AND data_status = 'REAL'))::int AS n,
              (count(*) FILTER (WHERE data_status = 'DEMO' AND (external_id IS NULL OR external_id NOT LIKE 'test-kh013-%')))::int AS demo
       FROM places`,
    );
    assert.equal(after.rows[0].n, before.rows[0].n);
    assert.equal(after.rows[0].demo, before.rows[0].demo + 1);
    const guarded = await getPool().query<{ name: string; data_status: string }>(
      `SELECT name, data_status FROM places WHERE source_id = 'osm' AND external_id = $1`,
      [FAKE_DEMO],
    );
    assert.deepEqual(guarded.rows[0], { name: 'NO TOCAR', data_status: 'DEMO' });
    const demoAgain = await getPool().query<{ name: string; data_status: string }>(
      `SELECT name, data_status FROM places WHERE source_id = 'kindhop-demo' AND external_id = 'cun-palapas'`,
    );
    assert.deepEqual(demoAgain.rows, demoPlace.rows);

    const { body } = await get('/api/cities/cancun/pois');
    assert.equal(body.pois.some((poi: { name: string }) => poi.name === 'NO TOCAR'), false);
  });

  it('expone name:en cuando el lugar lo trae', async () => {
    const client = await getPool().connect();
    try {
      await upsertOsmPlaces(client, [{
        externalId: FAKE_I18N,
        name: 'Playa de prueba',
        category: 'beaches',
        lat: 21.05,
        lon: -86.77,
        address: null,
        isFree: true,
        i18n: { en: { name: 'Test Beach' } },
        sourceUrl: 'https://www.openstreetmap.org/node/9000000000002',
      }], retrievedAt);
    } finally {
      client.release();
    }
    const { body } = await get('/api/cities/cancun/pois?category=beaches');
    const poi = body.pois.find((item: { url?: string }) => item.url?.endsWith('/node/9000000000002'));
    assert.equal(poi.name, 'Playa de prueba');
    assert.deepEqual(poi.i18n, { en: { name: 'Test Beach' } });
  });
});
