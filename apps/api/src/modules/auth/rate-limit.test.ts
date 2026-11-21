import { it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import express from 'express';
import session from 'express-session';
import { createApp } from '../../app.js';
import { errorHandler } from '../../shared/errors.js';
import { AUTH_ATTEMPT_LIMIT, AUTH_ATTEMPT_WINDOW_MS, authAttemptLimiter } from './rate-limit.js';

it('auth: limita antes de crear sesiones, comparte las rutas y no bloquea logout/me/config', async () => {
  const saved = { ...process.env };
  Object.assign(process.env, { SESSION_SECRET: 's'.repeat(48), PUBLIC_URL: 'http://localhost:5173', WEB_ORIGIN: 'http://localhost:5173', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret', AUTH_DEV_LOGIN: 'false', TRUST_PROXY: 'false' });
  const store = new session.MemoryStore();
  let sessionsCreated = 0;
  const originalSet = store.set.bind(store);
  store.set = (id, data, callback) => { sessionsCreated++; originalSet(id, data, callback); };
  const app = createApp({ sessionStore: store });
  process.env = saved;
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    for (let i = 0; i < AUTH_ATTEMPT_LIMIT; i++) {
      const path = i % 2 ? '/google/callback' : '/GOOGLE/';
      const res = await fetch(`${base}/api/auth${path}`, { redirect: 'manual', headers: { 'x-forwarded-for': `203.0.113.${i + 1}` } });
      assert.equal(res.status, 303);
    }
    const createdBeforeBlock = sessionsCreated;
    const blocked = await fetch(`${base}/api/auth/google`, { redirect: 'manual' });
    assert.equal(blocked.status, 429);
    assert.equal((await blocked.json()).error.code, 'RATE_LIMITED');
    assert.ok(Number(blocked.headers.get('retry-after')) > 0);
    assert.equal(blocked.headers.get('set-cookie'), null);
    assert.equal(sessionsCreated, createdBeforeBlock, 'rechaza antes de asignar una sesión');
    assert.equal((await fetch(`${base}/api/auth/dev-login`, { method: 'POST', headers: { origin: 'http://localhost:5173' } })).status, 429);
    assert.equal((await fetch(`${base}/api/auth/config`)).status, 200);
    assert.equal((await fetch(`${base}/api/auth/me`)).status, 401);
    assert.equal((await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { origin: 'http://localhost:5173' } })).status, 204);
  } finally {
    server.close();
    store.clear();
  }
});

it('auth: IP independientes, cupo acotado sin expulsar bloqueados y recuperación al vencer la ventana', async () => {
  let time = 1_000;
  const app = express();
  app.set('trust proxy', 'loopback'); // fixture: un proxy de pruebas que proporciona la IP del cliente
  app.use('/api/auth', authAttemptLimiter({ now: () => time, maxIps: 2 }));
  app.get('/api/auth/google', (_req, res) => res.sendStatus(204));
  app.use(errorHandler);
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const attempt = (ip: string) => fetch(`${base}/api/auth/google`, { headers: { 'x-forwarded-for': ip } });
  try {
    for (let i = 0; i < AUTH_ATTEMPT_LIMIT; i++) assert.equal((await attempt('203.0.113.1')).status, 204);
    assert.equal((await attempt('203.0.113.1')).status, 429);
    assert.equal((await attempt('203.0.113.2')).status, 204);
    const full = await attempt('203.0.113.3');
    assert.equal(full.status, 429);
    assert.equal(Number(full.headers.get('retry-after')), AUTH_ATTEMPT_WINDOW_MS / 1000);
    assert.equal((await attempt('203.0.113.1')).status, 429, 'una IP nueva no expulsa el contador bloqueado');
    time += AUTH_ATTEMPT_WINDOW_MS;
    assert.equal((await attempt('203.0.113.3')).status, 204);
    assert.equal((await attempt('203.0.113.1')).status, 204);
  } finally {
    server.close();
  }
});
