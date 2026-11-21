import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from './app.js';

let server: Server;
let base: string;

before(async () => {
  server = createApp({ requireAuth: false }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

describe('API base', () => {
  it('GET /health responde ok e indica estado de la base de datos', async () => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'kindhop-api');
    assert.equal(typeof body.database?.configured, 'boolean');
    assert.equal(typeof body.database?.connected, 'boolean');
  });

  it('GET /api/cities devuelve las dos ciudades piloto', async () => {
    const res = await fetch(`${base}/api/cities`);
    const body = await res.json();
    assert.deepEqual(body.cities.map((c: { id: string }) => c.id), ['cancun', 'cdmx']);
  });

  it('GET /api/cities/cdmx devuelve configuración distinta a Cancún', async () => {
    const res = await fetch(`${base}/api/cities/cdmx`);
    const { city } = await res.json();
    assert.equal(city.timezone, 'America/Mexico_City');
  });

  it('ciudad desconocida -> 404 CITY_NOT_FOUND', async () => {
    const res = await fetch(`${base}/api/cities/madrid`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'CITY_NOT_FOUND');
  });

  it('cityId malformado -> 400 INVALID_CITY_ID', async () => {
    const res = await fetch(`${base}/api/cities/${encodeURIComponent('<script>')}`);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'INVALID_CITY_ID');
  });

  it('ruta inexistente -> 404 NOT_FOUND con formato de error estándar', async () => {
    const res = await fetch(`${base}/api/nada`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'NOT_FOUND');
  });
});
