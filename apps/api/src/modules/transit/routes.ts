import { Router } from 'express';
import { requireCity } from '../cities/index.js';
import { pickAdapter, type CityAdapters } from '../../shared/city-adapters.js';
import { requireDatabase } from '../../shared/db.js';
import { fetchCdmxRoutes } from './adapters/cdmx.js';

const adapters: CityAdapters<typeof fetchCdmxRoutes> = { cdmx: fetchCdmxRoutes };

export const transitRouter = Router({ mergeParams: true });

transitRouter.get('/', async (req, res) => {
  const city = requireCity((req.params as { cityId?: string }).cityId);
  // pickAdapter antes de la base: Cancún sigue en 404 aunque no haya DATABASE_URL.
  const fetchRoutes = pickAdapter(adapters, city.id, 'Transporte');
  requireDatabase();
  res.json(await fetchRoutes());
});
