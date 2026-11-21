import { http } from '@/shared/lib/http.js';

// Contrato: GET /api/cities/:cityId/districts -> FeatureCollection + source (docs/04-api/contract.md)
export function fetchDistricts({ cityId, signal, fresh }) {
  return http(`/api/cities/${encodeURIComponent(cityId)}/districts`, { signal, fresh });
}