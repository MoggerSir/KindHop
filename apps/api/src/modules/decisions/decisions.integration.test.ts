import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import '../../shared/env.js';
import { createApp } from '../../app.js';
import { closePool, getPool } from '../../shared/db.js';
import { EARTH_RADIUS_M } from './suggest.js';
import { explainCandidatePlan, loadSuggestions, type ExplainTarget } from './decisions.db.js';
import type { Suggestion } from './suggest.js';

const skipDb = !process.env.DATABASE_URL && 'sin DATABASE_URL';
const metersPerDeg = (2 * Math.PI * EARTH_RADIUS_M) / 360;
// A más de 40 km de los lugares de Cancún: un import OSM no debe colarse en estas reglas.
const ISOLATED = { lat: 22.2, lon: -86.85 };

function north(lat: number, lon: number, meters: number): { lat: number; lon: number } {
  return { lat: lat + meters / metersPerDeg, lon };
}

type PlaceSeed = {
  cityId?: string;
  externalId: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  isFree: boolean | null;
};

async function insertPlace(row: PlaceSeed): Promise<string> {
  const { rows } = await getPool().query<{ id: string }>(
    `INSERT INTO places (city_id, source_id, external_id, name, category, lat, lon, is_free, data_status)
     VALUES ($1, 'kindhop-demo', $2, $3, $4, $5, $6, $7, 'DEMO')
     RETURNING id::text AS id`,
    [row.cityId ?? 'cancun', row.externalId, row.name, row.category, row.lat, row.lon, row.isFree],
  );
  return rows[0].id;
}

async function insertReport(row: {
  lat: number;
  lon: number;
  status: 'UNVERIFIED' | 'CONFIRMED' | 'RESOLVED' | 'REJECTED';
  description: string;
  active: boolean;
}): Promise<void> {
  const window = row.active
    ? { created: "now()", expires: "now() + interval '6 hours'" }
    : { created: "now() - interval '2 hours'", expires: "now() - interval '1 hour'" };
  await getPool().query(
    `INSERT INTO urban_reports (city_id, lat, lon, kind, description, status, data_status, created_at, expires_at)
     VALUES ('cancun', $1, $2, 'PUDDLE', $3, $4, 'DEMO', ${window.created}, ${window.expires})`,
    [row.lat, row.lon, row.description, row.status],
  );
}

async function cleanup(): Promise<void> {
  await getPool().query(`DELETE FROM urban_reports WHERE description LIKE 'test-kh013%'`);
  await getPool().query(`DELETE FROM places WHERE external_id LIKE 'test-kh013-%'`);
}

async function placeByExternalId(externalId: string): Promise<{ id: string; name: string; lat: number; lon: number; category: string }> {
  const { rows } = await getPool().query<{ id: string; name: string; lat: number; lon: number; category: string }>(
    `SELECT id::text AS id, name, lat, lon, category FROM places WHERE source_id = 'kindhop-demo' AND external_id = $1`,
    [externalId],
  );
  assert.ok(rows[0], `falta el lugar DEMO ${externalId}; corre npm run db:seed`);
  return rows[0];
}

function ids(suggestions: Suggestion[]): string[] {
  return suggestions.map((s) => s.placeId);
}

describe('validación de GET /suggestions', () => {
  let server: Server;
  let base: string;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  after(() => server.close());

  it('sin placeId -> 400 VALIDATION', async () => {
    const res = await fetch(`${base}/api/cities/cancun/suggestions`);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'VALIDATION');
  });

  it('placeId no numérico, cero o budget distinto de low -> 400 VALIDATION', async () => {
    for (const query of ['placeId=abc', 'placeId=0', 'placeId=1.5', 'placeId=1&budget=high', 'placeId=01']) {
      const res = await fetch(`${base}/api/cities/cancun/suggestions?${query}`);
      assert.equal(res.status, 400, query);
      assert.equal((await res.json()).error.code, 'VALIDATION');
    }
  });

  it('cityId malformado -> 400 INVALID_CITY_ID y ciudad desconocida -> 404', async () => {
    const bad = await fetch(`${base}/api/cities/${encodeURIComponent('NO')}/suggestions?placeId=1`);
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error.code, 'INVALID_CITY_ID');
    const missing = await fetch(`${base}/api/cities/madrid/suggestions?placeId=1`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'CITY_NOT_FOUND');
  });
});

describe('sugerencias sin PostgreSQL', { skip: process.env.DATABASE_URL ? 'hay DATABASE_URL' : false }, () => {
  let server: Server;
  let base: string;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  after(() => server.close());

  it('placeId válido -> 503 DATABASE_UNAVAILABLE', async () => {
    const res = await fetch(`${base}/api/cities/cancun/suggestions?placeId=1`);
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error.code, 'DATABASE_UNAVAILABLE');
  });
});

describe('reglas del motor con datos DEMO', { skip: skipDb, concurrency: 1 }, () => {
  let server: Server;
  let base: string;

  before(async () => {
    const { rows } = await getPool().query(`SELECT id FROM data_sources WHERE id = 'kindhop-demo'`);
    assert.equal(rows.length, 1, 'faltan los seeds; corre npm run db:seed');
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(cleanup);

  after(async () => {
    await cleanup();
    server?.close();
    await closePool();
  });

  it('una incidencia activa propone el parque limpio y no el que tiene reporte activo', async () => {
    const originId = await insertPlace({
      externalId: 'test-kh013-origin-park', name: 'Parque origen', category: 'parks', ...ISOLATED, isFree: true,
    });
    await insertReport({ ...ISOLATED, status: 'CONFIRMED', description: 'test-kh013 origen', active: true });
    const cleanAt = north(ISOLATED.lat, ISOLATED.lon, 500);
    const blockedAt = north(ISOLATED.lat, ISOLATED.lon, 1200);
    const reportAt = north(blockedAt.lat, blockedAt.lon, 80);
    const cleanId = await insertPlace({
      externalId: 'test-kh013-park-clean', name: 'Parque limpio', category: 'parks', ...cleanAt, isFree: true,
    });
    const blockedId = await insertPlace({
      externalId: 'test-kh013-park-blocked', name: 'Parque con charco', category: 'parks', ...blockedAt, isFree: true,
    });
    await insertReport({ ...reportAt, status: 'CONFIRMED', description: 'test-kh013 charco activo', active: true });
    await insertPlace({
      externalId: 'test-kh013-park-other-cat', name: 'Playa al lado', category: 'beaches', ...cleanAt, isFree: true,
    });

    const suggestions = await loadSuggestions({ cityId: 'cancun', placeId: originId, lowBudget: false, lang: 'es' });
    assert.ok(suggestions);
    assert.deepEqual(ids(suggestions), [cleanId]);
    assert.equal(suggestions.some((s) => s.placeId === blockedId), false);
    assert.equal(suggestions[0].title, 'Parque limpio');
    assert.equal(suggestions[0].source, 'Datos simulados de KindHop');
    assert.equal(suggestions[0].dataStatus, 'DEMO');
    assert.equal(suggestions[0].confidence, 'MEDIUM');
    assert.match(suggestions[0].asOf, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.match(suggestions[0].why, /Parque origen/);
    assert.match(suggestions[0].why, /a 500 m/);

    const http = await fetch(`${base}/api/cities/cancun/suggestions?placeId=${originId}`);
    assert.equal(http.status, 200);
    const body = await http.json();
    assert.equal(body.suggestions[0].placeId, cleanId);
    assert.equal(body.suggestions[0].why, suggestions[0].why);

    const en = await fetch(`${base}/api/cities/cancun/suggestions?placeId=${origin.id}&lang=en`);
    assert.equal(en.status, 200);
    assert.match((await en.json()).suggestions[0].why, /There is an active incident within 300 m/);

    await cleanup();
  });

  it('sin otra alternativa de la categoría responde vacío aunque haya incidencia', async () => {
    const originId = await insertPlace({
      externalId: 'test-kh013-lonely', name: 'Parque solo', category: 'parks', ...ISOLATED, isFree: true,
    });
    await insertReport({ ...ISOLATED, status: 'CONFIRMED', description: 'test-kh013 solo', active: true });
    const suggestions = await loadSuggestions({ cityId: 'cancun', placeId: originId, lowBudget: false, lang: 'es' });
    assert.deepEqual(suggestions, []);
  });

  it('Casa de la Cultura no tiene incidencia a menos de 300 m: sin presupuesto no hay sugerencia', async () => {
    const origin = await placeByExternalId('cun-casa-cultura');
    const suggestions = await loadSuggestions({ cityId: 'cancun', placeId: origin.id, lowBudget: false, lang: 'es' });
    assert.deepEqual(suggestions, []);
  });

  it('presupuesto bajo prioriza is_free true y no asume gratis un NULL más cercano', async () => {
    const originId = await insertPlace({
      externalId: 'test-kh013-museum-origin', name: 'Museo origen', category: 'museums', ...ISOLATED, isFree: false,
    });
    const freeAt = north(ISOLATED.lat, ISOLATED.lon, 2000);
    const unknownAt = north(ISOLATED.lat, ISOLATED.lon, 400);
    const paidAt = north(ISOLATED.lat, ISOLATED.lon, 250);
    const freeId = await insertPlace({
      externalId: 'test-kh013-museum-free', name: 'Museo gratuito', category: 'museums', ...freeAt, isFree: true,
    });
    const unknownId = await insertPlace({
      externalId: 'test-kh013-museum-null', name: 'Museo sin precio', category: 'museums', ...unknownAt, isFree: null,
    });
    const paidId = await insertPlace({
      externalId: 'test-kh013-museum-paid', name: 'Museo de pago', category: 'museums', ...paidAt, isFree: false,
    });

    const plain = await loadSuggestions({ cityId: 'cancun', placeId: originId, lowBudget: false, lang: 'es' });
    assert.deepEqual(plain, []);

    const suggestions = await loadSuggestions({ cityId: 'cancun', placeId: originId, lowBudget: true, lang: 'es' });
    assert.ok(suggestions);
    assert.deepEqual(ids(suggestions), [freeId, paidId, unknownId]);
    assert.equal(suggestions[0].confidence, 'HIGH');
    assert.match(suggestions[0].why, /La fuente indica que es gratis/);
    assert.match(suggestions[1].why, /no es gratis/);
    assert.match(suggestions[2].why, /no se asume que lo sea/);
    assert.equal(suggestions[2].confidence, 'LOW');
    assert.equal(suggestions.every((s) => s.source === 'Datos simulados de KindHop'), true);

    const http = await fetch(`${base}/api/cities/cancun/suggestions?placeId=${originId}&budget=low`);
    assert.equal(http.status, 200);
    assert.deepEqual((await http.json()).suggestions.map((s: Suggestion) => s.placeId), [freeId, paidId, unknownId]);
    await cleanup();
  });

  it('un reporte caducado, resuelto o rechazado no excluye; uno activo a menos de 300 m sí', async () => {
    const originAt = ISOLATED;
    const originId = await insertPlace({
      externalId: 'test-kh013-sports-origin', name: 'Cancha origen', category: 'sports', ...originAt, isFree: true,
    });
    await insertReport({ ...north(originAt.lat, originAt.lon, 50), status: 'UNVERIFIED', description: 'test-kh013 origen', active: true });

    const cases = [
      { externalId: 'test-kh013-sports-expired', name: 'Caducado', meters: 600, status: 'CONFIRMED' as const, active: false, keep: true },
      { externalId: 'test-kh013-sports-resolved', name: 'Resuelto', meters: 900, status: 'RESOLVED' as const, active: true, keep: true },
      { externalId: 'test-kh013-sports-rejected', name: 'Rechazado', meters: 1100, status: 'REJECTED' as const, active: true, keep: true },
      { externalId: 'test-kh013-sports-active', name: 'Activo', meters: 1400, status: 'UNVERIFIED' as const, active: true, keep: false },
    ];
    const kept: string[] = [];
    let dropped = '';
    for (const item of cases) {
      const at = north(originAt.lat, originAt.lon, item.meters);
      const id = await insertPlace({
        externalId: item.externalId, name: item.name, category: 'sports', ...at, isFree: true,
      });
      await insertReport({
        ...north(at.lat, at.lon, 40),
        status: item.status,
        description: `test-kh013 ${item.name}`,
        active: item.active,
      });
      if (item.keep) kept.push(id);
      else dropped = id;
    }

    const suggestions = await loadSuggestions({ cityId: 'cancun', placeId: originId, lowBudget: false, lang: 'es' });
    assert.ok(suggestions);
    assert.deepEqual(ids(suggestions), kept);
    assert.equal(suggestions.some((s) => s.placeId === dropped), false);
    await cleanup();
  });

  it('no cruza de ciudad ni sugiere más allá de 40 km', async () => {
    const originId = await insertPlace({
      externalId: 'test-kh013-city-origin', name: 'Parque frontera', category: 'parks', ...ISOLATED, isFree: true,
    });
    await insertReport({ ...ISOLATED, status: 'UNVERIFIED', description: 'test-kh013 frontera', active: true });
    const near = north(ISOLATED.lat, ISOLATED.lon, 700);
    await insertPlace({
      externalId: 'test-kh013-park-cdmx', cityId: 'cdmx', name: 'Parque en CDMX', category: 'parks', ...near, isFree: true,
    });
    const far = north(ISOLATED.lat, ISOLATED.lon, 50_000);
    await insertPlace({
      externalId: 'test-kh013-park-far', name: 'Parque lejano', category: 'parks', ...far, isFree: true,
    });
    const suggestions = await loadSuggestions({ cityId: 'cancun', placeId: originId, lowBudget: false, lang: 'es' });
    assert.deepEqual(suggestions, []);

    const otherCity = await fetch(`${base}/api/cities/cdmx/suggestions?placeId=${originId}`);
    assert.equal(otherCity.status, 404);
    assert.equal((await otherCity.json()).error.code, 'PLACE_NOT_FOUND');
    const missing = await fetch(`${base}/api/cities/cancun/suggestions?placeId=999999999`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'PLACE_NOT_FOUND');
    await cleanup();
  });

  it('EXPLAIN de la consulta de alternativas usa places_city_coords_idx', { timeout: 60_000 }, async () => {
    const originAt = { lat: 21.16, lon: -86.85 };
    const originId = await insertPlace({
      externalId: 'test-kh013-explain-origin', name: 'Origen explain', category: 'sports', ...originAt, isFree: true,
    });
    await getPool().query(
      `INSERT INTO places (city_id, source_id, external_id, name, category, lat, lon, is_free, data_status)
       SELECT 'cancun', 'kindhop-demo', 'test-kh013-explain-' || g, 'Explain ' || g, 'sports',
              -40 + (g % 800) * 0.1, -130 + ((g / 800) % 125) * 0.8, true, 'DEMO'
       FROM generate_series(1, 100000) AS g`,
    );
    await getPool().query('ANALYZE places');
    const target: ExplainTarget = {
      cityId: 'cancun', placeId: originId, category: 'sports', ...originAt, lowBudget: false,
    };
    const plan = await explainCandidatePlan(target);
    const lowBudgetPlan = await explainCandidatePlan({ ...target, lowBudget: true });
    console.log(`EXPLAIN alternativas:\n${plan}\n\nEXPLAIN con presupuesto bajo:\n${lowBudgetPlan}`);
    assert.match(plan, /places_city_coords_idx/);
    assert.match(lowBudgetPlan, /places_city_coords_idx/);
    await cleanup();
  });
});
