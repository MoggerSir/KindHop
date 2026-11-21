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

const VISIBLE = 3; // destacado + dos mosaicos; el resto, al expandir

// "Recomendado por nosotros" en bento: el primer evento a todo lo ancho y los siguientes en mosaicos de dos columnas.
// "Ver más eventos" expande el resto (panel con resorte, cascada, la página baja con él) y se pliega en reversa.
// `category` filtra por categoría (null = todas). Incluye el detalle.
export function EventsSection({ city, dayKey, category = null }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const revealScroll = useRevealScroll(88 + 56); // barra inferior + el botón "Ver menos" bajo el panel
  const { status, events, error, reload } = useEvents(city);
  const [expanded, setExpanded] = useState(false);
  const [openEvent, setOpenEvent] = useState(null);

  if (status === 'loading') return <LoadingState>{t('events.loading')}</LoadingState>;
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (events.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyCity', { city: city.name })}</EmptyState>;

  const upcoming = eventsFromDay(events, dayKey, city.timezone);
  const filtered = category ? upcoming.filter((e) => e.category === category || e.tags?.includes(category)) : upcoming;
  if (filtered.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyDay')}</EmptyState>;

  const [featured, ...rest] = filtered.slice(0, VISIBLE);
  const extra = filtered.slice(VISIBLE);

  return (
    <section aria-labelledby="events-title" className="grid gap-3 [&>*]:min-w-0">
      <h2 id="events-title" className="pt-1 text-xs font-medium text-ink-3">
        {t('home.recommended')}
      </h2>

      <motion.ul layout transition={spring.layout} className="grid grid-cols-2 gap-3 [&>li]:min-w-0">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.li key={featured.id} layout variants={fadeRise} initial="hidden" animate="visible" exit="exit" className="col-span-2">
            <EventCard event={featured} timeZone={city.timezone} variant="featured" onOpen={setOpenEvent} />
          </motion.li>
          {rest.map((event) => (
            <motion.li key={event.id} layout variants={fadeRise} initial="hidden" animate="visible" exit="exit">
              <EventCard event={event} timeZone={city.timezone} onOpen={setOpenEvent} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence initial={false}>
        {expanded && extra.length > 0 && (
          <motion.div {...revealScroll} key="extra" variants={reduce ? fadeOnly : expand} initial="hidden" animate="visible" exit="exit" className="-m-2 overflow-hidden p-2">
            <ul className="grid grid-cols-2 gap-3 [&>li]:min-w-0">
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
          className="mx-auto inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-ink-2 transition-colors duration-150 hover:border-line-strong hover:text-ink"
        >
          {t(expanded ? 'events.seeLess' : 'events.seeMore')}
          <motion.span aria-hidden="true" animate={{ rotate: expanded ? 180 : 0 }} transition={spring.snappy} className="grid">
            <ChevronDown size={16} strokeWidth={2} />
          </motion.span>
        </button>
      )}

      <EventDetailSheet event={openEvent} timeZone={city.timezone} onClose={() => setOpenEvent(null)} />
    </section>
  );
}
