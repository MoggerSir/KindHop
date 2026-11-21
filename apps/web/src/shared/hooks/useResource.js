import { useCallback, useEffect, useState } from 'react';

// Patrón único de carga de datos para todas las features: { status: 'loading' | 'error' | 'ready', data, error, reload }.
// `load({ ...params, signal })` vive en el *.api.js de la feature y debe ser una función estable (definida a nivel de módulo).
// Cambiar `params` (p. ej. { cityId }) cancela la petición anterior y vuelve a pedir; mientras tanto el estado es
// 'loading', nunca los datos de la ciudad anterior.
export function useResource(load, params = {}) {
  const paramsKey = JSON.stringify(params);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${paramsKey}#${attempt}`;
  const [result, setResult] = useState({ requestKey: null, status: 'loading', data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    const key = `${paramsKey}#${attempt}`;
    load({ ...JSON.parse(paramsKey), signal: controller.signal, fresh: attempt > 0 })
      .then((data) => setResult({ requestKey: key, status: 'ready', data, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ requestKey: key, status: 'error', data: null, error });
      });
    return () => controller.abort();
  }, [load, paramsKey, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  if (result.requestKey !== requestKey) return { status: 'loading', data: null, error: null, reload };
  return { status: result.status, data: result.data, error: result.error, reload };
}
