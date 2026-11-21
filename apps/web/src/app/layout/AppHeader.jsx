import { useState } from 'react';
import { CircleUserRound } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { SettingsSheet } from './SettingsSheet.jsx';

// Cabecera de la app: marca a la izquierda; controles globales (selector de ciudad como children) y perfil a la derecha.
// El perfil abre los ajustes: no hay cuentas en el MVP (P2), así que no aparenta un usuario.
export function AppHeader({ children }) {
  const { t } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-10 bg-paper/95 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4">
        <h1 className="text-2xl font-black tracking-tight">{t('app.brand')}</h1>
        <div className="flex items-center gap-2">
          {children}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('settings.open')}
            className="grid size-11 place-items-center rounded-full bg-surface text-ink-2 ring-1 ring-line hover:text-ink"
          >
            <CircleUserRound aria-hidden="true" size={24} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
