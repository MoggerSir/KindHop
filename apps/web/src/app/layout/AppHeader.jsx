import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { press } from '@/shared/motion/motion.js';
import { useI18n } from '@/shared/i18n';
import { SettingsSheet } from './SettingsSheet.jsx';

// Membrete de la app: sello + marca en versalitas a la izquierda; ciudad (children) y perfil a la derecha.
// El perfil abre los ajustes: no hay cuentas en el MVP (P2), así que no aparenta un usuario.
export function AppHeader({ children }) {
  const { t } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-10 bg-paper/90 pt-[env(safe-area-inset-top)] shadow-[0_1px_0_var(--color-line)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl short:h-14 items-center justify-between gap-3 px-4">
        <h1 className="flex shrink-0 items-center gap-2 text-[0.75rem] font-semibold tracking-[0.18em] uppercase [font-stretch:125%]">
          {/* Sello: cuadrado de tinta con filete interior, como un monograma impreso. */}
          <span aria-hidden="true" className="size-3.5 bg-ink shadow-[inset_0_0_0_3px_var(--color-paper),inset_0_0_0_4px_var(--color-ink)]" />
          {t('app.brand')}
        </h1>
        <div className="flex items-center gap-2">
          {children}
          <motion.button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('settings.open')}
            whileTap={press}
            className="grid size-11 place-items-center rounded-control border border-transparent bg-surface text-ink shadow-embossed transition-shadow duration-150 active:shadow-sunk"
          >
            <UserRound aria-hidden="true" size={18} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
