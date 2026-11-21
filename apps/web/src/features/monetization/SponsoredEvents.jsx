import { useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { EventDetailSheet, useEvents } from '@/features/events';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, press, stageItem, stagger } from '@/shared/motion/motion.js';
import { SponsorBadge } from './SponsorBadge.jsx';

// Los 3 puestos pagados de eventos (KH-021), arriba de los recomendados y siempre etiquetados "Patrocinado #n".
// Los recomendados de abajo no cambian de orden por pagar.
export function SponsoredEvents({ city }) {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const item = reduce ? fadeOnly : stageItem;
  const { status, events } = useEvents(city);
  const [open, setOpen] = useState(null);
  const sponsored = events.filter((e) => e.sponsoredRank).sort((a, b) => a.sponsoredRank - b.sponsoredRank).slice(0, 3);
  if (status !== 'ready' || sponsored.length === 0) return null;
  const when = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: city.timezone });

  return (
    <section aria-labelledby="sponsored-title" className="grid gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="sponsored-title" className="text-base font-semibold text-ink">{t('monetization.sponsoredEvents.title')}</h2>
        <p className="text-[11px] text-ink-3">{t('monetization.sponsoredEvents.disclosure')}</p>
      </div>
      <motion.ul variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-2">
        {sponsored.map((event) => (
          <motion.li key={event.id} variants={item}>
            <motion.button
              type="button"
              whileTap={press}
              onClick={() => setOpen(event)}
              className="flex min-h-16 w-full items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 text-left shadow-raised transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk font-mono text-sm font-semibold text-accent shadow-sunk">
                {event.sponsoredRank}
              </span>
              <span className="grid min-w-0 flex-1 gap-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <SponsorBadge rank={event.sponsoredRank} />
                  <DataStatusBadge status={event.dataStatus} />
                </span>
                <span className="truncate text-sm font-semibold text-ink">{event.title}</span>
                <span className="flex items-center gap-1 truncate text-xs text-ink-2">
                  <CalendarDays aria-hidden="true" size={13} strokeWidth={1.5} className="shrink-0" />
                  {when.format(new Date(event.startsAt))}
                  {event.venue ? ` · ${event.venue}` : ''}
                </span>
              </span>
              <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-ink-3" />
            </motion.button>
          </motion.li>
        ))}
      </motion.ul>
      <EventDetailSheet event={open} timeZone={city.timezone} onClose={() => setOpen(null)} />
    </section>
  );
}
