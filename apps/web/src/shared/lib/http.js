// Único cliente HTTP de la web. Los componentes nunca llaman a fetch directamente.
// Lanza ApiError con `code` estable (NETWORK, TIMEOUT, HTTP o el código de la API); respeta AbortSignal y un tiempo máximo.
// El texto que ve el usuario sale de errors.<code> en shared/i18n/locales/*.json (ErrorState); `message` es solo para depurar.
const DEFAULT_TIMEOUT_MS = 8000;
// Una petición GET que ya está en vuelo (o acaba de terminar) se reutiliza unos segundos. Así el prefetch de la
// pantalla y el hook que se monta después comparten una sola ida al servidor, y React en modo estricto no la duplica.
const REUSE_MS = 5000;
// Se emite cuando la API responde 401: la sesión caducó o se cerró. SessionProvider vuelve al login.
export const UNAUTHORIZED_EVENT = 'kindhop:unauthorized';

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK' } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const inflight = new Map();

function abortError(signal) {
  return signal?.reason ?? new DOMException('The operation was aborted', 'AbortError');
}

async function request(path, { method, body, signal, timeoutMs }) {
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

// GET sin cuerpo: varios consumidores (prefetch + hook, o el doble montaje de desarrollo) comparten la misma
// respuesta. Abortar uno no cancela la petición si otro sigue esperándola. `fresh` tira la respuesta guardada
// (reintentar, o un dato que el usuario acaba de cambiar).
function dedupedGet(path, { signal, timeoutMs, fresh }) {
  if (fresh) {
    const prev = inflight.get(path);
    if (prev) {
      inflight.delete(path);
      prev.controller.abort();
    }
  }

  let slot = inflight.get(path);
  if (!slot) {
    const controller = new AbortController();
    const created = { controller, consumers: 0, settled: false };
    created.promise = request(path, { method: 'GET', signal: controller.signal, timeoutMs })
      .then((data) => {
        created.settled = true;
        return data;
      })
      .catch((err) => {
        created.settled = true;
        if (inflight.get(path) === created) inflight.delete(path);
        throw err;
      });
    slot = created;
    inflight.set(path, slot);
    const timer = setTimeout(() => {
      if (inflight.get(path) === slot) inflight.delete(path);
    }, REUSE_MS);
    timer.unref?.();
  }

  slot.consumers += 1;
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    slot.consumers -= 1;
    if (slot.consumers <= 0 && !slot.settled) {
      if (inflight.get(path) === slot) inflight.delete(path);
      slot.controller.abort();
    }
  };

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      release();
      reject(abortError(signal));
      return;
    }
    const onAbort = () => {
      release();
      reject(abortError(signal));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    slot.promise.then(
      (data) => {
        signal?.removeEventListener('abort', onAbort);
        if (signal?.aborted) return;
        resolve(data);
      },
      (err) => {
        signal?.removeEventListener('abort', onAbort);
        if (signal?.aborted) return;
        reject(err);
      },
    );
  });
}

export async function http(path, { method = 'GET', body, signal, timeoutMs = DEFAULT_TIMEOUT_MS, fresh = false } = {}) {
  if (method === 'GET' && body == null) return dedupedGet(path, { signal, timeoutMs, fresh });
  return request(path, { method, body, signal, timeoutMs });
}
