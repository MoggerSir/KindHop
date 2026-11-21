import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { press } from '@/shared/motion/motion.js';
import { useSession } from '@/features/auth';
import { useI18n } from '@/shared/i18n';
import { SettingsSheet } from './SettingsSheet.jsx';

// Membrete de la app: sello + marca en versalitas a la izquierda; ciudad (children) y perfil a la derecha.
// El botón de perfil muestra la foto de Google del usuario y abre los ajustes (idioma y cerrar sesión).
export function AppHeader({ children }) {
  const { t } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user } = useSession();
  return (
    <header className="sticky top-0 z-10 bg-paper/95 pt-[env(safe-area-inset-top)] border-b border-line backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t('app.brand')}
        </h1>
        <div className="flex items-center gap-3">
          {children}
          <motion.button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('settings.open')}
            whileTap={press}
            className="relative size-11 overflow-hidden rounded-full border border-line-strong bg-surface shadow-embossed "
          >
            {/* Foto de Google del propio usuario; si no hay, icono genérico. */}
            <span className="absolute inset-0 grid place-items-center bg-surface text-ink-2">
              <UserRound aria-hidden="true" size={18} strokeWidth={1.5} />
            </span>
            {user?.pictureUrl && <img src={user.pictureUrl} alt="" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />}
          </motion.button>
        </div>
      </div>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
