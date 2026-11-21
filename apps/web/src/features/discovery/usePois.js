import { useResource } from '@/shared/hooks/useResource.js';
import { fetchPois } from './pois.api.js';

export function usePois(city) {
  const resource = useResource(fetchPois, { cityId: city.id });
  return { ...resource, pois: resource.data?.pois ?? [], source: resource.data?.source ?? null };
}
