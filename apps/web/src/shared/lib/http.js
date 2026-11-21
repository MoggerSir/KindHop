// Único cliente HTTP de la web. Los componentes nunca llaman a fetch directamente.
// Lanza ApiError con `code` estable (NETWORK, TIMEOUT, HTTP o el código de la API); respeta AbortSignal y un tiempo máximo.
// El texto que ve el usuario sale de errors.<code> en shared/i18n/locales/*.json (ErrorState); `message` es solo para depurar.
const DEFAULT_TIMEOUT_MS = 8000;
// Se emite cuando la API responde 401: la sesión caducó o se cerró. SessionProvider vuelve al login.
export const UNAUTHORIZED_EVENT = 'kindhop:unauthorized';

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK' } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function http(path, { method = 'GET', body, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let res;
  try {
    res = await fetch(path, {
      method,
      signal: combined,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (timeout.aborted) throw new ApiError('Timeout', { code: 'TIMEOUT' });
    throw new ApiError('Network error');
  }
  const data = await res.json().catch(() => null);
  if (res.status === 401 && !path.startsWith('/api/auth/')) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  if (!res.ok) {
    throw new ApiError(data?.error?.message ?? `HTTP ${res.status}`, { status: res.status, code: data?.error?.code ?? 'HTTP' });
  }
  return data;
}
