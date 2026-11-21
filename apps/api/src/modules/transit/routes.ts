import { Router } from 'express';
import { pickAdapter } from '../../shared/city-adapters.js';
import { requireCity } from '../cities/index.js';
import { fetchCancunRoutes, type TransitPayload } from './cancun.adapter.js';

type FetchRoutes = () => Promise<TransitPayload>;

// CDMX no tiene adaptador (KH-007): pickAdapter responde 404 MODULE_UNAVAILABLE.
export function createTransitRouter(fetchCancun: FetchRoutes = fetchCancunRoutes) {
  const adapters = { cancun: fetchCancun };
  const router = Router({ mergeParams: true });

  router.get('/', async (req, res) => {
    const city = requireCity((req.params as { cityId: string }).cityId);
    const fetchRoutes = pickAdapter(adapters, city.id, 'Transporte');
    res.json(await fetchRoutes());
  });

  return router;
}

export const transitRouter = createTransitRouter();
