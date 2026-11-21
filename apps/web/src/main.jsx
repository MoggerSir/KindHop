import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { SessionProvider } from '@/features/auth';
import { PrivacyPage, isPrivacyPath } from '@/features/legal';
import { I18nProvider } from '@/shared/i18n';
import { App } from './app/App.jsx';
import './index.css';

// reducedMotion="user": con prefers-reduced-motion, Motion quita desplazamientos y escalas y deja los fundidos.
// /privacidad es pública (KH-027): se monta sin SessionProvider, así no espera a la API ni pasa por el login.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      {isPrivacyPath(window.location.pathname) ? (
        <Suspense fallback={null}>
          <PrivacyPage />
        </Suspense>
      ) : (
        <I18nProvider>
          <SessionProvider>
            <App />
          </SessionProvider>
        </I18nProvider>
      )}
    </MotionConfig>
  </StrictMode>,
);
