import { useId, useState } from 'react';
import { ArrowLeft, ChevronRight, LogOut, Store, TicketPercent } from 'lucide-react';
import { motion } from 'motion/react';
import { useSession } from '@/features/auth';
import { BusinessView, CouponsView, PlanCard, ProPlanView, usePlan } from '@/features/monetization';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { LanguageSwitcher, useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';

// Cuenta (menú del avatar): plan Pro, cupones, negocios y organizadores, idioma y cerrar sesión.
// Las vistas viven dentro de la misma hoja; "Volver" regresa al menú. Al cerrar, la hoja vuelve al menú.
export function SettingsSheet({ open, onClose, city }) {
  const { t } = useI18n();
  const [view, setView] = useState('menu');
  const [coupon, setCoupon] = useState(null);
  const close = () => {
    onClose();
    setView('menu');
    setCoupon(null);
  };
  const title = view === 'menu' ? t('settings.title') : t(`monetization.views.${view}`);
  return (
    <Sheet open={open} onClose={close} title={title}>
      {view === 'menu' ? (
        <AccountMenu onNavigate={setView} onClose={close} />
      ) : (
        <div className="grid gap-4">
          {!(view === 'coupons' && coupon) && (
            <motion.button type="button" whileTap={press} onClick={() => setView('menu')} className="inline-flex min-h-11 items-center gap-1.5 justify-self-start rounded-full px-2 text-sm font-medium text-ink-2 hover:bg-tint hover:text-ink">
              <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
              {t('monetization.views.back')}
            </motion.button>
          )}
          {view === 'pro' && <ProPlanView />}
          {view === 'coupons' && city && <CouponsView city={city} selected={coupon} onSelect={setCoupon} onUpgrade={() => setView('pro')} />}
          {view === 'business' && <BusinessView />}
        </div>
      )}
    </Sheet>
  );
}

function MenuRow({ Icon, label, hint, onClick }) {
  return (
    <motion.button type="button" whileTap={press} onClick={onClick} className="flex min-h-14 w-full items-center gap-3 rounded-card border border-line bg-surface px-4 py-2.5 text-left transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover">
      <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="shrink-0 text-accent" />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <span className="text-xs text-ink-2">{hint}</span>}
      </span>
      <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-ink-3" />
    </motion.button>
  );
}

function AccountMenu({ onNavigate, onClose }) {
  const { t } = useI18n();
  const id = useId();
  const { user, signOut } = useSession();
  const { plan, previewFree, setPreviewFree } = usePlan();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  return (
      <div className="grid gap-4">
        {user && (
          <div className="flex items-center gap-3 py-1">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-sunk">
              {user.pictureUrl && <img src={user.pictureUrl} alt="" width={44} height={44} decoding="async" referrerPolicy="no-referrer" className="size-full object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{user.name ?? user.email}</p>
              <p className="truncate text-sm text-ink-2">{user.email}</p>
            </div>
          </div>
        )}
        <PlanCard onOpen={() => onNavigate('pro')} />
        <MenuRow Icon={TicketPercent} label={t('monetization.views.coupons')} hint={t(plan.tier === 'PRO' ? 'monetization.menu.couponsHint' : 'monetization.menu.couponsLocked')} onClick={() => onNavigate('coupons')} />
        <MenuRow Icon={Store} label={t('monetization.views.business')} hint={t('monetization.menu.businessHint')} onClick={() => onNavigate('business')} />
        {plan.simulated && (
          <div className="flex items-start gap-3 rounded-card border border-line bg-sunk px-4 py-3 shadow-sunk">
            <input id={`${id}-preview`} type="checkbox" checked={previewFree} onChange={(e) => setPreviewFree(e.target.checked)} className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-accent)]" />
            <label htmlFor={`${id}-preview`} className="grid cursor-pointer gap-0.5">
              <span className="text-sm font-medium text-ink">{t('monetization.menu.previewFree')}</span>
              <span className="text-xs text-ink-2">{t('monetization.menu.previewFreeHint')}</span>
            </label>
          </div>
        )}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 py-1">
          <span className="min-w-0 font-medium">{t('language.label')}</span>
          <LanguageSwitcher />
        </div>
        <motion.button
          type="button"
          disabled={signingOut}
          aria-busy={signingOut}
          onClick={async () => {
            setSigningOut(true);
            setLogoutError(false);
            try {
              await signOut();
              onClose();
            } catch {
              setLogoutError(true);
            } finally {
              setSigningOut(false);
            }
          }}
          whileTap={signingOut ? undefined : press}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-strong text-sm font-semibold text-ink transition-colors duration-150 hover:border-danger hover:text-danger"
        >
          <LogOut aria-hidden="true" size={16} strokeWidth={1.5} />
          {t(signingOut ? 'auth.signingOut' : 'auth.signOut')}
        </motion.button>
        {logoutError && <p role="alert" className="text-sm text-danger">{t('auth.logoutFailed')}</p>}
      </div>
  );
}
