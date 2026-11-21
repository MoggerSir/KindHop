import { Router } from 'express';
import { requireDatabase } from '../../shared/db.js';
import { pickAdapter } from '../../shared/city-adapters.js';
import { requireCity } from '../cities/index.js';
import { listDistrictFeatures } from './districts.db.js';

// Ciudades con polígonos importados y licencia verificada (fixture en el repo).
const DISTRICT_CITIES = { cdmx: true } as const;

export const discoveryRouter = Router({ mergeParams: true });

discoveryRouter.get('/districts', async (req, res) => {
  const city = requireCity((req.params as { cityId: string }).cityId);
  pickAdapter(DISTRICT_CITIES, city.id, 'Zonas');
  requireDatabase();
  const collection = await listDistrictFeatures(city.id);
  res.json(collection);
});