import { http } from '@/shared/lib/http.js';

// Contrato: GET /api/cities/:cityId/suggestions?placeId&lang -> { suggestions } (docs/04-api/contract.md).
// El texto de `why` lo arma la API en el idioma pedido: la regla y su explicación viven en un solo sitio.
export function fetchSuggestions({ cityId, placeId, lang, signal, fresh }) {
  const query = new URLSearchParams({ placeId, lang });
  return http(`/api/cities/${encodeURIComponent(cityId)}/suggestions?${query}`, { signal, fresh });
}
