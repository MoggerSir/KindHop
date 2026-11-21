import { Router } from 'express';
import { z } from 'zod';
import { requireDatabase } from '../../shared/db.js';
import { requireCity } from '../cities/index.js';
import { listUpcomingEvents } from './events.db.js';

const langSchema = z.enum(['es', 'en']).catch('es');

export const eventsRouter = Router({ mergeParams: true });

eventsRouter.get('/', async (req, res) => {
  const city = requireCity((req.params as { cityId: string }).cityId);
  requireDatabase();
  const lang = langSchema.parse(typeof req.query.lang === 'string' ? req.query.lang : undefined);
  const events = await listUpcomingEvents(city.id, lang);
  res.json({ events });
});
