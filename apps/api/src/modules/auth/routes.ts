import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import { googleEnabled, type AuthConfig } from './config.js';
import { exchangeCodeForIdToken, googleAuthUrl, pkceChallenge, randomToken, safeEqual, verifyGoogleIdToken } from './google.js';
import { SESSION_COOKIE, destroySession, regenerateSession, requireSession, saveSession, sessionCookieOptions } from './session.js';
import { upsertGoogleUser, grantSimulatedPro } from './users.db.js';

const OAUTH_TTL_MS = 10 * 60 * 1000;
const callbackQuery = z.object({ code: z.string().min(1).max(2048), state: z.string().min(1).max(256) });

// /api/auth. Lectura: GET. Todo lo que cambia estado y lo inicia la web (cerrar sesión, demo) va por POST,
// con control de origen (shared/security.ts). La vuelta de Google es GET por imposición de OAuth: trae un código de
// un solo uso que se canjea aquí y la respuesta redirige a una URL limpia.
export function createAuthRouter(config: AuthConfig) {
  const router = Router();
  const redirectUri = `${config.publicUrl}/api/auth/google/callback`;

  router.get('/config', (_req, res) => {
    res.json({ google: googleEnabled(config), devLogin: config.devLogin, publicUrl: config.publicUrl });
  });

  router.get('/me', requireSession, (_req, res) => {
    res.json({ user: res.locals.user });
  });

  // Inicio: guarda state, verificador PKCE y nonce en la sesión del servidor y redirige a Google.
  router.get('/google', async (req, res) => {
    if (!googleEnabled(config)) throw new AppError(503, 'AUTH_PROVIDER_UNAVAILABLE', 'El inicio de sesión con Google no está configurado');
    const oauth = { state: randomToken(), verifier: randomToken(), nonce: randomToken(), createdAt: Date.now() };
    req.session.oauth = oauth;
    await saveSession(req);
    res.redirect(303, googleAuthUrl({ clientId: config.googleClientId!, redirectUri, state: oauth.state, nonce: oauth.nonce, codeChallenge: pkceChallenge(oauth.verifier) }));
  });

  // Vuelta de Google: valida state, canjea el código, verifica el id_token, crea/actualiza el usuario y abre sesión.
  router.get('/google/callback', async (req, res) => {
    const fail = (reason: 'cancelled' | 'failed', detail?: string) => {
      if (detail) console.warn(`[auth] inicio de sesión fallido: ${detail}`);
      res.redirect(303, `${config.publicUrl}/?auth_error=${reason}`);
    };
    const oauth = req.session.oauth;
    delete req.session.oauth; // un solo uso
    if (req.query.error) return fail('cancelled');
    const parsed = callbackQuery.safeParse(req.query);
    if (!googleEnabled(config) || !parsed.success || !oauth) return fail('failed', 'petición sin estado válido');
    if (Date.now() - oauth.createdAt > OAUTH_TTL_MS || !safeEqual(parsed.data.state, oauth.state)) return fail('failed', 'state caducado o distinto');
    try {
      const idToken = await exchangeCodeForIdToken({ code: parsed.data.code, codeVerifier: oauth.verifier, clientId: config.googleClientId!, clientSecret: config.googleClientSecret!, redirectUri });
      const profile = await verifyGoogleIdToken(idToken, { clientId: config.googleClientId!, nonce: oauth.nonce });
      const user = await upsertGoogleUser(profile);
      await regenerateSession(req); // id de sesión nuevo al iniciar sesión (contra fijación)
      req.session.userId = user.id;
      await saveSession(req);
    } catch (err) {
      return fail('failed', err instanceof Error ? err.message : 'error desconocido');
    }
    res.redirect(303, `${config.publicUrl}/`);
  });

  router.post('/logout', async (req, res) => {
    await destroySession(req);
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions(config));
    res.status(204).end();
  });

  // Entrada de demo para el hackatón y desarrollo (AUTH_DEV_LOGIN=true, nunca en producción): un usuario fijo, mismo
  // flujo de sesión que Google. Si está apagada, la ruta no existe.
  router.post('/dev-login', async (req, res) => {
    if (!config.devLogin) throw new AppError(404, 'NOT_FOUND', 'Ruta no encontrada');
    const created = await upsertGoogleUser({ sub: 'dev:demo', email: 'demo@kindhop.local', name: 'Demo KindHop', picture: null });
    // La cuenta demo es una cuenta Pro simulada (KH-021): enseña cupones y la app sin anuncios.
    const user = await grantSimulatedPro(created.id);
    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);
    res.status(204).end();
  });

  return router;
}
