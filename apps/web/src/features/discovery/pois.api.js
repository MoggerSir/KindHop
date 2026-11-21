import { http } from '@/shared/lib/http.js';

// Contrato: GET /api/cities/:cityId/pois -> { pois: Poi[], source } (docs/04-api/contract.md). Solo lugares REAL de OSM.
export function fetchPois({ cityId, signal }) {
  return http(`/api/cities/${encodeURIComponent(cityId)}/pois`, { signal });
}
