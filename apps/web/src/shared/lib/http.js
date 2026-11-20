// Único cliente HTTP de la web. Los componentes nunca llaman a fetch directamente.
// Lanza ApiError con mensaje legible; respeta AbortSignal y un tiempo máximo.
const DEFAULT_TIMEOUT_MS = 8000;

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
    if (timeout.aborted) throw new ApiError('El servidor tardó demasiado en responder.', { code: 'TIMEOUT' });
    throw new ApiError('No hay conexión con el servidor.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error?.message ?? `Error ${res.status} del servidor.`, { status: res.status, code: data?.error?.code ?? 'HTTP' });
  }
  return data;
}
