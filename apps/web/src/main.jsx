import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { I18nProvider } from '@/shared/i18n';
import { App } from './app/App.jsx';
import './index.css';

// reducedMotion="user": con prefers-reduced-motion, Motion quita desplazamientos y escalas y deja los fundidos.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <I18nProvider>
        <App />
      </I18nProvider>
    </MotionConfig>
  </StrictMode>,
);
