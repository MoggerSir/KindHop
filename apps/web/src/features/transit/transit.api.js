import { http } from '@/shared/lib/http.js';

// Contrato: GET /api/cities/:cityId/transit -> { routes, source } (ver docs/04-api/contract.md).
export function fetchTransit({ cityId, signal }) {
  if (!cityId) return Promise.resolve(null);
  return http(`/api/cities/${encodeURIComponent(cityId)}/transit`, { signal });
}
