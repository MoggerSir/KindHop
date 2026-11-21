import { useCallback, useEffect, useState } from 'react';
import { CalendarX2, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { useI18n } from '@/shared/i18n';
import { cascadeItem, expand, fadeOnly, press, spring, stagger, tileReveal } from '@/shared/motion/motion.js';
import { useRevealScroll } from '@/shared/motion/useRevealScroll.js';
import { eventsFromDay } from './dates.js';
import { EventCard } from './EventCard.jsx';
import { EventDetail } from './EventDetail.jsx';
import { useEvents } from './useEvents.js';

const VISIBLE = 3; // destacado + dos mosaicos; el resto, al expandir

// "Recomendado por nosotros" en bento: el primer evento a todo lo ancho y los siguientes en mosaicos de dos columnas.
// "Ver más eventos" expande el resto (panel con resorte, cascada, la página baja con él) y se pliega en reversa.
// `category` filtra por categoría (null = todas). Incluye el detalle.
export function EventsSection({ city, dayKey, category = null, onSeeMore }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const revealScroll = useRevealScroll(88 + 56); // barra inferior + el botón "Ver menos" bajo el panel
  const { status, events, error, reload } = useEvents(city);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(null); // evento con el detalle abierto
  const openEvent = (event) => setOpen(event);
  const isOpen = (event) => open?.id === event.id;
  const [returning, setReturning] = useState(null); // id de la tarjeta que vuelve del detalle (va por encima de sus vecinas)
  const closeDetail = useCallback(() => {
    setReturning(open?.id ?? null);
    setOpen(null);
  }, [open]);
  // Primera entrada de la página: revelado con desenfoque y foto que se asienta. Después (filtros, vueltas del detalle)
  // solo fundidos y reacomodo, para no repetir el efecto ni oscurecer el bento.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 1200);
    return () => clearTimeout(id);
  }, []);

  if (status === 'loading') return <LoadingState>{t('events.loading')}</LoadingState>;
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;
  if (events.length === 0) return <EmptyState icon={CalendarX2}>{t('events.emptyCity', { city: city.name })}</EmptyState>;

  const upcoming = eventsFromDay(events, dayKey, city.timezone);
  const filtered = category ? upcoming.filter((e) => e.category === category || e.tags?.includes(category)) : upcoming;
  if (filtered.length === 0) return <EmptyState icon={CalendarX2}>{t(category ? 'events.emptyFilter' : 'events.emptyDay')}</EmptyState>;

  const [featured, ...rest] = filtered.slice(0, VISIBLE);
  const extra = filtered.slice(VISIBLE);

  return (
    <section aria-labelledby="events-title" className="grid gap-3 [&>*]:min-w-0">
      <h2 id="events-title" className="pt-1 text-xs font-medium text-ink-3">
        {t('home.recommended')}
      </h2>

      {/* Revelado en cascada (70 ms) al entrar; al filtrar, las piezas se reacomodan con resorte (layout). */}
      <motion.ul variants={stagger(0.07)} initial="hidden" animate="visible" layout transition={spring.layout} className="grid grid-cols-2 gap-3 [&>li]:min-w-0">
        <AnimatePresence mode="popLayout" initial={false}>
          {[featured, ...rest].map((event, i) => (
            <motion.li
              key={event.id}
              layout
              variants={reduce || entered ? fadeOnly : tileReveal}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ position: 'relative', zIndex: returning === event.id ? 10 : 0 }}
              className={i === 0 ? 'col-span-2' : ''}
            >
              {/* Mientras su detalle está abierto, la pieza deja un hueco del mismo tamaño (el marco "viaja" al panel). */}
              {isOpen(event) ? (
                <div aria-hidden="true" className={`h-full ${i === 0 ? 'min-h-52' : 'min-h-40'}`} />
              ) : (
                <EventCard
                  event={event}
                  timeZone={city.timezone}
                  variant={i === 0 ? 'featured' : 'tile'}
                  onOpen={openEvent}
                  settle={!entered}
                  returning={returning === event.id}
                  onSettled={() => returning === event.id && setReturning(null)}
                />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence initial={false}>
        {expanded && extra.length > 0 && (
          <motion.div {...revealScroll} key="extra" variants={reduce ? fadeOnly : expand} initial="hidden" animate="visible" exit="exit" className="-m-2 overflow-hidden p-2">
            <ul className="grid grid-cols-2 gap-3 [&>li]:min-w-0">
              {extra.map((event) => (
                <motion.li key={event.id} variants={cascadeItem} style={{ position: 'relative', zIndex: returning === event.id ? 10 : 0 }}>
                  {isOpen(event) ? (
                    <div aria-hidden="true" className="h-full min-h-40" />
                  ) : (
                    <EventCard event={event} timeZone={city.timezone} onOpen={openEvent} returning={returning === event.id} onSettled={() => returning === event.id && setReturning(null)} />
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {(extra.length > 0 || onSeeMore) && (
        <motion.button
          type="button"
          whileTap={press}
          onClick={() => (extra.length > 0 ? setExpanded((v) => !v) : onSeeMore?.())}
          aria-expanded={extra.length > 0 ? expanded : undefined}
          className="mx-auto inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink-2 transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover hover:text-ink"
        >
          {t(extra.length > 0 && expanded ? 'events.seeLess' : 'events.seeMore')}
          {extra.length > 0 && (
            <motion.span aria-hidden="true" animate={{ rotate: expanded ? 180 : 0 }} transition={spring.snappy} className="grid">
              <ChevronDown size={16} strokeWidth={1.5} />
            </motion.span>
          )}
        </motion.button>
      )}

      <AnimatePresence>
        {open && <EventDetail key={open.id} event={open} timeZone={city.timezone} onClose={closeDetail} />}
      </AnimatePresence>
    </section>
  );
}
