import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, UNAUTHORIZED_EVENT } from '@/shared/lib/http.js';
import { fetchAuthConfig, fetchMe, logout } from './auth.api.js';
import { SessionContext } from './SessionContext.js';

// Pregunta a Express quién es el usuario (GET /api/auth/me) y decide qué se muestra. Es solo la vista: aunque alguien
// fuerce el estado desde las DevTools, la API responde 401 a todo sin una sesión firmada, así que no hay datos que ver.
// El estado vive encapsulado en este componente (nada en window ni en localStorage; el id de sesión es HttpOnly).
export function SessionProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, config: null });

  const refresh = useCallback(async ({ fresh = false } = {}) => {
    // Config y sesión no dependen una de la otra: en 4G lenta, en serie suman dos viajes. Si el origen público
    // no coincide, se redirige y la respuesta de /me se descarta.
    const [config, me] = await Promise.all([
      fetchAuthConfig({ fresh }).catch(() => null),
      fetchMe({ fresh }).then((user) => ({ ok: true, user })).catch((error) => ({ ok: false, error })),
    ]);
    if (config?.publicUrl && new URL(config.publicUrl).origin !== window.location.origin) {
      window.location.replace(new URL(window.location.pathname + window.location.search, config.publicUrl).href);
      return;
    }
    if (me.ok) {
      setState({ status: 'authenticated', user: me.user, config, expired: false });
      return;
    }
    const anonymous = me.error instanceof ApiError && me.error.status === 401;
    setState({ status: anonymous ? 'anonymous' : 'error', user: null, config, error: me.error });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de la sesión desde el servidor
    refresh();
    // Si cualquier petición recibe 401 (sesión caducada o cerrada en otra pestaña), vuelve al login.
    const onUnauthorized = () => setState((s) => (s.status === 'authenticated' ? { ...s, status: 'anonymous', user: null, expired: true } : s));
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [refresh]);

  const signOut = useCallback(async () => {
    await logout();
    setState((s) => ({ ...s, status: 'anonymous', user: null }));
  }, []);

  const value = useMemo(() => ({ ...state, refresh, signOut }), [state, refresh, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
