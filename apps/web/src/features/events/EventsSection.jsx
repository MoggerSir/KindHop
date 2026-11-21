import { useState } from 'react';
import { CalendarX2, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { useI18n } from '@/shared/i18n';
import { cascadeItem, expand, fadeOnly, fadeRise, spring } from '@/shared/motion/motion.js';
import { useRevealScroll } from '@/shared/motion/useRevealScroll.js';
import { eventsFromDay } from './dates.js';
import { EventCard } from './EventCard.jsx';
import { EventDetailSheet } from './EventDetailSheet.jsx';
import { useEvents } from './useEvents.js';

const VISIBLE_COMPACT = 2;

// Eventos desde el día elegido: uno destacado + rejilla de dos; "Ver más eventos" expande el resto. Incluye el detalle.
// Movimiento: al cambiar de día el destacado y la rejilla se intercambian (sube el nuevo, sale el viejo);
// "Ver más" abre un panel que crece con resorte, deja entrar sus tarjetas en cascada y baja la página para mostrarlo;
// al cerrar se hunden en reversa y el panel se pliega.
export function EventsSection({ city, dayKey }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const { status, events, error, reload } = useEvents(city);
  const [expanded, setExpanded] = useState(false);
  const [openEvent, setOpenEvent] = useState(null);
  const revealScroll = useRevealScroll();

  if (status === 'loading') return <LoadingState>{t('events.loading')}</LoadingState>;
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (events.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyCity', { city: city.name })}</EmptyState>;

  const [featured, ...rest] = eventsFromDay(events, dayKey, city.timezone);
  if (!featured) return <EmptyState icon={CalendarX2}>{t('events.emptyDay')}</EmptyState>;
  const visible = rest.slice(0, VISIBLE_COMPACT);
  const extra = rest.slice(VISIBLE_COMPACT);

  return (
    <section aria-labelledby="events-title" className="grid gap-3">
      <h2 id="events-title" className="sr-only">
        {t('home.eventsTitle')}
      </h2>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={featured.id} variants={fadeRise} initial="hidden" animate="visible" exit="exit">
          <EventCard event={featured} timeZone={city.timezone} variant="featured" onOpen={setOpenEvent} />
        </motion.div>
      </AnimatePresence>

      {visible.length > 0 && (
        <motion.ul layout transition={spring.layout} className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((event) => (
              <motion.li key={event.id} layout variants={fadeRise} initial="hidden" animate="visible" exit="exit">
                <EventCard event={event} timeZone={city.timezone} onOpen={setOpenEvent} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <AnimatePresence initial={false}>
        {expanded && extra.length > 0 && (
          <motion.div
            {...revealScroll}
            key="extra"
            variants={reduce ? fadeOnly : expand}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="-m-2 overflow-hidden p-2"
          >
            <ul className="grid grid-cols-2 gap-3">
              {extra.map((event) => (
                <motion.li key={event.id} variants={cascadeItem}>
                  <EventCard event={event} timeZone={city.timezone} onOpen={setOpenEvent} />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {extra.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="label -my-1.5 mx-auto short:-my-3 inline-flex min-h-11 items-center gap-2 px-3 text-ink-2 transition-[color,box-shadow] duration-150 hover:text-ink hover:shadow-[inset_0_-1px_0_currentColor]"
        >
          {t(expanded ? 'events.seeLess' : 'events.seeMore')}
          <motion.span aria-hidden="true" animate={{ rotate: expanded ? 180 : 0 }} transition={spring.snappy} className="grid">
            <ChevronDown size={14} strokeWidth={1.5} />
          </motion.span>
        </button>
      )}

      <EventDetailSheet event={openEvent} timeZone={city.timezone} onClose={() => setOpenEvent(null)} />
    </section>
  );
}
