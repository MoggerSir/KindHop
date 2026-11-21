import { useState } from 'react';
import { CategoryGrid } from '@/features/discovery';
import { EventsSection, WeekStrip, dayKey } from '@/features/events';
import { useI18n } from '@/shared/i18n';

// Pestaña Inicio: lema, tira de 7 días, eventos desde el día elegido y accesos a Explorar por categoría.
export function HomeScreen({ city, onExplore }) {
  const { t } = useI18n();
  const [day, setDay] = useState(() => dayKey(new Date(), city.timezone));

  return (
    <div className="grid gap-[clamp(0.5rem,2dvh,1rem)]">
      <p className="-mt-1 text-sm text-ink-2">{t('home.tagline')}</p>
      <WeekStrip timeZone={city.timezone} value={day} onChange={setDay} />
      <EventsSection key={city.id} city={city} dayKey={day} />
      <CategoryGrid onSelect={onExplore} />
    </div>
  );
}
