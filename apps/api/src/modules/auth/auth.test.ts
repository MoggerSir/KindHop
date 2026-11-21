import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import session from 'express-session';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import '../../shared/env.js';
import { createApp } from '../../app.js';
import { closePool } from '../../shared/db.js';
import { verifyGoogleIdToken } from './google.js';

const ORIGIN = 'http://localhost:5173';
const skipDb = !process.env.DATABASE_URL && 'sin DATABASE_URL';

async function listen(env: Record<string, string | undefined>) {
  const saved = { ...process.env };
  Object.assign(process.env, { WEB_ORIGIN: ORIGIN, PUBLIC_URL: ORIGIN, ...env });
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k];
  const server = createApp({ sessionStore: new session.MemoryStore() }).listen(0);
  process.env = saved;
  await new Promise((resolve) => server.once('listening', resolve));
  return { server, base: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
}
const SECRET = 'x'.repeat(48);
const cookieOf = (res: Response) => res.headers.get('set-cookie')?.split(';')[0] ?? '';

describe('verifyGoogleIdToken', () => {
  let jwks: ReturnType<typeof createLocalJWKSet>;
  let privateKey: CryptoKey;
  before(async () => {
    const pair = await generateKeyPair('RS256');
    privateKey = pair.privateKey;
    jwks = createLocalJWKSet({ keys: [{ ...(await exportJWK(pair.publicKey)), kid: 'k1', alg: 'RS256' }] });
  });
  const token = (claims: Record<string, unknown>, aud = 'client-1') =>
    new SignJWT({ email: 'ana@example.com', email_verified: true, name: 'Ana', nonce: 'n1', ...claims })
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' }).setIssuer('https://accounts.google.com').setAudience(aud)
      .setSubject('google-123').setIssuedAt().setExpirationTime('5m').sign(privateKey);

  it('acepta un id_token válido y devuelve el perfil', async () => {
    const p = await verifyGoogleIdToken(await token({}), { clientId: 'client-1', nonce: 'n1', jwks });
    assert.deepEqual(p, { sub: 'google-123', email: 'ana@example.com', name: 'Ana', picture: null });
  });
  it('rechaza otra audiencia, otro nonce y email sin verificar', async () => {
    await assert.rejects(verifyGoogleIdToken(await token({}, 'otro-cliente'), { clientId: 'client-1', nonce: 'n1', jwks }));
    await assert.rejects(verifyGoogleIdToken(await token({ nonce: 'otro' }), { clientId: 'client-1', nonce: 'n1', jwks }));
    await assert.rejects(verifyGoogleIdToken(await token({ email_verified: false }), { clientId: 'client-1', nonce: 'n1', jwks }));
  });
});

describe('API protegida por sesión', () => {
  let server: Server;
  let base: string;
  before(async () => ({ server, base } = await listen({ SESSION_SECRET: SECRET, GOOGLE_CLIENT_ID: 'client-1', GOOGLE_CLIENT_SECRET: 'secreto-servidor', AUTH_DEV_LOGIN: undefined })));
  after(() => server.close());

  it('toda ruta de datos responde 401 sin sesión', async () => {
    for (const path of ['/api/cities', '/api/cities/cancun', '/api/cities/cancun/events', '/api/cities/cancun/pois', '/api/cities/cancun/reports', '/api/cities/cancun/transit', '/api/auth/me']) {
      const res = await fetch(base + path);
      assert.equal(res.status, 401, path);
      assert.equal((await res.json()).error.code, 'UNAUTHENTICATED', path);
    }
  });

  it('una cookie de sesión falsificada no sirve', async () => {
    const res = await fetch(`${base}/api/cities`, { headers: { cookie: 'kh.sid=s%3Ainventado.firmafalsa' } });
    assert.equal(res.status, 401);
  });

  it('las escrituras desde otro origen se rechazan (CSRF)', async () => {
    assert.equal((await fetch(`${base}/api/auth/logout`, { method: 'POST' })).status, 403);
    assert.equal((await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { origin: 'https://malo.example' } })).status, 403);
    assert.equal((await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { origin: ORIGIN } })).status, 204);
  });

  it('la configuración pública no expone secretos y la entrada demo está apagada', async () => {
    const res = await fetch(`${base}/api/auth/config`);
    const body = await res.text();
    assert.deepEqual(JSON.parse(body), { google: true, devLogin: false });
    assert.ok(!body.includes('secreto-servidor'));
    assert.equal((await fetch(`${base}/api/auth/dev-login`, { method: 'POST', headers: { origin: ORIGIN } })).status, 404);
  });

  it('el inicio con Google redirige con PKCE y deja una cookie HttpOnly SameSite=Lax', async () => {
    const res = await fetch(`${base}/api/auth/google`, { redirect: 'manual' });
    assert.equal(res.status, 303);
    const location = new URL(res.headers.get('location')!);
    assert.equal(location.origin, 'https://accounts.google.com');
    assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
    assert.ok(location.searchParams.get('state') && location.searchParams.get('nonce') && location.searchParams.get('code_challenge'));
    assert.ok(!location.search.includes('secreto-servidor'), 'el client secret nunca sale del servidor');
    const setCookie = res.headers.get('set-cookie') ?? '';
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Lax/);

    // Vuelta con un state distinto: no abre sesión.
    const back = await fetch(`${base}/api/auth/google/callback?code=abc&state=otro`, { redirect: 'manual', headers: { cookie: cookieOf(res) } });
    assert.equal(back.status, 303);
    assert.equal(back.headers.get('location'), `${ORIGIN}/?auth_error=failed`);
  });
});

describe('sin SESSION_SECRET la API falla cerrada', () => {
  it('responde 503 AUTH_NOT_CONFIGURED', async () => {
    const { server, base } = await listen({ SESSION_SECRET: 'corto' });
    const res = await fetch(`${base}/api/cities`);
    server.close();
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error.code, 'AUTH_NOT_CONFIGURED');
  });
});

describe('ciclo de sesión con base de datos', { skip: skipDb }, () => {
  let server: Server;
  let base: string;
  before(async () => ({ server, base } = await listen({ SESSION_SECRET: SECRET, AUTH_DEV_LOGIN: 'true', NODE_ENV: 'test' })));
  after(async () => {
    server.close();
    await closePool();
  });

  it('entrar, usar la API, cerrar sesión', async () => {
    const login = await fetch(`${base}/api/auth/dev-login`, { method: 'POST', headers: { origin: ORIGIN } });
    assert.equal(login.status, 204);
    const cookie = cookieOf(login);
    assert.match(cookie, /^kh\.sid=s%3A/);

    const me = await fetch(`${base}/api/auth/me`, { headers: { cookie } });
    assert.equal((await me.json()).user.email, 'demo@kindhop.local');
    assert.equal((await fetch(`${base}/api/cities`, { headers: { cookie } })).status, 200);

    assert.equal((await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { cookie, origin: ORIGIN } })).status, 204);
    assert.equal((await fetch(`${base}/api/auth/me`, { headers: { cookie } })).status, 401, 'la sesión cerrada ya no vale');
  });
});

it('cerrar sesión no confirma éxito si falla revocarla en el almacén', async () => {
  const { destroySession } = await import('./session.js');
  const request = { session: { destroy: (callback: (error?: Error) => void) => callback(new Error('almacén no disponible')) } };
  await assert.rejects(destroySession(request as unknown as import('express').Request), /almacén no disponible/);
});
