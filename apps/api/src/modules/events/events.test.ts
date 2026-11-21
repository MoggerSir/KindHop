import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import '../../shared/env.js';
import { createApp } from '../../app.js';
import { closePool, getPool } from '../../shared/db.js';
import { listUpcomingEvents } from './events.db.js';

const skipDb = !process.env.DATABASE_URL && 'sin DATABASE_URL';

let server: Server;
let base: string;

before(async () => {
  server = createApp({ requireAuth: false }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

describe('GET /api/cities/:cityId/events', () => {
  it('sin DATABASE_URL responde 503 DATABASE_UNAVAILABLE', async () => {
    if (process.env.DATABASE_URL) return;
    const res = await fetch(`${base}/api/cities/cancun/events`);
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error.code, 'DATABASE_UNAVAILABLE');
  });

  it('cityId malformado -> 400 INVALID_CITY_ID (aunque no haya BD)', async () => {
    const res = await fetch(`${base}/api/cities/${encodeURIComponent('!')}/events`);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'INVALID_CITY_ID');
  });
});

describe('eventos en base de datos', { skip: skipDb }, () => {
  after(closePool);

  it('Cancún y CDMX devuelven eventos DEMO futuros por HTTP', async () => {
    for (const cityId of ['cancun', 'cdmx'] as const) {
      const res = await fetch(`${base}/api/cities/${cityId}/events`);
      assert.equal(res.status, 200);
      const { events } = await res.json();
      assert.ok(events.length > 0);
      assert.ok(events.every((e: { dataStatus: string }) => e.dataStatus === 'DEMO'));
      assert.ok(events.every((e: { startsAt: string; endsAt?: string }) => Date.parse(e.endsAt ?? e.startsAt) > Date.now()));
    }
  });

  it('CDMX sin foto omite image en el contrato', async () => {
    const res = await fetch(`${base}/api/cities/cdmx/events`);
    const { events } = await res.json();
    const zocalo = events.find((e: { id: string }) => e.id === 'demo-zocalo-concert');
    assert.ok(zocalo);
    assert.equal(zocalo.image, undefined);
  });

  it('el lugar solo viaja si el evento apunta a una fila de places, con sus coordenadas', async () => {
    const res = await fetch(`${base}/api/cities/cancun/events`);
    const { events } = await res.json();
    const concert = events.find((e: { id: string }) => e.id === 'demo-concert');
    assert.equal(concert?.place?.name, 'Parque de las Palapas');
    assert.deepEqual(concert?.place?.coordinates, [-86.8265, 21.1617]);
    assert.equal(concert?.place?.dataStatus, 'DEMO');
    const trail = events.find((e: { id: string }) => e.id === 'demo-food-trail');
    assert.ok(trail);
    assert.equal(trail.place, undefined);
  });

  it('?lang=en traduce títulos con i18n', async () => {
    const res = await fetch(`${base}/api/cities/cancun/events?lang=en`);
    const { events } = await res.json();
    const concert = events.find((e: { id: string }) => e.id === 'demo-concert');
    assert.equal(concert?.title, 'Concert at Las Palapas');
  });

  it('no incluye eventos ya terminados', async () => {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO events (city_id, source_id, external_id, title, starts_at, ends_at, data_status)
         VALUES ('cancun', 'kindhop-demo', 'past-test', 'Pasado', now() - interval '2 days', now() - interval '1 day', 'DEMO')`,
      );
      const events = await listUpcomingEvents('cancun', 'es');
      assert.ok(!events.some((e) => e.id === 'demo-past-test'));
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('ciudad sin eventos vigentes devuelve lista vacía', async () => {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM events WHERE city_id = 'cdmx'`);
      const { rows } = await client.query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM events
         WHERE city_id = 'cdmx' AND COALESCE(ends_at, starts_at) > now()`,
      );
      assert.equal(rows[0].n, 0);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});