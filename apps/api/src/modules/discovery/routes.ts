import { Router } from 'express';
import { z } from 'zod';
import { requireCity } from '../cities/index.js';
import { pickAdapter, type CityAdapters } from '../../shared/city-adapters.js';
import { AppError } from '../../shared/errors.js';
import { fetchCancunPois } from './adapters/cancun.js';

const categorySchema = z.string().regex(/^[a-z][a-z0-9_]{1,31}$/);

const adapters: CityAdapters<typeof fetchCancunPois> = { cancun: fetchCancunPois };

export const poisRouter = Router({ mergeParams: true });

function readCategory(value: unknown): string | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = categorySchema.safeParse(value);
  if (!parsed.success) throw new AppError(400, 'VALIDATION', 'Categoría inválida');
  return parsed.data;
}

poisRouter.get('/', async (req, res) => {
  const city = requireCity((req.params as { cityId?: string }).cityId);
  const category = readCategory(req.query.category);
  res.json(await pickAdapter(adapters, city.id, 'Lugares')(category));
});
