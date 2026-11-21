import { Router } from 'express';
import { pickAdapter } from '../../shared/city-adapters.js';
import { requireDatabase } from '../../shared/db.js';
import { requireCity } from '../cities/index.js';
import { fetchCdmxRoutes } from './adapters/cdmx.js';
import { fetchCancunRoutes, type TransitPayload } from './cancun.adapter.js';

type FetchRoutes = () => Promise<unknown>;

// Cancún: rutas simuladas DEMO (ADR-0008, sin red ni base). El adaptador en vivo de Rutas Cancún (KH-003) está
// desactivado en adapters/cancun-live.ts: para reactivarlo, pasar fetchCancunLiveRoutes aquí.
// CDMX lee el snapshot GTFS importado en transit_* (KH-007): exige la base y responde 503 sin ella.
export function createTransitRouter(
  fetchCancun: () => Promise<TransitPayload> = fetchCancunRoutes,
  fetchCdmx: FetchRoutes = fetchCdmxRoutes,
) {
  const adapters: Record<string, FetchRoutes> = {
    cancun: fetchCancun,
    cdmx: async () => {
      requireDatabase();
      return fetchCdmx();
    },
  };
  const router = Router({ mergeParams: true });

  router.get('/', async (req, res) => {
    const city = requireCity((req.params as { cityId: string }).cityId);
    const fetchRoutes = pickAdapter(adapters, city.id, 'Transporte');
    res.json(await fetchRoutes());
  });

  return router;
}

export const transitRouter = createTransitRouter();
