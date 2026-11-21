import { ArrowRight, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { press, spring } from '@/shared/motion/motion.js';
import { dayKey } from './dates.js';
import { EventMeta } from './EventMeta.jsx';

// Pieza del bento de eventos: foto a sangre con degradado de lectura, badge "hoy"/"próximamente" y etiqueta DEMO.
// variant 'featured' (ancho completo, más alta, con flecha de acento) o 'tile' (media columna).
// Toda la pieza abre el detalle: el botón del título se estira sobre ella (after:inset-0).
// El badge se calcula con la fecha del evento en la zona de la ciudad; sin foto se muestra un fondo con icono.
export function EventCard({ event, timeZone, variant = 'tile', onOpen }) {
  const { t } = useI18n();
  const featured = variant === 'featured';
  const hasImage = Boolean(event.image?.src);
  const isToday = dayKey(new Date(event.startsAt), timeZone) === dayKey(new Date(), timeZone);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      whileTap={press}
      transition={spring.snappy}
      className={`relative isolate flex h-full flex-col justify-end overflow-hidden rounded-card border border-line bg-surface shadow-raised transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-lifted ring-accent has-[button:focus-visible]:ring-2 ${featured ? 'min-h-52' : 'min-h-40'}`}
    >
      {hasImage ? (
        <img src={event.image.src} alt={event.image.alt} loading={featured ? 'eager' : 'lazy'} style={{ objectPosition: event.image.position }} className="absolute inset-0 -z-10 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 -z-10 grid place-items-start justify-end bg-sunk p-3 text-ink-3">
          <CalendarDays aria-hidden="true" size={featured ? 28 : 22} strokeWidth={1.5} />
          <span className="sr-only">{t('events.noPhoto')}</span>
        </div>
      )}
      {/* Degradado de lectura: el texto blanco siempre cumple contraste sobre cualquier foto. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-scrim" />

      <div className="absolute inset-x-2.5 top-2.5 flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 rounded-full bg-scrim px-2 py-0.5 text-[0.625rem] font-medium text-ink backdrop-blur-md">
          <span aria-hidden="true" className={`size-1.5 rounded-full ${isToday ? 'bg-success' : 'bg-ink-2'}`} />
          {t(isToday ? 'events.today' : 'events.upcoming')}
        </span>
        <DataStatusBadge status={event.dataStatus} onImage />
      </div>

      <div className={`flex items-end gap-3 ${featured ? 'p-4' : 'p-3'}`}>
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold text-ink ${featured ? 'text-xl leading-tight' : 'line-clamp-2 text-sm leading-snug'}`}>
            <button
              type="button"
              onClick={() => onOpen(event)}
              aria-label={t('events.openDetail', { title: event.title })}
              className="text-left focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
            >
              {event.title}
            </button>
          </h3>
          <EventMeta event={event} timeZone={timeZone} onImage className="mt-1" />
        </div>
        {featured && (
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-solid">
            <ArrowRight size={18} strokeWidth={2.5} />
          </span>
        )}
      </div>
    </motion.article>
  );
}
