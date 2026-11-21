import { ArrowRight, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { press, spring } from '@/shared/motion/motion.js';
import { dayKey } from './dates.js';
import { EventMeta } from './EventMeta.jsx';

// Tarjeta de evento en fila: miniatura con badge "hoy"/"próximamente", título, fecha, lugar, etiquetas y flecha.
// Toda la tarjeta abre el detalle: el botón del título se estira sobre ella (after:inset-0).
// El badge se calcula con la fecha del evento en la zona de la ciudad (la API no lo envía); `tags` es opcional.
// Sin foto (eventos de la BD sin imagen) se muestra un recuadro con icono. La etiqueta DEMO siempre es visible.
export function EventCard({ event, timeZone, onOpen }) {
  const { t } = useI18n();
  const hasImage = Boolean(event.image?.src);
  const isToday = dayKey(new Date(event.startsAt), timeZone) === dayKey(new Date(), timeZone);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      whileTap={press}
      transition={spring.snappy}
      className="relative flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3 shadow-raised transition-all hover:border-line-strong hover:shadow-lifted cursor-pointer"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-sunk sm:size-28">
        {hasImage ? (
          <img src={event.image.src} alt={event.image.alt} loading="lazy" style={{ objectPosition: event.image.position }} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-ink-3">
            <CalendarDays aria-hidden="true" size={24} strokeWidth={1.5} />
            <span className="sr-only">{t('events.noPhoto')}</span>
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[0.625rem] font-medium text-white backdrop-blur-md">
            <span
              className={`size-1.5 rounded-full ${
                isToday ? 'bg-success shadow-[0_0_6px_var(--color-success)]' : 'bg-blue-400 shadow-[0_0_6px_#60a5fa]'
              }`}
            />
            {t(isToday ? 'events.today' : 'events.upcoming')}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[0.9375rem] font-semibold text-white">
          <button
            type="button"
            onClick={() => onOpen(event)}
            aria-label={t('events.openDetail', { title: event.title })}
            className="text-left focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {event.title}
          </button>
        </h3>
        <EventMeta event={event} timeZone={timeZone} className="mt-1" />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <DataStatusBadge status={event.dataStatus} />
          {event.tags?.map((tag) => (
            <span key={tag} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[0.6875rem] font-medium text-ink-2">
              {t(`events.tags.${tag}`)}
            </span>
          ))}
        </div>
      </div>

      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-solid transition-transform hover:scale-105"
      >
        <ArrowRight size={16} strokeWidth={2.5} />
      </span>
    </motion.article>
  );
}
