import { useI18n } from '@/shared/i18n';

// Estado de carga estándar. El contenedor que carga debe llevar aria-busy. Sin children usa el texto genérico.
export function LoadingState({ children }) {
  const { t } = useI18n();
  return (
    <p role="status" className="p-6 text-center text-sm text-ink-2">
      {children ?? t('common.loading')}
    </p>
  );
}
