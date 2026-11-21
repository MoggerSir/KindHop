import { fetchCities } from '@/features/cities';
import { fetchDistricts, fetchPois } from '@/features/discovery';
import { fetchEvents } from '@/features/events';
import { fetchTransit } from '@/features/transit';

const DEFAULT_CITY = 'cancun';
const warmed = new Set();

function readCityId() {
  return new URLSearchParams(window.location.search).get('city') || DEFAULT_CITY;
}

function activeCity(cities, requestedId) {
  return cities.find((city) => city.id === requestedId) ?? cities[0] ?? null;
}

// Arranca en paralelo lo que la pestaña va a pedir, sin esperar a que React monte la pantalla ni a que responda
// el catálogo de ciudades (salvo las capas del mapa, que dependen del estado del módulo). Las funciones HTTP
// deduplican: cuando el hook monte, se engancha a la misma petición.
export function warmTab(tab, locale) {
  const requestedId = readCityId();
  const key = `${locale}|${requestedId}|${tab}`;
  if (warmed.has(key)) return;
  warmed.add(key);

  const citiesPromise = fetchCities({});
  if (tab === 'budget') return;

  const eventsAndPlaces = () => {
    fetchEvents({ cityId: requestedId, locale }).catch(() => {});
    fetchPois({ cityId: requestedId }).catch(() => {});
  };

  if (tab === 'home' || tab === 'explore') {
    eventsAndPlaces();
    return;
  }

  if (tab === 'map') {
    fetchEvents({ cityId: requestedId, locale }).catch(() => {});
    citiesPromise
      .then((cities) => {
        const city = activeCity(cities, requestedId);
        if (!city) return;
        const id = city.id;
        if (city.modules.pois === 'IMPLEMENTED') fetchPois({ cityId: id }).catch(() => {});
        if (city.modules.transit === 'IMPLEMENTED' || city.modules.transit === 'DEMO') fetchTransit({ cityId: id }).catch(() => {});
        if (city.modules.districts === 'IMPLEMENTED') fetchDistricts({ cityId: id }).catch(() => {});
      })
      .catch(() => {});
  }
}
