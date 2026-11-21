import { Router } from 'express';
import { cities } from './catalog.js';
import { requireCity } from './require-city.js';

export const citiesRouter = Router();

citiesRouter.get('/', (_req, res) => {
  res.json({ cities });
});

citiesRouter.get('/:cityId', (req, res) => {
  res.json({ city: requireCity(req.params.cityId) });
});
