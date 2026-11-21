import { useCallback } from 'react';
import { useResource } from '@/shared/hooks/useResource.js';
import { fetchDistricts } from './districts.api.js';

const SKIP = '__districts_skip__';

export function useDistricts(city, { enabled = true } = {}) {
  const shouldLoad = enabled && city.modules?.districts === 'IMPLEMENTED';
  const load = useCallback(async ({ cityId, signal }) => {
    if (cityId === SKIP) return null;
    return fetchDistricts({ cityId, signal });
  }, []);
  const { data, ...state } = useResource(load, { cityId: shouldLoad ? city.id : SKIP });
  if (!shouldLoad) {
    return { status: 'idle', data: null, error: null, reload: state.reload };
  }
  return { ...state, data };
}