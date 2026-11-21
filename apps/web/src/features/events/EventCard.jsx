import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { press, spring } from '@/shared/motion/motion.js';
import { EventMeta } from './EventMeta.jsx';

// Tarjeta de evento: cartulina realzada con corte recto, foto arriba y texto impreso debajo.
// variant 'featured' (ancho completo, con la flecha como única "tarjeta negra") o 'compact' (rejilla de dos).
// Toda la tarjeta abre el detalle: el botón del título se estira sobre ella (after:inset-0) y su foco se dibuja en el article.
// Movimiento: con puntero, la cartulina sube 2 px y pasa a shadow-lifted; al pulsar se hunde a 0.96.
// Alturas de foto ligadas al alto de pantalla (dvh) para que Inicio entero quepa en la primera vista del móvil.
export function EventCard({ event, timeZone, variant = 'compact', onOpen }) {
  const { t } = useI18n();
  const featured = variant === 'featured';
  const hasImage = Boolean(event.image?.src);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      whileTap={press}
      transition={spring.snappy}
      className="relative flex h-full flex-col border border-transparent bg-surface shadow-raised outline-offset-3 outline-ink transition-shadow duration-300 hover:shadow-lifted has-[button:focus-visible]:outline-[1.5px] has-[button:focus-visible]:outline-solid"
    >
      {hasImage ? (
        <div className={`relative overflow-hidden ${featured ? 'h-[clamp(5.5rem,16dvh,11rem)] short:h-[5.5rem]' : 'h-[clamp(3.5rem,9dvh,6.5rem)]'}`}>
          <img
            src={event.image.src}
            alt={event.image.alt}
            loading={featured ? 'eager' : 'lazy'}
            style={{ objectPosition: event.image.position }}
            className="size-full object-cover outline-1 -outline-offset-1 outline-black/10"
          />
          <div className="absolute top-2 left-2">
            <DataStatusBadge status={event.dataStatus} onImage />
          </div>
        </div>
      ) : (
        <div className={`flex items-center outline-1 -outline-offset-1 outline-black/10 ${featured ? 'p-3.5 short:p-3' : 'p-2.5'}`}>
          <DataStatusBadge status={event.dataStatus} />
          <span className="sr-only">{t('events.noPhoto')}</span>
        </div>
      )}

      <div className={`flex flex-1 items-end gap-3 ${featured ? 'p-3.5 short:p-3' : 'p-2.5'}`}>
        <div className="min-w-0 flex-1">
          <h3 className={`title truncate ${featured ? 'text-lg' : 'text-[0.9375rem]'}`}>
            <button type="button" onClick={() => onOpen(event)} aria-label={t('events.openDetail', { title: event.title })} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {event.title}
            </button>
          </h3>
          <EventMeta event={event} timeZone={timeZone} compact={!featured} className={`mt-1 ${featured ? 'text-[0.8125rem]' : 'text-[0.6875rem]'}`} />
        </div>
        {featured && (
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-control bg-solid text-on-solid shadow-solid">
            <ArrowRight size={18} strokeWidth={1.5} />
          </span>
        )}
      </div>
    </motion.article>
  );
}