import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import type { Request, RequestHandler } from 'express';
import { AppError } from '../../shared/errors.js';
import { getPool, isDatabaseConfigured } from '../../shared/db.js';
import type { AuthConfig } from './config.js';
import { findUserById } from './users.db.js';

// Datos de la sesión del lado del servidor. El navegador solo guarda el id (sid) firmado en la cookie HttpOnly.
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    oauth?: { state: string; verifier: string; nonce: string; createdAt: number };
  }
}

export const SESSION_COOKIE = 'kh.sid';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // recuerda la sesión 7 días; cada petición la renueva (rolling)

export const sessionCookieOptions = (config: AuthConfig) => ({
  httpOnly: true, // el JavaScript de la página (y las DevTools vía document.cookie) no puede leerla
  secure: config.secureCookies,
  sameSite: 'lax' as const, // viaja en la vuelta desde Google; no en peticiones POST de otros sitios
  path: '/',
});

// express-session una sola vez para toda la API. saveUninitialized: false → no se crea ningún id hasta que hace falta
// (inicio de sesión); el id se regenera al iniciar sesión (contra fijación de sesión). Sesiones en PostgreSQL.
export function sessionMiddleware(config: AuthConfig, store?: session.Store): RequestHandler {
  if (!config.sessionSecret) {
    return () => {
      throw new AppError(503, 'AUTH_NOT_CONFIGURED', 'La autenticación no está configurada en el servidor');
    };
  }
  let resolved = store;
  if (!resolved && isDatabaseConfigured()) {
    const PgStore = connectPgSimple(session);
    resolved = new PgStore({ pool: getPool(), tableName: 'user_sessions', pruneSessionInterval: 15 * 60 });
  }
  if (!resolved && process.env.NODE_ENV === 'production') {
    return () => {
      throw new AppError(503, 'AUTH_NOT_CONFIGURED', 'Las sesiones necesitan la base de datos');
    };
  }
  return session({
    name: SESSION_COOKIE,
    secret: config.sessionSecret,
    store: resolved, // sin base de datos y fuera de producción: memoria (solo desarrollo y tests)
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { ...sessionCookieOptions(config), maxAge: SESSION_MAX_AGE_MS },
  });
}

// Promesas sobre la API de callbacks de express-session.
export const regenerateSession = (req: Request) => new Promise<void>((ok, ko) => req.session.regenerate((e) => (e ? ko(e) : ok())));
export const saveSession = (req: Request) => new Promise<void>((ok, ko) => req.session.save((e) => (e ? ko(e) : ok())));
export const destroySession = (req: Request) => new Promise<void>((ok, ko) => req.session.destroy((error) => (error ? ko(error) : ok())));

// Exige una sesión iniciada y un usuario existente. Lo usan todas las rutas de datos: sin sesión firmada, 401.
export const requireSession: RequestHandler = async (req, res, next) => {
  const userId = req.session?.userId;
  if (!userId) throw new AppError(401, 'UNAUTHENTICATED', 'Inicia sesión para continuar');
  const user = await findUserById(userId);
  if (!user) {
    await destroySession(req);
    throw new AppError(401, 'UNAUTHENTICATED', 'Inicia sesión para continuar');
  }
  res.locals.user = user;
  next();
};
