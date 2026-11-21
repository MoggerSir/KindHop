import { ArrowRight } from 'lucide-react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { EventMeta } from './EventMeta.jsx';

// Tarjeta de evento con foto a sangre y texto sobre degradado de lectura. Altura ligada al alto de pantalla (dvh)
// para que Inicio entero (días, eventos y categorías) quepa en la primera vista del móvil, desde 375×667.
// variant 'featured' (destacado, ancho completo) o 'compact' (rejilla de dos columnas). Toda la tarjeta abre el detalle:
// el botón del título se estira sobre la tarjeta (after:inset-0) y su foco se dibuja en el article.
export function EventCard({ event, timeZone, variant = 'compact', onOpen }) {
  const { t } = useI18n();
  const featured = variant === 'featured';

  return (
    <article className={`relative isolate overflow-hidden rounded-3xl bg-ink text-white ring-accent ring-offset-2 ring-offset-paper has-[button:focus-visible]:ring-2 shadow-[0_8px_24px_-12px_oklch(0.25_0.03_200/0.45)] ${featured ? 'h-[clamp(9rem,23dvh,18rem)]' : 'h-[clamp(6.5rem,16dvh,12rem)]'}`}>
      <img src={event.image.src} alt={event.image.alt} loading={featured ? 'eager' : 'lazy'} style={{ objectPosition: event.image.position }} className="absolute inset-0 -z-10 size-full object-cover" />
      {/* Degradado de lectura: garantiza contraste del texto blanco sobre cualquier foto. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/0" />

      <div className="absolute inset-x-2.5 top-2.5">
        <DataStatusBadge status={event.dataStatus} onImage />
      </div>

      <div className={`absolute inset-x-0 bottom-0 flex items-end gap-3 ${featured ? 'p-4' : 'p-3'}`}>
        <div className="min-w-0 flex-1">
          <h3 className={`font-extrabold tracking-tight text-balance ${featured ? 'text-[clamp(1.25rem,3dvh,1.5rem)] leading-tight' : 'text-sm leading-tight'}`}>
            <button type="button" onClick={() => onOpen(event)} aria-label={t('events.openDetail', { title: event.title })} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {event.title}
            </button>
          </h3>
          <EventMeta event={event} timeZone={timeZone} compact={!featured} className={`mt-1.5 text-white/90 ${featured ? 'text-sm' : 'text-[11px]'}`} />
        </div>
        {/* Solo el destacado lleva flecha: en las compactas quitaría espacio al lugar (toda la tarjeta es pulsable). */}
        {featured && (
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_4px_12px_-4px_oklch(0.2_0.05_190/0.6)]">
            <ArrowRight size={22} strokeWidth={2.25} />
          </span>
        )}
      </div>
    </article>
  );
}
