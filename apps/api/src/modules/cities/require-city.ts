import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import { findCity, type City } from './catalog.js';

const cityIdSchema = z.string().regex(/^[a-z0-9-]{2,32}$/);

// Valida el :cityId de cualquier ruta /api/cities/:cityId/... y devuelve la ciudad o lanza el error del contrato.
export function requireCity(rawCityId: unknown): City {
  const parsed = cityIdSchema.safeParse(rawCityId);
  if (!parsed.success) throw new AppError(400, 'INVALID_CITY_ID', 'Identificador de ciudad inválido');
  const city = findCity(parsed.data);
  if (!city) throw new AppError(404, 'CITY_NOT_FOUND', 'Ciudad no disponible');
  return city;
}
