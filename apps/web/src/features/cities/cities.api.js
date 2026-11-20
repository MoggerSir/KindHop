import { http } from '@/shared/lib/http.js';

// Contrato: GET /api/cities -> { cities: City[] }  (ver docs/04-api/contract.md)
export function fetchCities({ signal } = {}) {
  return http('/api/cities', { signal }).then((data) => data.cities);
}
