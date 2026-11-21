import { useId, useState } from 'react';
import { CalendarPlus, Check, Megaphone, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { formatMoney } from '@/features/budget';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { BUSINESS_BOOST_MONTHLY_CENTS, CUSTOM_AD_MONTHLY_CENTS, EVENT_SLOT_CENTS } from './pricing.js';
import { SponsorBadge } from './SponsorBadge.jsx';

// Para negocios y organizadores (KH-021): publicar un evento (gratis o en un puesto pagado 1-3), destacar un negocio
// local y contratar un anuncio personalizado. Todo simulado en la demo: no se guarda ni se cobra (Stripe pendiente).
export function BusinessView() {
  const { t, locale } = useI18n();
  const money = (cents) => formatMoney(cents, locale);
  return (
    <div className="grid gap-4">
      <p className="flex flex-wrap items-center gap-2 text-xs text-pretty text-ink-2">
        <DataStatusBadge status="DEMO" />
        {t('monetization.business.demoNotice')}
      </p>
      <PublishEventForm money={money} />
      <Offer Icon={Store} title={t('monetization.business.boost.title')} body={t('monetization.business.boost.body')} price={t('monetization.business.perMonth', { price: money(BUSINESS_BOOST_MONTHLY_CENTS) })} />
      <Offer Icon={Megaphone} title={t('monetization.business.customAd.title')} body={t('monetization.business.customAd.body')} price={t('monetization.business.fromPerMonth', { price: money(CUSTOM_AD_MONTHLY_CENTS) })} />
      <p className="text-xs text-pretty text-ink-3">{t('monetization.business.honesty')}</p>
    </div>
  );
}

function Offer({ Icon, title, body, price }) {
  const { t } = useI18n();
  const [asked, setAsked] = useState(false);
  return (
    <section className="grid gap-3 rounded-card border border-line bg-surface p-4 shadow-raised">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
          <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
        </span>
        <div className="grid min-w-0 gap-1">
          <h4 className="text-sm font-semibold text-ink">{title}</h4>
          <p className="text-xs text-pretty text-ink-2">{body}</p>
          <p className="font-mono text-sm tabular-nums text-ink">{price}</p>
        </div>
      </div>
      {asked ? (
        <p role="status" className="flex items-center gap-2 text-sm text-ink">
          <Check aria-hidden="true" size={16} strokeWidth={1.5} className="text-accent" />
          {t('monetization.business.requested')}
        </p>
      ) : (
        <motion.button type="button" whileTap={press} onClick={() => setAsked(true)} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink hover:border-line-strong hover:bg-surface-hover">
          {t('monetization.business.request')}
        </motion.button>
      )}
    </section>
  );
}

function PublishEventForm({ money }) {
  const { t } = useI18n();
  const id = useId();
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [venue, setVenue] = useState('');
  const [slot, setSlot] = useState('free');
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(null);
  const options = [['free', t('monetization.business.event.free')], ...[1, 2, 3].map((n) => [String(n), t('monetization.business.event.slot', { rank: n, price: money(EVENT_SLOT_CENTS[n]) })])];

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !day) {
      setError(true);
      return;
    }
    setError(false);
    setSent(slot);
  };

  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-3 rounded-card border border-line bg-surface p-4 shadow-raised">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
          <CalendarPlus aria-hidden="true" size={18} strokeWidth={1.5} />
        </span>
        <div className="grid gap-1">
          <h4 id={`${id}-title`} className="text-sm font-semibold text-ink">{t('monetization.business.event.title')}</h4>
          <p className="text-xs text-pretty text-ink-2">{t('monetization.business.event.body')}</p>
        </div>
      </div>
      {sent ? (
        <div role="status" className="grid gap-2 rounded-control border border-line bg-sunk p-3 text-sm text-ink shadow-sunk">
          <span className="flex flex-wrap items-center gap-2">
            <Check aria-hidden="true" size={16} strokeWidth={1.5} className="text-accent" />
            {sent === 'free' ? t('monetization.business.event.sentFree') : <SponsorBadge rank={Number(sent)} />}
          </span>
          <span className="text-xs text-pretty text-ink-2">{t('monetization.business.event.sentNote')}</span>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-3">
          <div className="grid gap-1.5">
            <label htmlFor={`${id}-name`} className="text-sm font-medium text-ink">{t('monetization.business.event.name')}</label>
            <input id={`${id}-name`} value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} className="min-h-12 rounded-card border border-line bg-sunk px-4 text-sm text-ink shadow-sunk focus:border-accent focus:outline-none" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor={`${id}-day`} className="text-sm font-medium text-ink">{t('monetization.business.event.date')}</label>
              <input id={`${id}-day`} type="date" value={day} onChange={(e) => setDay(e.target.value)} className="min-h-12 rounded-card border border-line bg-sunk px-4 font-mono text-sm text-ink shadow-sunk focus:border-accent focus:outline-none" />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor={`${id}-venue`} className="text-sm font-medium text-ink">{t('monetization.business.event.venue')}</label>
              <input id={`${id}-venue`} value={venue} maxLength={80} onChange={(e) => setVenue(e.target.value)} className="min-h-12 rounded-card border border-line bg-sunk px-4 text-sm text-ink shadow-sunk focus:border-accent focus:outline-none" />
            </div>
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">{t('monetization.business.event.visibility')}</legend>
            {options.map(([value, text]) => (
              <div key={value} className="flex min-h-11 items-center gap-3 rounded-control border border-line bg-paper/60 px-3">
                <input id={`${id}-slot-${value}`} type="radio" name={`${id}-slot`} value={value} checked={slot === value} onChange={() => setSlot(value)} className="size-4 accent-[var(--color-accent)]" />
                <label htmlFor={`${id}-slot-${value}`} className="flex-1 cursor-pointer py-2 text-sm text-ink">{text}</label>
              </div>
            ))}
          </fieldset>
          {error && <p role="alert" className="text-sm text-danger">{t('monetization.business.event.error')}</p>}
          <motion.button type="submit" whileTap={press} className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-solid hover:bg-accent-hover">
            {t(slot === 'free' ? 'monetization.business.event.submitFree' : 'monetization.business.event.submitPaid')}
          </motion.button>
        </form>
      )}
    </section>
  );
}
