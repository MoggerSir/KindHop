import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import express from 'express';
import { createApp } from '../../app.js';
import { errorHandler } from '../../shared/errors.js';
import { fetchCancunRoutes, type TransitPayload } from './cancun.adapter.js';
import { createTransitRouter } from './routes.js';

async function listen(app: express.Express): Promise<{ base: string; close: () => Promise<void> }> {
  const server: Server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return {
    base,
    close: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

describe('rutas simuladas DEMO de Cancún (GeoJSON local, sin API externa)', () => {
  it('devuelve rutas simuladas válidas marcadas como DEMO con paradas y geometría en Cancún', async () => {
    const { routes, source } = await fetchCancunRoutes();
    assert.ok(routes.length >= 3);
    assert.equal(source.dataStatus, 'DEMO');
    assert.equal(source.url, '');
    for (const route of routes) {
      assert.equal(route.mode, 'bus');
      assert.equal(route.geometry.type, 'LineString');
      assert.ok(route.geometry.coordinates.length >= 2);
      assert.ok(route.stops.length >= 2);
      for (const [lon, lat] of route.geometry.coordinates) {
        assert.ok(lat > 20.5 && lat < 21.8 && lon > -87.5 && lon < -86.4);
      }
    }
  });
});

describe('GET /api/cities/:cityId/transit', () => {
  let server: { base: string; close: () => Promise<void> };

  before(async () => {
    server = await listen(createApp());
  });
  after(() => server.close());

  it('CDMX usa su snapshot (KH-007) y nunca consulta el adaptador de Cancún', async () => {
    let cancunCalls = 0;
    const cancun = async (): Promise<TransitPayload> => {
      cancunCalls += 1;
      throw new Error('no debería llamarse');
    };
    const cdmx = async () => ({ routes: [], source: { name: 'stub CDMX', dataStatus: 'REAL' } });
    const app = express();
    app.use('/api/cities/:cityId/transit', createTransitRouter(cancun, cdmx));
    app.use(errorHandler);
    const local = await listen(app);
    try {
      const res = await fetch(`${local.base}/api/cities/cdmx/transit`);
      if (process.env.DATABASE_URL) {
        assert.equal(res.status, 200);
        assert.equal((await res.json()).source.name, 'stub CDMX');
      } else {
        assert.equal(res.status, 503);
        assert.equal((await res.json()).error.code, 'DATABASE_UNAVAILABLE');
      }
      assert.equal(cancunCalls, 0);
    } finally {
      await local.close();
    }
  });

  it('ciudad desconocida y cityId malformado no dependen de la fuente ni de la base', async () => {
    const missing = await fetch(`${server.base}/api/cities/madrid/transit`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'CITY_NOT_FOUND');
    const bad = await fetch(`${server.base}/api/cities/${encodeURIComponent('!')}/transit`);
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error.code, 'INVALID_CITY_ID');
  });

  it('Cancún responde 200 con rutas simuladas DEMO sin red externa', async () => {
    const res = await fetch(`${server.base}/api/cities/cancun/transit`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as TransitPayload;
    assert.ok(body.routes.length >= 3);
    assert.equal(body.source.dataStatus, 'DEMO');
  });
});
