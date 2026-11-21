import { useResource } from '@/shared/hooks/useResource.js';
import { fetchCities } from './cities.api.js';

// Estado: { status: 'loading' | 'error' | 'ready', cities, error, reload }
export function useCities() {
  const { data, ...state } = useResource(fetchCities);
  return { ...state, cities: data ?? [] };
}
