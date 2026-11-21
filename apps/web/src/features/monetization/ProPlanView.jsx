import { useState } from 'react';
import { BadgePercent, Check, CreditCard, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { formatMoney } from '@/features/budget';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { usePlan } from './PlanContext.js';
import { PRO_MONTHLY_CENTS } from './pricing.js';

// KinHop Pro: sin anuncios un mes y cupones en negocios con convenio. Cobro con Stripe Checkout (pendiente: en la demo
// no se cobra; la cuenta demo ya es Pro simulada). Ver docs/02-modules/monetization.md.
export function ProPlanView() {
  const { t, locale } = useI18n();
  const { plan } = usePlan();
  const [tried, setTried] = useState(false);
  const pro = plan.tier === 'PRO';
  return (
    <div className="grid gap-4">
      <div className="grid gap-1 rounded-card border border-accent/60 bg-accent/10 p-4">
        <p className="text-sm text-ink-2">{t('monetization.pro.name')}</p>
        <p className="font-mono text-3xl font-medium tracking-tight tabular-nums text-ink">
          {formatMoney(PRO_MONTHLY_CENTS, locale)}
          <span className="font-sans text-sm text-ink-2">{t('monetization.pro.perMonth')}</span>
        </p>
      </div>
      <ul className="grid gap-2.5">
        {[
          [EyeOff, 'noAds'],
          [BadgePercent, 'coupons'],
          [Check, 'cancel'],
        ].map(([Icon, key]) => (
          <li key={key} className="flex items-start gap-3 text-sm text-ink">
            <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
            {t(`monetization.pro.benefits.${key}`)}
          </li>
        ))}
      </ul>
      {pro ? (
        <p role="status" className="flex flex-wrap items-center gap-2 rounded-control border border-line bg-sunk p-3 text-sm text-ink shadow-sunk">
          {plan.simulated && <DataStatusBadge status="DEMO" />}
          {t(plan.simulated ? 'monetization.pro.activeSimulated' : 'monetization.pro.active')}
        </p>
      ) : (
        <>
          <motion.button
            type="button"
            whileTap={press}
            onClick={() => setTried(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-solid transition-colors duration-150 hover:bg-accent-hover"
          >
            <CreditCard aria-hidden="true" size={16} strokeWidth={1.5} />
            {t('monetization.pro.subscribe')}
          </motion.button>
          {tried && <p role="status" className="text-sm text-pretty text-ink-2">{t('monetization.pro.checkoutPending')}</p>}
        </>
      )}
      <p className="text-xs text-pretty text-ink-3">{t('monetization.pro.stripeNote')}</p>
    </div>
  );
}
