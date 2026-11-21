import { lazy } from 'react';

export { PRIVACY_PATH, isPrivacyPath } from './route.js';

// Chunk aparte: el aviso no pesa en la app y se monta sin sesión (ver main.jsx).
export const PrivacyPage = lazy(() => import('./PrivacyPage.jsx').then((m) => ({ default: m.PrivacyPage })));
