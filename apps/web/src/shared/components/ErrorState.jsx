import { RotateCw } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Estado de error estándar: mensaje legible, pista opcional y "Reintentar" (obligatorio según ux-rules).
// El mensaje sale de errors.<code> del JSON del idioma (códigos de ApiError y de la API); código desconocido → errors.UNKNOWN.
export function ErrorState({ error, hint, onRetry }) {
  const { t, has } = useI18n();
  const key = `errors.${error?.code}`;
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-8 text-center">
      <p className="font-medium">{t(has(key) ? key : 'errors.UNKNOWN')}</p>
      {hint && <p className="text-sm text-ink-2">{hint}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 font-semibold text-accent-ink">
          <RotateCw aria-hidden="true" size={16} /> {t('common.retry')}
        </button>
      )}
    </div>
  );
}
