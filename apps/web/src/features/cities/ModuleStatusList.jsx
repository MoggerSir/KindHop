import { CircleCheck, CircleDashed, CircleSlash, FlaskConical } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Muestra honestamente qué capas tiene cada ciudad, como filas separadas por filetes. Fuente: city.modules de /api/cities.
// Textos en cities.modules.* y cities.moduleStatus.* del JSON del idioma.
const MODULE_KEYS = ['transit', 'pois', 'districts', 'events', 'reports', 'budget'];
const STATUS = {
  IMPLEMENTED: { Icon: CircleCheck, className: 'text-success' },
  DEMO: { Icon: FlaskConical, className: 'text-ink' }, // funciona con datos simulados e identificados (ADR-0008)
  PLANNED: { Icon: CircleDashed, className: 'text-ink-3' },
  UNAVAILABLE: { Icon: CircleSlash, className: 'text-ink-3' },
};

export function ModuleStatusList({ modules }) {
  const { t } = useI18n();
  return (
    <ul className="grid sm:grid-cols-2 sm:gap-x-6">
      {MODULE_KEYS.map((key) => {
        const status = modules[key] in STATUS ? modules[key] : 'UNAVAILABLE';
        const { Icon, className } = STATUS[status];
        return (
          <li key={key} className="flex min-h-11 items-center gap-2.5 text-sm shadow-[inset_0_-1px_0_var(--color-line)]">
            <Icon aria-hidden="true" size={16} strokeWidth={1.5} className={`shrink-0 ${className}`} />
            <span>{t(`cities.modules.${key}`)}</span>
            <span className="label ml-auto text-ink-3">{t(`cities.moduleStatus.${status}`)}</span>
          </li>
        );
      })}
    </ul>
  );
}
