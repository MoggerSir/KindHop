import { useCallback, useState } from 'react';
import { useCities } from './useCities.js';

const DEFAULT_CITY_ID = 'cancun';

function readCityFromUrl() {
  return new URLSearchParams(window.location.search).get('city') ?? DEFAULT_CITY_ID;
}

// Ciudad activa de la app. Se guarda en ?city= para que recargar o compartir el enlace conserve la ciudad.
// Un id desconocido en la URL cae a la primera ciudad del catálogo.
export function useSelectedCity() {
  const { status, cities, error, reload } = useCities();
  const [cityId, setCityIdState] = useState(readCityFromUrl);
  const city = cities.find((c) => c.id === cityId) ?? cities[0] ?? null;

  const setCityId = useCallback((id) => {
    const url = new URL(window.location.href);
    url.searchParams.set('city', id);
    window.history.replaceState(null, '', url);
    setCityIdState(id);
  }, []);

  return { status, cities, city, error, reload, setCityId };
}
