import type { RequestHandler } from 'express';
import { AppError } from './errors.js';

// Cabeceras básicas de endurecimiento para todas las respuestas de la API.
export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cache-Control': 'no-store',
  });
  next();
};

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Contra CSRF: toda petición que cambia estado debe venir de la propia web (cabecera Origin exacta). Junto con la
// cookie SameSite=Lax, otro sitio no puede usar la sesión del usuario para escribir.
export function requireSameOrigin(allowedOrigins: string[]): RequestHandler {
  const allowed = new Set(allowedOrigins);
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.get('origin');
    if (!origin || !allowed.has(origin)) throw new AppError(403, 'FORBIDDEN_ORIGIN', 'Origen no permitido');
    next();
  };
}
