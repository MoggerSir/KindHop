import { CircleCheck, CircleDashed, CircleSlash } from 'lucide-react';

// Muestra honestamente qué capas tiene cada ciudad. Fuente: city.modules de /api/cities.
const LABELS = { transit: 'Transporte', pois: 'Lugares', districts: 'Zonas', events: 'Eventos', reports: 'Incidencias', budget: 'Presupuesto' };
const STATUS = {
  IMPLEMENTED: { Icon: CircleCheck, text: 'Disponible', className: 'text-status-real' },
  PLANNED: { Icon: CircleDashed, text: 'En construcción', className: 'text-ink-2' },
  UNAVAILABLE: { Icon: CircleSlash, text: 'Sin datos', className: 'text-status-unverified' },
};

export function ModuleStatusList({ modules }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(LABELS).map(([key, label]) => {
        const { Icon, text, className } = STATUS[modules[key]] ?? STATUS.UNAVAILABLE;
        return (
          <li key={key} className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-sm">
            <Icon aria-hidden="true" size={16} strokeWidth={1.75} className={`shrink-0 ${className}`} />
            <span className="font-medium">{label}</span>
            <span className="ml-auto text-xs text-ink-2">{text}</span>
          </li>
        );
      })}
    </ul>
  );
}
