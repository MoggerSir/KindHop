import { CalendarDays, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORY_ICON_BY_ID } from '@/features/discovery';
import { useI18n } from '@/shared/i18n';
import { press, spring } from '@/shared/motion/motion.js';
import { MapMarker } from './MapMarker.jsx';

// Pines de evento: uno por lugar con coordenadas en la BD (varios eventos en el mismo sitio → un pin con número).
// Son botones reales: se alcanzan con Tab y tienen nombre accesible. Blancos sobre el mapa oscuro; el elegido en lima
// con un globo encima (título y distancia) que abre el detalle. Nada se agranda bajo el puntero.
export function EventPins({ map, groups, selectedPlaceId, onSelect, onOpen, distanceTo }) {
  const { t } = useI18n();
  return groups.map((group) => {
    const { place, events } = group;
    const selected = place.id === selectedPlaceId;
    const Icon = CATEGORY_ICON_BY_ID[events[0].category] ?? CalendarDays;
    const distance = distanceTo?.(place.coordinates);
    const single = events.length === 1 ? events[0] : null;
    return (
      <MapMarker key={place.id} map={map} lngLat={place.coordinates} front={selected}>
        <div data-map-pin="" className="relative">
          {selected && (
            <motion.button
              type="button"
              onClick={() => onOpen(group)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.snappy}
              whileTap={press}
              aria-label={single ? t('events.openDetail', { title: single.title }) : t('map.pin.showEvents', { place: place.name })}
              className="absolute bottom-full left-1/2 mb-2.5 flex min-h-11 w-max max-w-[min(15rem,calc(100cqw-2.5rem))] -translate-x-1/2 items-center gap-2.5 rounded-card border border-line-strong bg-surface py-1.5 pr-2 pl-1.5 text-left shadow-floating transition-colors duration-150 hover:bg-surface-hover"
            >
              {single?.image?.src ? (
                <img src={single.image.src} alt={''} className="size-9 shrink-0 rounded-control object-cover outline outline-1 -outline-offset-1 outline-image-edge" />
              ) : (
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-control bg-sunk text-ink-3">
                  <Icon size={16} strokeWidth={1.5} />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{single ? single.title : place.name}</span>
                <span className="block truncate font-mono text-xs text-ink-2 tabular-nums">
                  {[single ? null : t('map.pin.eventCount', { count: events.length }), distance].filter(Boolean).join(' · ') || place.name}
                </span>
              </span>
              <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-accent" />
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={() => onSelect(group)}
            whileTap={press}
            aria-pressed={selected}
            aria-label={t('map.pin.label', { place: place.name, count: events.length })}
            className={`relative grid size-11 place-items-center rounded-full border-2 shadow-floating transition-colors duration-150 ${
              selected ? 'border-accent bg-accent text-on-accent shadow-solid' : 'border-paper bg-surface text-ink hover:border-accent'
            }`}
          >
            {events[0]?.image?.src ? (
              <img
                src={events[0].image.src}
                alt={''}
                aria-hidden="true"
                className="size-full rounded-full object-cover outline-1 -outline-offset-1 outline-image-edge"
              />
            ) : (
              <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
            )}
            <span
              aria-hidden="true"
              className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full border border-paper bg-accent text-on-accent"
            >
              <Icon size={11} strokeWidth={2} />
            </span>
            {events.length > 1 && (
              <span aria-hidden="true" className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full border border-line-strong bg-surface px-1 font-mono text-[0.625rem] leading-5 text-ink tabular-nums">
                {events.length}
              </span>
            )}
          </motion.button>
        </div>
      </MapMarker>
    );
  });
}

// Punto azul de "mi ubicación" con halo estático (sin pulso infinito). Decorativo: el estado se anuncia en texto.
export function UserDot({ map, position }) {
  return (
    <MapMarker map={map} lngLat={position}>
      <span aria-hidden="true" className="pointer-events-none relative grid size-10 place-items-center">
        <span className="absolute inset-0 rounded-full bg-map-me/20" />
        <span className="relative size-4 rounded-full border-2 border-ink bg-map-me shadow-raised" />
      </span>
    </MapMarker>
  );
}
