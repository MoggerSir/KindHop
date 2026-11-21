import { CircleCheck, CircleDashed, CircleSlash } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Muestra honestamente qué capas tiene cada ciudad. Fuente: city.modules de /api/cities.
// Textos en cities.modules.* y cities.moduleStatus.* del JSON del idioma.
const MODULE_KEYS = ['transit', 'pois', 'districts', 'events', 'reports', 'budget'];
const STATUS = {
  IMPLEMENTED: { Icon: CircleCheck, className: 'text-status-real' },
  PLANNED: { Icon: CircleDashed, className: 'text-ink-2' },
  UNAVAILABLE: { Icon: CircleSlash, className: 'text-status-unverified' },
};

export function ModuleStatusList({ modules }) {
  const { t } = useI18n();
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {MODULE_KEYS.map((key) => {
        const status = modules[key] in STATUS ? modules[key] : 'UNAVAILABLE';
        const { Icon, className } = STATUS[status];
        return (
          <li key={key} className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-sm">
            <Icon aria-hidden="true" size={16} strokeWidth={1.75} className={`shrink-0 ${className}`} />
            <span className="font-medium">{t(`cities.modules.${key}`)}</span>
            <span className="ml-auto text-xs text-ink-2">{t(`cities.moduleStatus.${status}`)}</span>
          </li>
        );
      })}
    </ul>
  );
}
