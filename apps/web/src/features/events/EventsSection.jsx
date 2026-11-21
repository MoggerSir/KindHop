import { useState } from 'react';
import { CalendarX2, ChevronDown } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { useI18n } from '@/shared/i18n';
import { eventsFromDay } from './dates.js';
import { EventCard } from './EventCard.jsx';
import { EventDetailSheet } from './EventDetailSheet.jsx';
import { useEvents } from './useEvents.js';

const VISIBLE_COMPACT = 2;

// Eventos desde el día elegido: uno destacado + rejilla de dos; "Ver más" despliega el resto. Incluye el detalle.
export function EventsSection({ city, dayKey }) {
  const { t } = useI18n();
  const { status, events, error, reload } = useEvents(city);
  const [expanded, setExpanded] = useState(false);
  const [openEvent, setOpenEvent] = useState(null);

  if (status === 'loading') return <LoadingState>{t('events.loading')}</LoadingState>;
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (events.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyCity', { city: city.name })}</EmptyState>;

  const [featured, ...rest] = eventsFromDay(events, dayKey, city.timezone);
  if (!featured) return <EmptyState icon={CalendarX2}>{t('events.emptyDay')}</EmptyState>;
  const shown = expanded ? rest : rest.slice(0, VISIBLE_COMPACT);

  return (
    <section aria-labelledby="events-title" className="grid gap-3">
      <h2 id="events-title" className="sr-only">
        {t('home.eventsTitle')}
      </h2>
      <EventCard event={featured} timeZone={city.timezone} variant="featured" onOpen={setOpenEvent} />
      {shown.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {shown.map((event) => (
            <li key={event.id}>
              <EventCard event={event} timeZone={city.timezone} onOpen={setOpenEvent} />
            </li>
          ))}
        </ul>
      )}
      {rest.length > VISIBLE_COMPACT && (
        <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="-my-1.5 mx-auto inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink-2 hover:bg-surface">
          {t(expanded ? 'events.seeLess' : 'events.seeMore')}
          <ChevronDown aria-hidden="true" size={18} strokeWidth={2} className={`motion-safe:transition-[rotate] motion-safe:duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
      <EventDetailSheet event={openEvent} timeZone={city.timezone} onClose={() => setOpenEvent(null)} />
    </section>
  );
}
