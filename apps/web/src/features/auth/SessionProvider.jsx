import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, UNAUTHORIZED_EVENT } from '@/shared/lib/http.js';
import { fetchAuthConfig, fetchMe, logout } from './auth.api.js';
import { SessionContext } from './SessionContext.js';

// Pregunta a Express quién es el usuario (GET /api/auth/me) y decide qué se muestra. Es solo la vista: aunque alguien
// fuerce el estado desde las DevTools, la API responde 401 a todo sin una sesión firmada, así que no hay datos que ver.
// El estado vive encapsulado en este componente (nada en window ni en localStorage; el id de sesión es HttpOnly).
export function SessionProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, config: null });

  const refresh = useCallback(async () => {
    const config = await fetchAuthConfig().catch(() => null);
    try {
      const user = await fetchMe();
      setState({ status: 'authenticated', user, config });
    } catch (err) {
      const anonymous = err instanceof ApiError && err.status === 401;
      setState({ status: anonymous ? 'anonymous' : 'error', user: null, config, error: err });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de la sesión desde el servidor
    refresh();
    // Si cualquier petición recibe 401 (sesión caducada o cerrada en otra pestaña), vuelve al login.
    const onUnauthorized = () => setState((s) => (s.status === 'authenticated' ? { ...s, status: 'anonymous', user: null } : s));
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [refresh]);

  const signOut = useCallback(async () => {
    await logout().catch(() => {});
    setState((s) => ({ ...s, status: 'anonymous', user: null }));
  }, []);

  const value = useMemo(() => ({ ...state, refresh, signOut }), [state, refresh, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
