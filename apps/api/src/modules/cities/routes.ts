import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import { cities, findCity } from './catalog.js';

const cityIdSchema = z.string().regex(/^[a-z0-9-]{2,32}$/);

export const citiesRouter = Router();

citiesRouter.get('/', (_req, res) => {
  res.json({ cities });
});

citiesRouter.get('/:cityId', (req, res) => {
  const parsed = cityIdSchema.safeParse(req.params.cityId);
  if (!parsed.success) throw new AppError(400, 'INVALID_CITY_ID', 'Identificador de ciudad inválido');
  const city = findCity(parsed.data);
  if (!city) throw new AppError(404, 'CITY_NOT_FOUND', 'Ciudad no disponible');
  res.json({ city });
});
