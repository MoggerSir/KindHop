import type { RequestHandler } from 'express';
import { AppError } from '../../shared/errors.js';

// Elección del MVP: inicio y callback Google + entrada demo comparten 20 peticiones por IP cada 10 min.
// shortcut: memoria de un proceso, usar un almacén compartido antes de desplegar varias instancias.
export const AUTH_ATTEMPT_LIMIT = 20;
export const AUTH_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_IPS = 10_000;
const ATTEMPT_PATHS = new Set(['/google', '/google/callback', '/dev-login']);

type Bucket = { count: number; resetAt: number };

export function authAttemptLimiter({ now = Date.now, maxIps = MAX_IPS } = {}): RequestHandler {
  const attempts = new Map<string, Bucket>();
  return (req, res, next) => {
    // Express ignora mayúsculas y barra final; el contador debe tratar esas rutas igual.
    const path = req.path.toLowerCase().replace(/\/+$/, '');
    if (!ATTEMPT_PATHS.has(path)) return next();
    const time = now();
    // Ventanas fijas, insertadas por caducidad: limpieza amortizada sin recorrer todas las IP en cada petición.
    for (const [ip, bucket] of attempts) {
      if (bucket.resetAt > time) break;
      attempts.delete(ip);
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    let bucket = attempts.get(ip);
    if (!bucket && attempts.size < maxIps) {
      bucket = { count: 0, resetAt: time + AUTH_ATTEMPT_WINDOW_MS };
      attempts.set(ip, bucket);
    }
    if (!bucket || bucket.count >= AUTH_ATTEMPT_LIMIT) {
      const resetAt = bucket?.resetAt ?? attempts.values().next().value?.resetAt ?? time + AUTH_ATTEMPT_WINDOW_MS;
      res.set('Retry-After', String(Math.max(1, Math.ceil((resetAt - time) / 1000))));
      throw new AppError(429, 'RATE_LIMITED', 'Demasiados intentos de inicio de sesión. Inténtalo más tarde.');
    }
    bucket.count += 1;
    next();
  };
}
