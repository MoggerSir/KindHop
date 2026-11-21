import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_TAB, TABS } from './tabs.js';

// Ruta mínima sin librería: ?tab=<id>&category=<id>&q=<texto>&when=<today|week>. Cada navegación crea una entrada
// de historial, así el botón "atrás" del móvil vuelve a la pestaña anterior. Conserva los demás parámetros (p. ej. ?city=).
const FILTERS = ['category', 'q', 'when'];

function readRoute() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  return {
    tab: TABS.some((t) => t.id === tab) ? tab : DEFAULT_TAB,
    category: params.get('category'),
    q: params.get('q') ?? '',
    when: params.get('when'),
    focus: params.get('focus'),
  };
}

function writeUrl(values, replace) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onPop = () => setRoute(readRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Cambiar de pestaña limpia los filtros de Explorar (salvo la categoría o foco de mapa que se pida).
  const navigate = useCallback((tab, { category = null, focus = null } = {}) => {
    writeUrl({ tab, category, q: null, when: null, focus });
    setRoute({ tab, category, q: '', when: null, focus });
    window.scrollTo({ top: 0 });
  }, []);

  // Filtros de Explorar en la URL (compartibles). `replace`: al escribir no se llena el historial de letras.
  const setFilters = useCallback((patch, { replace = false } = {}) => {
    const values = Object.fromEntries(Object.entries(patch).filter(([key]) => FILTERS.includes(key)));
    writeUrl(values, replace);
    setRoute(readRoute());
  }, []);

  return { ...route, navigate, setFilters };
}
