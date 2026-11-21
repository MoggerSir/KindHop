import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_TAB, TABS } from './tabs.js';

// Ruta mínima sin librería: ?tab=<id>&category=<id>. Cada navegación crea una entrada de historial,
// así el botón "atrás" del móvil vuelve a la pestaña anterior. Conserva los demás parámetros (p. ej. ?city=).
function readRoute() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  return { tab: TABS.some((t) => t.id === tab) ? tab : DEFAULT_TAB, category: params.get('category') };
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onPop = () => setRoute(readRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((tab, { category = null } = {}) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    if (category) url.searchParams.set('category', category);
    else url.searchParams.delete('category');
    window.history.pushState(null, '', url);
    setRoute({ tab, category });
    window.scrollTo({ top: 0 });
  }, []);

  return { ...route, navigate };
}
