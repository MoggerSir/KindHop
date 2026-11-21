import { useState } from 'react';
import { CalendarX2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeRise } from '@/shared/motion/motion.js';
import { eventsFromDay } from './dates.js';
import { EventCard } from './EventCard.jsx';
import { EventDetailSheet } from './EventDetailSheet.jsx';
import { useEvents } from './useEvents.js';

// Eventos que aún no terminan desde el día dado, en lista de tarjetas en fila, filtrados por categoría y búsqueda.
// Nunca se muestran eventos terminados. Si el filtro deja la lista vacía, el vacío lo dice (no "no hay eventos").
// Movimiento: las tarjetas que entran suben y las que salen se desvanecen (AnimatePresence mode="popLayout").
export function EventsSection({ city, dayKey, category = null, searchQuery = '' }) {
  const { t } = useI18n();
  const { status, events, error, reload } = useEvents(city);
  const [openEvent, setOpenEvent] = useState(null);

  if (status === 'loading') return <LoadingState>{t('events.loading')}</LoadingState>;
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (events.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyCity', { city: city.name })}</EmptyState>;

  // Filtrado por categoría y búsqueda
  const upcoming = eventsFromDay(events, dayKey, city.timezone);
  if (upcoming.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyDay')}</EmptyState>;
  let filtered = upcoming;
  if (category && category !== 'more') {
    filtered = filtered.filter((e) => e.category === category || e.tags?.includes(category));
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyFilter')}</EmptyState>;

  return (
    <section aria-labelledby="events-title" className="grid gap-3 [&>*]:min-w-0">
      <div className="flex items-center justify-between pt-1">
        <h2 id="events-title" className="text-xs font-medium text-ink-3">
          {t('home.recommended')}
        </h2>
      </div>

      <ul className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((event) => (
            <motion.li key={event.id} layout variants={fadeRise} initial="hidden" animate="visible" exit="exit">
              <EventCard event={event} timeZone={city.timezone} onOpen={setOpenEvent} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <EventDetailSheet event={openEvent} timeZone={city.timezone} onClose={() => setOpenEvent(null)} />
    </section>
  );
}
