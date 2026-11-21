import { Crown, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { usePlan } from './PlanContext.js';

// Tarjeta del plan en el menú de cuenta: Pro activo (con "simulado" en la demo) o invitación a Pro.
export function PlanCard({ onOpen }) {
  const { t, locale } = useI18n();
  const { plan } = usePlan();
  const pro = plan.tier === 'PRO';
  const until = plan.until ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(plan.until)) : null;
  return (
    <motion.button
      type="button"
      whileTap={press}
      onClick={onOpen}
      className={`flex min-h-16 w-full items-center gap-3 rounded-card border px-4 py-3 text-left transition-colors duration-150 ${pro ? 'border-accent/60 bg-accent/10 hover:bg-accent/15' : 'border-line bg-surface hover:border-line-strong hover:bg-surface-hover'}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
        <Crown aria-hidden="true" size={18} strokeWidth={1.5} />
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-sm font-semibold text-ink">{t(pro ? 'monetization.plan.proActive' : 'monetization.plan.free')}</span>
        <span className="text-xs text-pretty text-ink-2">
          {pro
            ? [until && t('monetization.plan.until', { date: until }), plan.simulated && t('monetization.plan.simulated')].filter(Boolean).join(' · ')
            : t('monetization.plan.upsell')}
        </span>
      </span>
      <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-ink-3" />
    </motion.button>
  );
}
