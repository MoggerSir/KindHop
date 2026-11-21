// Configuración de autenticación. Todo vive en el servidor (apps/api/.env): nada de esto llega al navegador.
export type AuthConfig = {
  sessionSecret: string | null; // firma la cookie de sesión (HMAC). Sin él, la API rechaza todo (falla cerrada).
  googleClientId: string | null;
  googleClientSecret: string | null;
  publicUrl: string; // origen de la web: base del redirect_uri de Google y único origen aceptado en peticiones que cambian datos
  secureCookies: boolean; // cookies solo por HTTPS cuando la web se sirve por HTTPS
  devLogin: boolean; // entrada de demo sin Google; imposible en producción
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
    devLogin: env.AUTH_DEV_LOGIN === 'true' && env.NODE_ENV !== 'production',
  };
}

export const googleEnabled = (config: AuthConfig) => Boolean(config.googleClientId && config.googleClientSecret);
