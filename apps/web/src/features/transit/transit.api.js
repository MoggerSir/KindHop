import { http } from '@/shared/lib/http.js';

// Contrato: GET /api/cities/:cityId/transit -> { routes: TransitRoute[], source } (docs/04-api/contract.md).
export function fetchTransit({ cityId, signal }) {
  return http(`/api/cities/${encodeURIComponent(cityId)}/transit`, { signal });
}
