import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { couponsFor } from './catalog.js';
import { couponsRouter } from './routes.js';
import { errorHandler } from '../../shared/errors.js';
import { planOf } from '../auth/users.db.js';

function appAs(plan: ReturnType<typeof planOf> | null) {
  const app = express();
  app.use((_req, res, next) => {
    if (plan) res.locals.user = { id: '1', email: 'a@b.c', name: null, pictureUrl: null, plan };
    next();
  });
  app.use('/api/cities/:cityId/coupons', couponsRouter);
  app.use(errorHandler);
  return app;
}

async function get(plan: ReturnType<typeof planOf> | null, path: string) {
  const server = appAs(plan).listen(0);
  await once(server, 'listening');
  try {
    const res = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}${path}`);
    return { status: res.status, body: await res.json() };
  } finally {
    server.close();
  }
}

const PRO = { tier: 'PRO' as const, until: null, simulated: true };
const FREE = { tier: 'FREE' as const, until: null, simulated: false };

describe('cupones (KH-021)', () => {
  it('todos son DEMO, con QR (código) y al menos un local', () => {
    for (const city of ['cancun', 'cdmx']) {
      const list = couponsFor(city, 'es');
      assert.ok(list.length > 0);
      for (const c of list) {
        assert.equal(c.dataStatus, 'DEMO');
        assert.match(c.code, /^KH-[A-Z0-9]+$/);
        assert.ok(c.locations.length > 0);
      }
    }
  });

  it('textos en inglés', () => {
    assert.match(couponsFor('cancun', 'en')[0].discount, /off/);
  });

  it('usuario Pro recibe los cupones de su ciudad', async () => {
    const res = await get(PRO, '/api/cities/cancun/coupons?lang=es');
    assert.equal(res.status, 200);
    assert.equal(res.body.coupons.length, couponsFor('cancun', 'es').length);
  });

  it('usuario gratis recibe 403 PLAN_REQUIRED', async () => {
    const res = await get(FREE, '/api/cities/cancun/coupons');
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'PLAN_REQUIRED');
  });

  it('ciudad desconocida → 404', async () => {
    const res = await get(PRO, '/api/cities/atlantis/coupons');
    assert.equal(res.status, 404);
  });

  it('planOf: Pro caducado vuelve a gratis', () => {
    const past = new Date(Date.now() - 1000);
    assert.equal(planOf({ plan: 'PRO', plan_until: past, plan_simulated: true }).tier, 'FREE');
    assert.equal(planOf({ plan: 'PRO', plan_until: null, plan_simulated: false }).tier, 'PRO');
  });
});
