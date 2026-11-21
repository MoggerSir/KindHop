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

// Eventos desde el día elegido: uno destacado + rejilla de dos; "Ver más eventos" expande el resto. Incluye el detalle.
// Movimiento: al cambiar de día el destacado y la rejilla se intercambian (sube el nuevo, sale el viejo);
// "Ver más" abre un panel que crece con resorte, deja entrar sus tarjetas en cascada y baja la página para mostrarlo;
// al cerrar se hunden en reversa y el panel se pliega.
export function EventsSection({ city, dayKey, category = null, searchQuery = '' }) {
  const { t } = useI18n();
  const { status, events, error, reload } = useEvents(city);
  const [openEvent, setOpenEvent] = useState(null);

  if (status === 'loading') return <LoadingState>{t('events.loading')}</LoadingState>;
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (events.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyCity', { city: city.name })}</EmptyState>;

  // Filtrado por categoría y búsqueda
  let filtered = eventsFromDay(events, dayKey, city.timezone);
  if (filtered.length === 0) filtered = events; // Si el filtro de día no da resultados, muestra los eventos activos
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

  if (filtered.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyDay')}</EmptyState>;

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
