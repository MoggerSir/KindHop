import { HandCoins } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { spring } from '@/shared/motion/motion.js';
import { localShare } from './budget.js';

// Medidor de gasto local (KH-020): qué parte de lo gastado se quedó en negocios locales, según lo que el usuario marcó.
export function LocalSpendMeter({ expenses, format }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const { localCents, totalCents, percent } = localShare(expenses);

  return (
    <section aria-labelledby="local-meter-title" className="grid gap-3 rounded-card border border-line bg-surface p-5 shadow-raised">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <h3 id="local-meter-title" className="title flex items-center gap-1.5 text-base font-semibold text-ink">
            <HandCoins aria-hidden="true" size={17} strokeWidth={1.5} className="text-accent" />
            {t('budget.local.title')}
          </h3>
          <p className="text-xs text-pretty text-ink-2">
            {percent === null ? t('budget.local.empty') : t('budget.local.body', { local: format(localCents), total: format(totalCents) })}
          </p>
        </div>
        {percent !== null && <p className="font-mono text-2xl font-medium tabular-nums text-ink">{percent}%</p>}
      </div>
      <div
        role="meter"
        aria-labelledby="local-meter-title"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? 0}
        className="h-2 overflow-hidden rounded-full bg-sunk shadow-sunk"
      >
        <motion.div
          className="h-full origin-left rounded-full bg-accent"
          initial={false}
          animate={{ scaleX: (percent ?? 0) / 100 }}
          transition={reduce ? { duration: 0 } : spring.morph}
        />
      </div>
    </section>
  );
}
