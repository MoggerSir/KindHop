import { Sheet } from '@/shared/components/Sheet.jsx';
import { LanguageSwitcher, useI18n } from '@/shared/i18n';

// Ajustes de la app. Hoy solo idioma; aquí irán más preferencias (sin cuenta de usuario en el MVP).
export function SettingsSheet({ open, onClose }) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onClose={onClose} title={t('settings.title')}>
      <div className="flex items-center justify-between gap-4 py-2">
        <span className="font-medium">{t('language.label')}</span>
        <LanguageSwitcher />
      </div>
    </Sheet>
  );
}
