import { RotateCw } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeRise, press } from '@/shared/motion/motion.js';
import { useI18n } from '@/shared/i18n';

// Estado de error estándar: mensaje legible, pista opcional y "Reintentar" como tarjeta negra (obligatorio según ux-rules).
// El mensaje sale de errors.<code> del JSON del idioma (códigos de ApiError y de la API); código desconocido → errors.UNKNOWN.
export function ErrorState({ error, hint, onRetry }) {
  const { t, has } = useI18n();
  const key = `errors.${error?.code}`;
  return (
    <motion.div variants={fadeRise} initial="hidden" animate="visible" role="alert" className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-8 text-center shadow-raised">
      <p className="title text-lg font-semibold text-ink">{t(has(key) ? key : 'errors.UNKNOWN')}</p>
      {hint && <p className="text-sm text-ink-2">{hint}</p>}
      {onRetry && (
        <motion.button
          type="button"
          onClick={onRetry}
          whileTap={press}
          className="inline-flex h-11 items-center gap-2.5 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-solid transition-colors duration-150 hover:bg-accent-hover"
        >
          <RotateCw aria-hidden="true" size={15} strokeWidth={2} /> {t('common.retry')}
        </motion.button>
      )}
    </motion.div>
  );
}
