import { Compass } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { useI18n } from '@/shared/i18n';

// Pestaña Explorar. Lugares reales llegan con KH-004/KH-005; hasta entonces, estado vacío honesto con la categoría pedida.
export function ExploreScreen({ category }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 pt-4">
      <h2 className="text-2xl font-bold tracking-tight text-white">{t('screens.explore.title')}</h2>
      <EmptyState icon={Compass} title={category ? t('screens.explore.category', { category: t(`discovery.categories.${category}`) }) : undefined}>
        {t('screens.explore.soon')}
      </EmptyState>
    </div>
  );
}
