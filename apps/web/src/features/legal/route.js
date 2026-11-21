// Páginas públicas (KH-027): se sirven sin sesión, antes de la puerta de login, y sin llamar a la API.
export const PRIVACY_PATH = '/privacidad';

export function isPrivacyPath(pathname) {
  return pathname.replace(/\/+$/, '').toLowerCase() === PRIVACY_PATH;
}
