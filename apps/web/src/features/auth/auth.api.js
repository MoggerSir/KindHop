import { http } from '@/shared/lib/http.js';

// Contrato: docs/04-api/contract.md (Autenticación). La sesión es una cookie HttpOnly que pone Express:
// este código nunca la ve ni la guarda; el navegador la envía sola en cada petición a /api.
export const fetchAuthConfig = ({ signal, fresh } = {}) => http('/api/auth/config', { signal, fresh });
export const fetchMe = ({ signal, fresh } = {}) => http('/api/auth/me', { signal, fresh }).then((data) => data.user);
export const logout = () => http('/api/auth/logout', { method: 'POST' });
export const devLogin = () => http('/api/auth/dev-login', { method: 'POST' });

// Inicio con Google: navegación completa (no fetch) a Express, que redirige a Google y vuelve con la sesión abierta.
export const GOOGLE_LOGIN_URL = '/api/auth/google';
