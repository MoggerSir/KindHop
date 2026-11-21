// Configuración de autenticación. Todo vive en el servidor (apps/api/.env): nada de esto llega al navegador.
export type AuthConfig = {
  sessionSecret: string | null; // firma la cookie de sesión (HMAC). Sin él, la API rechaza todo (falla cerrada).
  googleClientId: string | null;
  googleClientSecret: string | null;
  publicUrl: string; // origen de la web: base del redirect_uri de Google y único origen aceptado en peticiones que cambian datos
  secureCookies: boolean; // cookies solo por HTTPS cuando la web se sirve por HTTPS
  devLogin: boolean; // entrada de demo sin Google; en producción solo con AUTH_DEMO_IN_PRODUCTION=true (demo del jurado)
};

export const MIN_SECRET_LENGTH = 32;

export function readAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const secret = env.SESSION_SECRET ?? '';
  const publicUrl = (env.PUBLIC_URL || env.WEB_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '');
  return {
    sessionSecret: secret.length >= MIN_SECRET_LENGTH ? secret : null,
    googleClientId: env.GOOGLE_CLIENT_ID || null,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET || null,
    publicUrl,
    secureCookies: publicUrl.startsWith('https://'),
    // La demo pública del hackatón necesita la cuenta demo en producción: se pide con una segunda variable explícita,
    // para que AUTH_DEV_LOGIN olvidada en un .env de producción no la active sola.
    devLogin: env.AUTH_DEV_LOGIN === 'true' && (env.NODE_ENV !== 'production' || env.AUTH_DEMO_IN_PRODUCTION === 'true'),
  };
}

export const googleEnabled = (config: AuthConfig) => Boolean(config.googleClientId && config.googleClientSecret);
