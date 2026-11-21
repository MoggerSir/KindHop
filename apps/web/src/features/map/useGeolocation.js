import { useCallback, useState } from 'react';

// Ubicación del usuario solo cuando la pide (botón "Mi ubicación"): el navegador muestra su permiso explícito.
// Se guarda en memoria mientras la pestaña está abierta: nunca en localStorage, la URL ni la API (data-policy.md).
// status: idle · locating · ready · denied · unavailable · unsupported
export function useGeolocation() {
  const [state, setState] = useState({ status: 'idle', position: null });

  const locate = useCallback(
    () =>
      new Promise((resolve) => {
        if (!('geolocation' in navigator)) {
          setState({ status: 'unsupported', position: null });
          resolve(null);
          return;
        }
        setState((prev) => ({ ...prev, status: 'locating' }));
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const position = [coords.longitude, coords.latitude];
            setState({ status: 'ready', position });
            resolve(position);
          },
          (error) => {
            setState({ status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable', position: null });
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
        );
      }),
    [],
  );

  return { ...state, locate };
}
