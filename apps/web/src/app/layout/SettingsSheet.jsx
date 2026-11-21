import { LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useSession } from '@/features/auth';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { LanguageSwitcher, useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';

// Ajustes: cuenta (Google), idioma y cerrar sesión.
export function SettingsSheet({ open, onClose }) {
  const { t } = useI18n();
  const { user, signOut } = useSession();
  return (
    <Sheet open={open} onClose={onClose} title={t('settings.title')}>
      <div className="grid gap-4">
        {user && (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-paper/60 p-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-sunk">
              {user.pictureUrl && <img src={user.pictureUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{user.name ?? user.email}</p>
              <p className="truncate text-sm text-ink-2">{user.email}</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 py-1">
          <span className="font-medium">{t('language.label')}</span>
          <LanguageSwitcher />
        </div>
        <motion.button
          type="button"
          onClick={() => {
            onClose();
            signOut();
          }}
          whileTap={press}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-strong text-sm font-semibold text-ink transition-colors duration-150 hover:border-danger hover:text-danger"
        >
          <LogOut aria-hidden="true" size={16} strokeWidth={1.75} />
          {t('auth.signOut')}
        </motion.button>
      </div>
    </Sheet>
  );
}
