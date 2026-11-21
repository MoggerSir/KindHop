import { ChevronDown, MapPin } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Selector de ciudad compacto para la cabecera: <select> nativo (teclado, lector de pantalla y rueda nativa del móvil)
// vestido como píldora con pin y flecha.
export function CityPicker({ cities, value, onChange }) {
  const { t } = useI18n();
  return (
    <div className="relative inline-flex items-center text-accent">
      <MapPin aria-hidden="true" size={18} strokeWidth={2.25} className="pointer-events-none absolute left-3" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('cities.pickerLabel')}
        className="min-h-11 max-w-[13rem] cursor-pointer appearance-none truncate rounded-full bg-accent/10 pr-8 pl-9 text-sm font-bold hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {cities.map((city) => (
          <option key={city.id} value={city.id} className="text-ink">
            {city.name}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" size={16} strokeWidth={2.5} className="pointer-events-none absolute right-3" />
    </div>
  );
}
