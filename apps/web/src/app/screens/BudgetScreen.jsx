import { Wallet } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { useI18n } from '@/shared/i18n';

// Pestaña Presupuesto. Se construye en KH-010 (local-first, sin cuenta ni datos bancarios).
export function BudgetScreen() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 pt-4">
      <h2 className="display text-2xl">{t('screens.budget.title')}</h2>
      <EmptyState icon={Wallet}>{t('screens.budget.soon')}</EmptyState>
    </div>
  );
}
