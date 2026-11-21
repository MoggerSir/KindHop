import { ArrowRight, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import { SponsorBadge } from '@/features/monetization';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { Photo } from '@/shared/components/Photo.jsx';
import { StarRating } from '@/shared/components/StarRating.jsx';
import { useI18n } from '@/shared/i18n';
import { photoSizes } from '@/shared/lib/demoImage.js';
import { photoSettle, press, spring } from '@/shared/motion/motion.js';
import { dayKey } from './dates.js';
import { EventMeta } from './EventMeta.jsx';
import { Highlight } from './Highlight.jsx';

// Pieza del bento de eventos: foto a sangre con degradado de lectura, badge "hoy"/"próximamente" y etiqueta DEMO.
// variant 'featured' (ancho completo, más alta, con flecha de acento) o 'tile' (media columna).
// Movimiento:
// - El marco (`event-${id}`) y la foto (`event-media-${id}`) son elementos compartidos: al abrir, la pieza entera se
//   expande hasta convertirse en el detalle (EventDetail) y al cerrar vuelve a su hueco (spring.morph).
// - La foto entra un 12 % más grande y se asienta; con puntero hace un zoom lento DENTRO del marco (la pieza no se
//   mueve, así no se escapa del cursor); al pulsar, la pieza se hunde a 0.96.
// El badge se calcula con la fecha del evento en la zona de la ciudad; sin foto se muestra un fondo con icono.
// `settle`: solo en la primera entrada de la página (al volver del detalle o al filtrar no se repite).
// `returning`: vuelve del detalle; su texto aparece cuando el marco ya llegó (no se estira durante el morph).
// variant 'row' (resultados de Explorar): miniatura a la izquierda, texto con lo buscado (`query`) resaltado y flecha
// lima; comparte marco y foto con el detalle igual que las piezas del bento.
export function EventCard({ event, timeZone, variant = 'tile', onOpen, settle = false, returning = false, onSettled, query = '', priority = false }) {
  const { t } = useI18n();
  const featured = variant === 'featured';
  const hasImage = Boolean(event.image?.src);
  const isToday = dayKey(new Date(event.startsAt), timeZone) === dayKey(new Date(), timeZone);

  if (variant === 'row') {
    return <EventRow event={event} timeZone={timeZone} isToday={isToday} hasImage={hasImage} onOpen={onOpen} returning={returning} onSettled={onSettled} query={query} priority={priority} />;
  }

  return (
    <motion.article
      layoutId={`event-${event.id}`}
      whileTap={press}
      transition={{ ...spring.snappy, layout: spring.morph }}
      onLayoutAnimationComplete={onSettled}
      style={{ borderRadius: 'var(--radius-card)' }}
      className={`group relative isolate flex h-full flex-col justify-end overflow-hidden border border-line bg-surface shadow-raised ring-accent transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-lifted has-[button:focus-visible]:ring-2 ${featured ? 'min-h-52' : 'min-h-40'}`}
    >
      <motion.div layoutId={`event-media-${event.id}`} transition={spring.morph} className="absolute inset-0 -z-10 overflow-hidden">
        {hasImage ? (
          <Photo
            img={motion.img}
            initial={settle ? photoSettle.initial : false}
            animate={photoSettle.animate}
            src={event.image.src}
            alt={event.image.alt}
            sizes={featured ? photoSizes.featured : photoSizes.tile}
            loading={featured ? 'eager' : 'lazy'}
            fetchPriority={featured ? 'high' : undefined}
            style={{ objectPosition: event.image.position }}
            className="size-full object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-start justify-end bg-sunk p-3 text-ink-3">
            <CalendarDays aria-hidden="true" size={featured ? 28 : 22} strokeWidth={1.5} />
            <span className="sr-only">{t('events.noPhoto')}</span>
          </div>
        )}
      </motion.div>
      {/* Degradado de lectura: el texto blanco siempre cumple contraste sobre cualquier foto. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-scrim" />

      {/* En flujo (no absoluto): si las etiquetas ocupan más filas en una pieza estrecha (320 px con «Patrocinado»),
          la pieza crece en vez de tapar el título. Con espacio de sobra queda igual: etiquetas arriba, texto abajo. */}
      <motion.div
        className="relative flex flex-1 flex-col"
        initial={returning ? { opacity: 0 } : false}
        animate={{ opacity: 1, transition: { duration: 0.2, delay: returning ? 0.3 : 0 } }}
      >
      <div className="flex flex-wrap items-center gap-1.5 px-2.5 pt-2.5">
        {event.sponsoredRank && <SponsorBadge rank={event.sponsoredRank} />}
        <TodayBadge isToday={isToday} />
        <DataStatusBadge status={event.dataStatus} onImage />
        <StarRating rating={event.rating} count={event.ratingCount} compact onImage className={featured ? 'ml-auto' : ''} />
      </div>

      <div className={`relative mt-auto flex items-end gap-3 ${featured ? 'p-4' : 'p-3'}`}>
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold break-words text-ink ${featured ? 'text-xl leading-tight' : 'line-clamp-2 text-sm leading-snug'}`}>
            <button
              type="button"
              onClick={() => onOpen(event)}
              data-event-open={event.id}
              aria-label={t('events.openDetail', { title: event.title })}
              className="text-left focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
            >
              {event.title}
            </button>
          </h3>
          <EventMeta event={event} timeZone={timeZone} onImage className="mt-1" />
        </div>
        {featured && (
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-solid transition-[translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:translate-x-0.5"
          >
            <ArrowRight size={18} strokeWidth={1.5} />
          </span>
        )}
      </div>
      </motion.div>
    </motion.article>
  );
}

function TodayBadge({ isToday, className = '' }) {
  const { t } = useI18n();
  return (
    <span className={`flex items-center gap-1.5 rounded-full bg-scrim px-2 py-0.5 text-[0.625rem] font-medium text-ink backdrop-blur-md ${className}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${isToday ? 'bg-success' : 'bg-ink-2'}`} />
      {t(isToday ? 'events.today' : 'events.upcoming')}
    </span>
  );
}

// Fila de resultado: misma cartulina, mismo marco compartido (layoutId) y misma pulsación que las piezas del bento.
// La fila no se mueve con el puntero: cambia el filete y la flecha avanza 2 px.
function EventRow({ event, timeZone, isToday, hasImage, onOpen, returning, onSettled, query, priority }) {
  const { t, has } = useI18n();
  const categoryKey = `discovery.categories.${event.category}`;
  return (
    <motion.article
      layoutId={`event-${event.id}`}
      whileTap={press}
      transition={{ ...spring.snappy, layout: spring.morph }}
      onLayoutAnimationComplete={onSettled}
      style={{ borderRadius: 'var(--radius-card)' }}
      className="group relative flex items-stretch gap-3 overflow-hidden border border-line bg-surface p-2 pr-3 shadow-raised ring-accent transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-lifted has-[button:focus-visible]:ring-2"
    >
      <motion.div
        layoutId={`event-media-${event.id}`}
        transition={spring.morph}
        style={{ borderRadius: 'var(--radius-control)' }}
        className="relative aspect-square w-24 shrink-0 self-center overflow-hidden bg-sunk short:w-20"
      >
        {hasImage ? (
          <Photo
            src={event.image.src}
            alt={event.image.alt}
            aria-hidden="true"
            sizes={photoSizes.row}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            style={{ objectPosition: event.image.position }}
            className="size-full object-cover outline-1 -outline-offset-1 outline-image-edge transition-[scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-ink-3">
            <CalendarDays aria-hidden="true" size={22} strokeWidth={1.5} />
          </div>
        )}
      </motion.div>

      <motion.div
        className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-1"
        initial={returning ? { opacity: 0 } : false}
        animate={{ opacity: 1, transition: { duration: 0.2, delay: returning ? 0.3 : 0 } }}
      >
        <h3 className="line-clamp-2 text-[0.9375rem] leading-snug font-semibold text-ink">
          <button
            type="button"
            onClick={() => onOpen(event)}
            data-event-open={event.id}
            aria-label={t('events.openDetail', { title: event.title })}
            className="text-left focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            <Highlight text={event.title} query={query} />
          </button>
        </h3>
        <EventMeta event={event} timeZone={timeZone} query={query} />
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Solo "Hoy": en la fila, "Próximamente" repetiría lo que ya dice la fecha y partiría la línea en 375 px. */}
          {isToday && (
            <span className="flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[0.6875rem] font-medium text-success">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
              {t('events.today')}
            </span>
          )}
          {has(categoryKey) && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[0.6875rem] text-ink-2">{t(categoryKey)}</span>
          )}
          <StarRating rating={event.rating} count={event.ratingCount} compact />
          {event.sponsoredRank && <SponsorBadge rank={event.sponsoredRank} />}
          <DataStatusBadge status={event.dataStatus} />
        </div>
      </motion.div>

      <ArrowRight
        aria-hidden="true"
        size={20}
        strokeWidth={2}
        className="shrink-0 self-center text-accent transition-[translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:translate-x-0.5"
      />
    </motion.article>
  );
}
