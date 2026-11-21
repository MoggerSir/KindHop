// Tests del adaptador en vivo de Rutas Cancún, DESACTIVADO en la demo (ADR-0008); se mantienen para poder reactivarlo.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import express from 'express';
import { createApp } from '../../app.js';
import { errorHandler } from '../../shared/errors.js';
import {
  createCancunRoutesFetcher,
  normalizeCancunCatalog,
  RUTAS_CANCUN_CATALOG_URL,
  type TransitPayload,
  type TransitRoute,
} from './adapters/cancun-live.js';
import { createTransitRouter } from './routes.js';

const fixtureText = readFileSync(new URL('./fixtures/rutas-cancun-catalogo.recorte.json', import.meta.url), 'utf8');
const fixture: { generado: string; rutas: { codigo: string; polilinea: string }[] } = JSON.parse(fixtureText);

function jsonResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: { 'content-type': 'application/json' } });
}

async function listen(app: express.Express): Promise<{ base: string; close: () => Promise<void> }> {
  const server: Server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return {
    base,
    close: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

describe('normalización del catálogo Rutas Cancún', () => {
  const fetchedAt = new Date('2026-11-21T02:43:57.000Z');

  it('convierte el fixture ficticio de test en una ruta, sin paradas inventadas', () => {
    const { routes, source } = normalizeCancunCatalog(fixture, fetchedAt);
    assert.equal(routes.length, 1);
    const route = routes[0] as TransitRoute;
    assert.equal(route.id, 'KH-TEST-FICTION');
    assert.match(route.name, /ficticia de prueba/);
    assert.equal(route.mode, 'bus');
    assert.equal(route.fareCents, 750);
    assert.deepEqual(route.stops, []);
    assert.equal(route.geometry.type, 'LineString');
    assert.equal(route.geometry.coordinates.length, 3);
    const [lon, lat] = route.geometry.coordinates[0] as [number, number];
    assert.ok(Math.abs(lon - -45.6789) < 1e-6);
    assert.ok(Math.abs(lat - 12.34567) < 1e-6);
    assert.equal(source.dataStatus, 'REAL');
    assert.equal(source.url, RUTAS_CANCUN_CATALOG_URL);
    assert.equal(source.retrievedAt, '2099-01-01T00:00:00.000Z');
    assert.match(source.license, /no se guarda copia/);
    assert.deepEqual(Object.keys(route).sort(), ['fareCents', 'geometry', 'id', 'mode', 'name', 'stops']);
  });

  it('omite la tarifa si la fuente no la trae y descarta una polilínea rota', () => {
    const [good] = fixture.rutas;
    const body = {
      generado: fixture.generado,
      rutas: [{ ...good, tarifaMxn: undefined }, { codigo: 'ROTA', nombre: 'Rota', polilinea: '@@@' }],
    };
    const { routes } = normalizeCancunCatalog(body, fetchedAt);
    assert.equal(routes.length, 1);
    assert.equal(routes[0]?.id, 'KH-TEST-FICTION');
    assert.equal(routes[0]?.fareCents, undefined);
    assert.equal('fareCents' in (routes[0] as TransitRoute), false);
  });

  it('un catálogo vacío es una respuesta válida; uno ilegible es 502', () => {
    const empty = normalizeCancunCatalog({ generado: fixture.generado, rutas: [] }, fetchedAt);
    assert.deepEqual(empty.routes, []);
    assert.throws(
      () => normalizeCancunCatalog({ rutas: [{ codigo: 'X', nombre: 'X', polilinea: 'no' }] }, fetchedAt),
      (err: unknown) => err instanceof Error && 'code' in err && err.code === 'TRANSIT_UNAVAILABLE',
    );
    assert.throws(
      () => normalizeCancunCatalog({ nope: true }, fetchedAt),
      (err: unknown) => err instanceof Error && 'code' in err && err.code === 'TRANSIT_UNAVAILABLE',
    );
  });
});

describe('lectura en vivo con caché', () => {
  it('reutiliza la respuesta dentro del TTL y no guarda un fallo', async () => {
    let now = 1_000;
    let calls = 0;
    const fetchImpl: typeof fetch = async (input, init) => {
      calls += 1;
      assert.match(String(input), /catalogo\.json$/);
      assert.equal(new Headers(init?.headers).get('user-agent'), 'KindHop/0.1 (transit adapter; declared external read)');
      if (calls === 1) return jsonResponse('no', 503);
      return jsonResponse(fixtureText);
    };
    const fetchRoutes = createCancunRoutesFetcher({
      fetchImpl,
      now: () => now,
      ttlMs: 60_000,
      catalogUrl: 'https://rutascancun.com/datos/catalogo.json',
    });

    await assert.rejects(fetchRoutes, (err: unknown) => err instanceof Error && 'code' in err && err.code === 'TRANSIT_UNAVAILABLE');
    const first = await fetchRoutes();
    const second = await fetchRoutes();
    assert.equal(first, second);
    assert.equal(calls, 2);

    now += 60_001;
    await fetchRoutes();
    assert.equal(calls, 3);
  });

  it('deduplica peticiones en vuelo cuando la caché venció', async () => {
    let now = 1_000_000;
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      await new Promise((resolve) => {
        setTimeout(resolve, 40);
      });
      return jsonResponse(fixtureText);
    };
    const fetchRoutes = createCancunRoutesFetcher({
      fetchImpl,
      now: () => now,
      ttlMs: 0,
      catalogUrl: 'https://rutascancun.com/datos/catalogo.json',
    });
    const [a, b, c] = await Promise.all([fetchRoutes(), fetchRoutes(), fetchRoutes()]);
    assert.equal(a, b);
    assert.equal(b, c);
    assert.equal(calls, 1);
  });

  it('si la fuente no contesta a tiempo, responde TRANSIT_UNAVAILABLE', async () => {
    const fetchImpl: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        const signal = init?.signal;
        // El temporizador de AbortSignal.timeout no mantiene vivo el proceso; este sí,
        // para que el aborto de 30 ms llegue a dispararse.
        const timer = setTimeout(() => reject(new Error('el timeout no abortó')), 200);
        if (!signal) {
          clearTimeout(timer);
          reject(new Error('sin señal'));
          return;
        }
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(signal.reason ?? new Error('abort'));
        });
      });
    const fetchRoutes = createCancunRoutesFetcher({ fetchImpl, timeoutMs: 30, catalogUrl: 'https://rutascancun.com/datos/catalogo.json' });
    await assert.rejects(fetchRoutes, (err: unknown) => err instanceof Error && 'status' in err && err.status === 502 && 'code' in err && err.code === 'TRANSIT_UNAVAILABLE');
  });
});

describe('GET /api/cities/:cityId/transit', () => {
  let server: { base: string; close: () => Promise<void> };

  before(async () => {
    server = await listen(createApp({ requireAuth: false }));
  });
  after(() => server.close());

  it('CDMX usa su snapshot (KH-007) y nunca consulta la fuente de Cancún', async () => {
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

  it('Cancún devuelve la ruta grabada y, si la fuente falla, 502 TRANSIT_UNAVAILABLE', async () => {
    const ok = createCancunRoutesFetcher({
      catalogUrl: 'https://rutascancun.com/datos/catalogo.json',
      fetchImpl: async () => jsonResponse(fixtureText),
    });
    const down = createCancunRoutesFetcher({
      catalogUrl: 'https://rutascancun.com/datos/catalogo.json',
      fetchImpl: async () => jsonResponse('caido', 503),
    });

    const app = express();
    app.use('/ok/:cityId/transit', createTransitRouter(ok));
    app.use('/down/:cityId/transit', createTransitRouter(down));
    app.use(errorHandler);
    const local = await listen(app);
    try {
      const res = await fetch(`${local.base}/ok/cancun/transit`);
      assert.equal(res.status, 200);
      const body = (await res.json()) as TransitPayload;
      assert.equal(body.routes.length, 1);
      assert.equal(body.routes[0]?.id, 'KH-TEST-FICTION');
      assert.equal(body.routes[0]?.geometry.type, 'LineString');
      assert.equal(body.source.dataStatus, 'REAL');
      assert.equal(body.source.retrievedAt, fixture.generado);

      const failed = await fetch(`${local.base}/down/cancun/transit`);
      assert.equal(failed.status, 502);
      assert.equal((await failed.json()).error.code, 'TRANSIT_UNAVAILABLE');
    } finally {
      await local.close();
    }
  });
});

describe('catálogo real de Rutas Cancún', { skip: process.env.RUTAS_CANCUN_LIVE !== '1' && 'sin RUTAS_CANCUN_LIVE' }, () => {
  it('la URL pública devuelve al menos una ruta con geometría en Cancún', async () => {
    const fetchRoutes = createCancunRoutesFetcher({ catalogUrl: RUTAS_CANCUN_CATALOG_URL, ttlMs: 0 });
    const { routes, source } = await fetchRoutes();
    assert.ok(routes.length >= 1);
    assert.equal(source.dataStatus, 'REAL');
    assert.equal(source.url, RUTAS_CANCUN_CATALOG_URL);
    assert.ok(Number.isFinite(Date.parse(source.retrievedAt)));
    for (const route of routes) {
      assert.equal(route.mode, 'bus');
      assert.deepEqual(route.stops, []);
      assert.equal(route.geometry.type, 'LineString');
      assert.ok(route.geometry.coordinates.length >= 2);
      if (route.fareCents !== undefined) assert.equal(route.fareCents % 100, 0);
      for (const [lon, lat] of route.geometry.coordinates) {
        assert.ok(lat > 20.5 && lat < 21.8 && lon > -87.5 && lon < -86.4);
      }
    }
  });
});
