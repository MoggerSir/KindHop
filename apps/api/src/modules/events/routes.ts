import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import { requireCity } from '../cities/index.js';
import { listUpcomingEvents } from './events.db.js';

const langSchema = z.enum(['es', 'en']).catch('es');

function assertDatabaseConfigured(): void {
  if (!process.env.DATABASE_URL) {
    throw new AppError(503, 'DATABASE_UNAVAILABLE', 'La base de datos no está configurada');
  }
}

export const eventsRouter = Router({ mergeParams: true });

eventsRouter.get('/', async (req, res) => {
  const city = requireCity((req.params as { cityId: string }).cityId);
  assertDatabaseConfigured();
  const lang = langSchema.parse(typeof req.query.lang === 'string' ? req.query.lang : undefined);
  const events = await listUpcomingEvents(city.id, lang);
  res.json({ events });
});