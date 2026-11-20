import { useCallback, useEffect, useState } from 'react';
import { fetchCities } from './cities.api.js';

// Estado: { status: 'loading' | 'error' | 'ready', cities, error, reload }
export function useCities() {
  const [state, setState] = useState({ status: 'loading', cities: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchCities({ signal: controller.signal })
      .then((cities) => setState({ status: 'ready', cities, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) setState({ status: 'error', cities: [], error });
      });
    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
