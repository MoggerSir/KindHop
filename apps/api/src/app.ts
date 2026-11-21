import express from 'express';
import cors from 'cors';
import { citiesRouter } from './modules/cities/index.js';
import { reportsRouter } from './modules/reports/index.js';
import { suggestionsRouter } from './modules/decisions/index.js';
import { errorHandler, notFound } from './shared/errors.js';

// Montaje de rutas. Cada módulo nuevo: un router en modules/<dominio>/routes.ts y una línea aquí.
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json({ limit: '200kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'kindhop-api' });
  });
  app.use('/api/cities', citiesRouter);
  app.use('/api/cities/:cityId/reports', reportsRouter);
  app.use('/api/cities/:cityId/suggestions', suggestionsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
