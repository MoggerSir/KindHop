import express from 'express';
import cors from 'cors';
import type { Store } from 'express-session';
import { authAttemptLimiter, createAuthRouter, readAuthConfig, requireSession, sessionMiddleware } from './modules/auth/index.js';
import { citiesRouter } from './modules/cities/index.js';
import { eventsRouter } from './modules/events/index.js';
import { reportsRouter } from './modules/reports/index.js';
import { suggestionsRouter } from './modules/decisions/index.js';
import { districtsRouter, poisRouter } from './modules/discovery/index.js';
import { transitRouter } from './modules/transit/index.js';
import { couponsRouter } from './modules/coupons/index.js';
import { errorHandler, notFound } from './shared/errors.js';
import { getDatabaseHealth } from './shared/db.js';
import { readTrustProxySetting } from './shared/trust-proxy.js';
import { requireSameOrigin, securityHeaders } from './shared/security.js';

type AppOptions = {
  // true (por defecto, y siempre en server.ts): toda /api exige sesión firmada. false SOLO lo usan los tests de cada
  // módulo, que prueban su lógica sin login; no hay variable de entorno ni petición que lo desactive.
  requireAuth?: boolean;
  sessionStore?: Store; // tests: almacén en memoria; producción: PostgreSQL (user_sessions)
};

// Montaje de rutas. Cada módulo nuevo: un router en modules/<dominio>/routes.ts y una línea aquí.
export function createApp({ requireAuth = true, sessionStore }: AppOptions = {}) {
  const auth = readAuthConfig();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', readTrustProxySetting());
  app.use(securityHeaders);
  app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '200kb' }));

  app.get('/health', async (_req, res) => {
    res.json({ status: 'ok', service: 'kindhop-api', database: await getDatabaseHealth() });
  });
  if (requireAuth) {
    // Sesión (express-session, una vez) → control de origen en escrituras → login → todo lo demás exige sesión.
    app.use('/api/auth', authAttemptLimiter());
    app.use('/api', sessionMiddleware(auth, sessionStore));
    app.use('/api', requireSameOrigin([auth.publicUrl, process.env.WEB_ORIGIN ?? auth.publicUrl]));
    app.use('/api/auth', createAuthRouter(auth));
    app.use('/api', requireSession);
  }
  app.use('/api/cities', citiesRouter);
  app.use('/api/cities/:cityId/events', eventsRouter);
  app.use('/api/cities/:cityId/reports', reportsRouter);
  app.use('/api/cities/:cityId/suggestions', suggestionsRouter);
  app.use('/api/cities/:cityId/coupons', couponsRouter);
  app.use('/api/cities/:cityId/districts', districtsRouter);
  app.use('/api/cities/:cityId/pois', poisRouter);
  app.use('/api/cities/:cityId/transit', transitRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}