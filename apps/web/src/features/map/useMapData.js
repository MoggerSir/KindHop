import { useResource } from '@/shared/hooks/useResource.js';
import { fetchDistricts, fetchPois } from '@/features/discovery';
import { useEvents } from '@/features/events';
import { fetchTransit } from '@/features/transit';

const loadPois = (params) => params.enabled ? fetchPois(params) : Promise.resolve(null);
const loadTransit = (params) => params.enabled ? fetchTransit(params) : Promise.resolve(null);
const loadDistricts = (params) => params.enabled ? fetchDistricts(params) : Promise.resolve(null);

export function useMapData(city) {
  const pois = useResource(loadPois, { cityId: city.id, enabled: city.modules.pois === 'IMPLEMENTED' });
  const transit = useResource(loadTransit, { cityId: city.id, enabled: ['IMPLEMENTED', 'DEMO'].includes(city.modules.transit) });
  const districts = useResource(loadDistricts, { cityId: city.id, enabled: city.modules.districts === 'IMPLEMENTED' });
  const events = useEvents(city);
  return { pois, transit, districts, events };
}
