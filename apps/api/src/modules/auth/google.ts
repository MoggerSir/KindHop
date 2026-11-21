import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

// Google OAuth 2.0 / OpenID Connect, flujo "authorization code" con PKCE, hecho entero en el servidor:
// el client secret nunca sale de Express y el navegador solo ve una redirección a Google y el código de un solo uso.
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

export type GoogleProfile = { sub: string; email: string; name: string | null; picture: string | null };

export const randomToken = () => randomBytes(32).toString('base64url');
export const pkceChallenge = (verifier: string) => createHash('sha256').update(verifier).digest('base64url');

// Comparación en tiempo constante (el state viene del navegador).
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function googleAuthUrl(p: { clientId: string; redirectUri: string; state: string; nonce: string; codeChallenge: string }): string {
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: p.clientId,
    redirect_uri: p.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: p.state,
    nonce: p.nonce,
    code_challenge: p.codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();
  return url.toString();
}

// Canjea el código (POST servidor-a-servidor, con el client secret y el verificador PKCE) por el id_token.
export async function exchangeCodeForIdToken(p: { code: string; codeVerifier: string; clientId: string; clientSecret: string; redirectUri: string }): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: p.code,
      code_verifier: p.codeVerifier,
      client_id: p.clientId,
      client_secret: p.clientSecret,
      redirect_uri: p.redirectUri,
      grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Google token endpoint respondió ${res.status}`);
  const data = (await res.json()) as { id_token?: unknown };
  if (typeof data.id_token !== 'string') throw new Error('Respuesta de Google sin id_token');
  return data.id_token;
}

// Verifica firma (claves públicas de Google), emisor, audiencia (nuestro client id), caducidad, nonce y email verificado.
export async function verifyGoogleIdToken(idToken: string, p: { clientId: string; nonce: string; jwks?: JWTVerifyGetKey }): Promise<GoogleProfile> {
  const { payload } = await jwtVerify(idToken, p.jwks ?? GOOGLE_JWKS, { issuer: GOOGLE_ISSUERS, audience: p.clientId, algorithms: ['RS256'] });
  if (typeof payload.nonce !== 'string' || !safeEqual(payload.nonce, p.nonce)) throw new Error('nonce no coincide');
  if (payload.email_verified !== true || typeof payload.email !== 'string' || typeof payload.sub !== 'string') throw new Error('email no verificado');
  return {
    sub: payload.sub,
    email: payload.email.slice(0, 320),
    name: typeof payload.name === 'string' ? payload.name.slice(0, 200) : null,
    picture: typeof payload.picture === 'string' && payload.picture.startsWith('https://') ? payload.picture : null,
  };
}
