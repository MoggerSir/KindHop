import { useI18n } from '@/shared/i18n';

// Estado de carga estándar, en versalitas discretas. El contenedor que carga debe llevar aria-busy.
export function LoadingState({ children }) {
  const { t } = useI18n();
  return (
    <p role="status" className="label p-6 text-center text-ink-3">
      {children ?? t('common.loading')}
    </p>
  );
}
