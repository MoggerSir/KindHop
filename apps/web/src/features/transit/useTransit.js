import { useResource } from '@/shared/hooks/useResource.js';
import { fetchTransit } from './transit.api.js';

// null si la ciudad no tiene la capa: no pedimos el endpoint y el mapa no dibuja líneas de otra ciudad.
export function useTransit(cityId) {
  const { data, status, error, reload } = useResource(fetchTransit, { cityId });
  if (!cityId) return { status: 'ready', transit: null, error: null, reload };
  return { status, transit: data, error, reload };
}
