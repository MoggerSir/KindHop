import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import '../../shared/env.js';
import { createApp } from '../../app.js';
import { closePool, getPool } from '../../shared/db.js';

const skipDb = !process.env.DATABASE_URL && 'sin DATABASE_URL';

let server: Server;
let base: string;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

describe('GET /api/cities/:cityId/districts', () => {
  it('sin DATABASE_URL responde 503 DATABASE_UNAVAILABLE', async () => {
    if (process.env.DATABASE_URL) return;
    const res = await fetch(`${base}/api/cities/cdmx/districts`);
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error.code, 'DATABASE_UNAVAILABLE');
  });

  it('Cancún sin fuente verificada -> 404 MODULE_UNAVAILABLE (aunque no haya BD)', async () => {
    const res = await fetch(`${base}/api/cities/cancun/districts`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'MODULE_UNAVAILABLE');
  });
});

describe('distritos en base de datos', { skip: skipDb }, () => {
  after(closePool);

  it('CDMX devuelve 16 alcaldías REAL con procedencia', async () => {
    const res = await fetch(`${base}/api/cities/cdmx/districts`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.type, 'FeatureCollection');
    assert.equal(body.features.length, 16);
    assert.equal(body.source.dataStatus, 'REAL');
    assert.ok(body.source.url.includes('datos.cdmx.gob.mx'));
    assert.match(body.source.license, /CC-BY/i);
    assert.ok(body.features.every((f: { properties: { kind: string } }) => f.properties.kind === 'ALCALDIA'));
  });

  it('places DEMO de CDMX con district_id asignado (Zócalo en Cuauhtémoc)', async () => {
    const { rows } = await getPool().query<{ name: string; district_name: string | null }>(
      `SELECT p.name, d.name AS district_name
       FROM places p
       LEFT JOIN districts d ON d.id = p.district_id
       WHERE p.source_id = 'kindhop-demo' AND p.city_id = 'cdmx' AND p.external_id = 'cdmx-zocalo'`,
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.district_name, 'Cuauhtémoc');
  });
});