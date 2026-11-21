import { ArrowLeft, ChevronRight, Lock, MapPin, TicketPercent } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { useResource } from '@/shared/hooks/useResource.js';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, press, stageItem, stagger } from '@/shared/motion/motion.js';
import { fetchCoupons } from './monetization.api.js';
import { usePlan } from './PlanContext.js';
import { QrCode } from './QrCode.jsx';

// Cupones de KinHop Pro: lista de la ciudad activa y, al tocar uno, su QR y en qué locales se usa.
// Sin Pro: aviso bloqueado (la API también responde 403; el front no decide el acceso).
export function CouponsView({ city, selected, onSelect, onUpgrade }) {
  const { plan } = usePlan();
  if (plan.tier !== 'PRO') return <LockedCoupons onUpgrade={onUpgrade} />;
  return <CouponsList city={city} selected={selected} onSelect={onSelect} />;
}

function LockedCoupons({ onUpgrade }) {
  const { t } = useI18n();
  return (
    <div className="grid justify-items-start gap-3 rounded-card border border-line bg-sunk p-4 shadow-sunk">
      <Lock aria-hidden="true" size={20} strokeWidth={1.5} className="text-accent" />
      <p className="text-sm text-pretty text-ink">{t('monetization.coupons.locked')}</p>
      <motion.button type="button" whileTap={press} onClick={onUpgrade} className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-on-accent shadow-solid hover:bg-accent-hover">
        {t('monetization.plan.seePro')}
      </motion.button>
    </div>
  );
}

function CouponsList({ city, selected, onSelect }) {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const { status, data, error, reload } = useResource(fetchCoupons, { cityId: city.id, lang: locale });
  if (status === 'loading') return <LoadingState>{t('monetization.coupons.loading')}</LoadingState>;
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  const coupons = data.coupons;
  const current = coupons.find((c) => c.id === selected);
  if (current) return <CouponDetail coupon={current} onBack={() => onSelect(null)} />;
  if (coupons.length === 0) return <p className="text-sm text-ink-2">{t('monetization.coupons.empty', { city: city.name })}</p>;

  return (
    <div className="grid gap-3">
      <p className="flex flex-wrap items-center gap-2 text-xs text-pretty text-ink-2">
        <DataStatusBadge status="DEMO" />
        {t('monetization.coupons.demoNotice')}
      </p>
      <motion.ul variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-2">
        {coupons.map((c) => (
          <motion.li key={c.id} variants={reduce ? fadeOnly : stageItem}>
            <motion.button
              type="button"
              whileTap={press}
              onClick={() => onSelect(c.id)}
              className="flex min-h-16 w-full items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 text-left transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
                <TicketPercent aria-hidden="true" size={18} strokeWidth={1.5} />
              </span>
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="text-sm font-semibold text-ink">{c.discount}</span>
                <span className="truncate text-xs text-ink-2">
                  {t('monetization.coupons.at', { business: c.business, count: c.locations.length })}
                </span>
              </span>
              <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-ink-3" />
            </motion.button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

function CouponDetail({ coupon, onBack }) {
  const { t, locale } = useI18n();
  const { plan } = usePlan();
  const valid = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${coupon.validUntil}T12:00:00Z`));
  // QR genérico de la demo: código del cupón + marca DEMO. En producción llevaría un token firmado de un solo uso.
  const qrValue = `KINHOP|${plan.simulated ? 'DEMO' : 'PRO'}|${coupon.code}`;
  return (
    <div className="grid gap-4">
      <motion.button type="button" whileTap={press} onClick={onBack} className="inline-flex min-h-11 items-center gap-1.5 justify-self-start rounded-full px-2 text-sm font-medium text-ink-2 hover:bg-tint hover:text-ink">
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
        {t('monetization.coupons.back')}
      </motion.button>
      <div className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <DataStatusBadge status={coupon.dataStatus} />
          <span className="text-xs text-ink-2">{coupon.business}</span>
        </div>
        <h3 className="text-xl leading-tight font-semibold text-balance text-ink">{coupon.discount}</h3>
        <p className="text-sm text-ink-2">{coupon.conditions}</p>
      </div>
      <div className="grid justify-items-center gap-2 rounded-card border border-line bg-surface p-4 shadow-raised">
        <QrCode value={qrValue} label={t('monetization.coupons.qrLabel', { code: coupon.code })} />
        <p className="font-mono text-sm tracking-wider text-ink">{coupon.code}</p>
        <p className="text-center text-xs text-pretty text-ink-2">{t('monetization.coupons.showAtCounter', { date: valid })}</p>
      </div>
      <section aria-labelledby={`where-${coupon.id}`} className="grid gap-2">
        <h4 id={`where-${coupon.id}`} className="text-sm font-semibold text-ink">{t('monetization.coupons.where')}</h4>
        <ul className="grid gap-2">
          {coupon.locations.map((l) => (
            <li key={l.name} className="flex items-start gap-3 rounded-control border border-line bg-paper/60 p-3">
              <MapPin aria-hidden="true" size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium text-ink">{l.name}</span>
                <span className="text-xs text-ink-2">{l.zone}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-xs text-pretty text-ink-3">{t('monetization.coupons.demoNotice')}</p>
    </div>
  );
}
