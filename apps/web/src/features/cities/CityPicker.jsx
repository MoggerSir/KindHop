import { ChevronDown, MapPin } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Selector de ciudad del membrete: <select> nativo (teclado, lector de pantalla y rueda nativa del móvil)
// vestido como campo hundido (la ciudad en semiexpandida: en versalitas "Ciudad de México" no cabe a 390 px).
export function CityPicker({ cities, value, onChange }) {
  const { t } = useI18n();
  return (
    <div className="relative inline-flex items-center text-ink">
      <MapPin aria-hidden="true" size={15} strokeWidth={1.5} className="pointer-events-none absolute left-3 text-ink-2" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('cities.pickerLabel')}
        className="title min-h-11 max-w-[12.5rem] cursor-pointer appearance-none truncate rounded-control border border-transparent bg-sunk pr-8 pl-8 text-[0.8125rem] font-medium shadow-sunk"
      >
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" size={14} strokeWidth={1.5} className="pointer-events-none absolute right-3 text-ink-2" />
    </div>
  );
}
