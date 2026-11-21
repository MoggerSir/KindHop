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
    <motion.div variants={fadeRise} initial="hidden" animate="visible" role="alert" className="flex flex-col items-center gap-3 border border-transparent bg-surface p-8 text-center shadow-raised">
      <p className="title text-lg">{t(has(key) ? key : 'errors.UNKNOWN')}</p>
      {hint && <p className="text-sm text-ink-2">{hint}</p>}
      {onRetry && (
        <motion.button
          type="button"
          onClick={onRetry}
          whileTap={press}
          className="label inline-flex h-11 items-center gap-2.5 rounded-control bg-solid pr-6 pl-5 text-on-solid shadow-solid transition-colors duration-150 hover:bg-solid-hover"
        >
          <RotateCw aria-hidden="true" size={15} strokeWidth={1.5} /> {t('common.retry')}
        </motion.button>
      )}
    </motion.div>
  );
}
