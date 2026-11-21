import { ChevronDown, MapPin } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Selector de ciudad del membrete: <select> nativo (teclado, lector de pantalla y rueda nativa del móvil)
// vestido como campo hundido (la ciudad en semiexpandida: en versalitas "Ciudad de México" no cabe a 390 px).
export function CityPicker({ cities, value, onChange }) {
  const { t } = useI18n();
  return (
    <div className="relative inline-flex items-center text-ink">
      <MapPin aria-hidden="true" size={15} strokeWidth={2} className="pointer-events-none absolute left-3 text-accent" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('cities.pickerLabel')}
        className="title min-h-11 max-w-[12.5rem] cursor-pointer appearance-none truncate rounded-full border border-line bg-surface/90 pr-7 pl-7.5 text-[0.8125rem] font-medium shadow-embossed transition-colors duration-150 hover:border-line-strong hover:bg-surface"
      >
        {cities.map((city) => (
          <option key={city.id} value={city.id} className="bg-surface text-ink">
            {city.name}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" size={14} strokeWidth={2} className="pointer-events-none absolute right-2.5 text-accent" />
    </div>
  );
}
