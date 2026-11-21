import { useState } from 'react';
import { AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { LanguageSwitcher, useI18n } from '@/shared/i18n';
import { fadeRise, photoSettle, press, stagger, tileReveal } from '@/shared/motion/motion.js';
import { GOOGLE_LOGIN_URL, devLogin } from './auth.api.js';
import { GoogleLogo } from './GoogleLogo.jsx';
import { useSession } from './SessionContext.js';

// Fotos de la portada: las de los eventos DEMO (créditos en docs/06-data/sources.md).
const COLLAGE = [
  { src: '/demo/events/concert.jpg', className: 'col-span-2 row-span-2' },
  { src: '/demo/events/ceramics.jpg', className: '' },
  { src: '/demo/events/food.jpg', className: '' },
];

// Pantalla de inicio de sesión. Es lo único que se renderiza sin sesión: el resto de pantallas ni se montan.
// Google: navegación completa a Express (/api/auth/google); el client secret nunca llega al navegador.
export function LoginScreen() {
  const { t } = useI18n();
  const { config, refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() => new URLSearchParams(window.location.search).get('auth_error'));

  // Quita ?auth_error de la URL tras leerlo (no queda en la barra ni en el historial).
  if (error && window.location.search.includes('auth_error')) {
    const url = new URL(window.location.href);
    url.searchParams.delete('auth_error');
    window.history.replaceState(null, '', url);
  }

  const startGoogle = () => {
    setBusy(true);
    window.location.assign(GOOGLE_LOGIN_URL);
  };
  const startDemo = async () => {
    setBusy(true);
    setError(null);
    try {
      await devLogin();
      await refresh();
    } catch {
      setError('failed');
      setBusy(false);
    }
  };
  const googleReady = config?.google === true;

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-paper">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="visible" aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 grid h-[52dvh] grid-cols-3 grid-rows-2 gap-2 p-2 opacity-80">
        {COLLAGE.map(({ src, className }) => (
          <motion.div key={src} variants={tileReveal} className={`overflow-hidden rounded-2xl ${className}`}>
            <motion.img {...photoSettle} src={src} alt="" className="size-full object-cover" />
          </motion.div>
        ))}
      </motion.div>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[56dvh] bg-gradient-to-b from-paper/10 via-paper/70 to-paper" />

      <div className="flex justify-end px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <LanguageSwitcher />
      </div>

      <motion.main
        variants={stagger(0.09, 0.25)}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-auto flex w-full max-w-md flex-col gap-5 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <motion.h1 variants={fadeRise} className="text-5xl font-bold tracking-tight text-ink">
          {t('app.brand')}
          <span className="text-accent">.</span>
        </motion.h1>
        <motion.p variants={fadeRise} className="text-lg leading-snug text-balance text-ink-2">
          {t('auth.tagline')}
        </motion.p>

        {error && (
          <motion.p variants={fadeRise} role="alert" className="flex items-start gap-2.5 rounded-2xl border border-danger/40 bg-danger/10 p-3 text-sm text-ink">
            <AlertCircle aria-hidden="true" size={18} strokeWidth={1.75} className="mt-px shrink-0 text-danger" />
            {t(error === 'cancelled' ? 'auth.errorCancelled' : 'auth.errorFailed')}
          </motion.p>
        )}

        <motion.div variants={fadeRise} className="grid gap-3">
          <motion.button
            type="button"
            onClick={startGoogle}
            disabled={!googleReady || busy}
            aria-busy={busy}
            whileTap={googleReady && !busy ? press : undefined}
            className="flex min-h-13 items-center justify-center gap-3 rounded-full bg-white px-6 text-base font-semibold text-black shadow-solid transition-[opacity,box-shadow] duration-150 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleLogo size={20} />
            {t('auth.google')}
          </motion.button>
          {!googleReady && config && <p className="text-center text-xs text-ink-3">{t('auth.googleUnavailable')}</p>}
          {config?.devLogin && (
            <motion.button
              type="button"
              onClick={startDemo}
              disabled={busy}
              whileTap={busy ? undefined : press}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium text-ink-2 transition-colors duration-150 hover:border-accent hover:text-ink disabled:opacity-50"
            >
              <Sparkles aria-hidden="true" size={16} strokeWidth={1.75} className="text-accent" />
              {t('auth.demo')}
            </motion.button>
          )}
        </motion.div>

        <motion.p variants={fadeRise} className="flex items-start gap-2 text-xs leading-relaxed text-ink-3">
          <ShieldCheck aria-hidden="true" size={16} strokeWidth={1.75} className="mt-px shrink-0 text-success" />
          {t('auth.privacy')}
        </motion.p>
      </motion.main>
    </div>
  );
}
