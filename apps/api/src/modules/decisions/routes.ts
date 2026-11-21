import { Router } from 'express';
import { z } from 'zod';
import { requireCity } from '../cities/index.js';
import { AppError } from '../../shared/errors.js';
import { requireDatabase } from '../../shared/db.js';
import { loadSuggestions } from './decisions.db.js';

// budget es opcional: el presupuesto vive en el navegador (sin tabla). Solo "low" cambia el orden.
const querySchema = z.object({
  placeId: z.string().regex(/^[1-9]\d{0,15}$/),
  budget: z.enum(['low']).optional(),
});

export const suggestionsRouter = Router({ mergeParams: true });

suggestionsRouter.get('/', async (req, res) => {
  const city = requireCity((req.params as { cityId?: string }).cityId);
  const parsed = querySchema.safeParse({
    placeId: firstQuery(req.query.placeId),
    budget: firstQuery(req.query.budget),
  });
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'placeId debe ser un entero positivo; budget, si viene, solo puede ser low');
  }
  requireDatabase();
  const suggestions = await loadSuggestions({
    cityId: city.id,
    placeId: parsed.data.placeId,
    lowBudget: parsed.data.budget === 'low',
  });
  if (!suggestions) throw new AppError(404, 'PLACE_NOT_FOUND', 'Ese lugar no está en esta ciudad');
  res.json({ suggestions });
});

function firstQuery(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}
