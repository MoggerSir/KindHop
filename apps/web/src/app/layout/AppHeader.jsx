import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { press } from '@/shared/motion/motion.js';
import { useSession } from '@/features/auth';
import { usePlan } from '@/features/monetization';
import { useI18n } from '@/shared/i18n';
import { SettingsSheet } from './SettingsSheet.jsx';

// Membrete de la app: sello + marca en versalitas a la izquierda; ciudad (children) y perfil a la derecha.
// El botón de perfil muestra la foto de Google del usuario y abre los ajustes (idioma y cerrar sesión).
export function AppHeader({ children, city }) {
  const { t } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user } = useSession();
  const { plan } = usePlan();
  return (
    <header className="sticky top-0 z-10 min-w-0 contain-paint bg-paper/95 pt-[env(safe-area-inset-top)] border-b border-line backdrop-blur-md">
      <div className="mx-auto flex h-16 min-w-0 max-w-3xl items-center gap-3 px-4">
        <h1 className="shrink-0 text-2xl font-bold tracking-tight text-ink">
          {t('app.brand')}
        </h1>
        {/* El select nativo mide su mínimo por la opción más larga («Ciudad de México») y, sin poder
            encogerse, ensancha el documento: en 320 px las tarjetas de todas las pestañas se salen. */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <div className="min-w-0 max-w-[12.5rem]">{children}</div>
          <motion.button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('settings.open')}
            whileTap={press}
            className="relative size-11 shrink-0 overflow-hidden rounded-full border border-line-strong bg-surface shadow-embossed"
          >
            {/* Foto de Google del propio usuario; si no hay, icono genérico. */}
            <span className="absolute inset-0 grid place-items-center bg-surface text-ink-2">
              <UserRound aria-hidden="true" size={18} strokeWidth={1.5} />
            </span>
            {user?.pictureUrl && <img src={user.pictureUrl} alt="" width={44} height={44} decoding="async" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />}
          </motion.button>
          {plan.tier === 'PRO' && (
            <span aria-hidden="true" className="label pointer-events-none -ml-5 self-end rounded-control bg-accent px-1 !text-[0.5625rem] font-bold text-on-accent">
              {t('monetization.plan.badge')}
            </span>
          )}
        </div>
      </div>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} city={city} />
    </header>
  );
}
