import { ArrowRight, Bus, CalendarDays, ExternalLink, MapPinOff, Shapes, X } from 'lucide-react';
import { CATEGORIES } from '@/features/discovery';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';

// Filas de la hoja del mapa (alternativa en texto a todo lo que se ve en el lienzo) y tarjeta de lo elegido.
// Tocar una fila elige el elemento y el mapa vuela a él; el detalle de un evento se abre desde la tarjeta.

function useEventDate(timeZone) {
  const { locale } = useI18n();
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone });
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone });
  return (iso) => `${day.format(new Date(iso))} · ${time.format(new Date(iso))}`;
}

function poiName(poi, locale) {
  return (locale === 'en' && poi.i18n?.en?.name) || poi.name;
}

function formatFare(cents, locale) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'MXN' }).format(cents / 100);
}

function formatDate(iso, locale) {
  if (!iso) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));
}

const ROW =
  'flex w-full items-center gap-3 rounded-control px-2 py-2 text-left transition-colors duration-150 hover:bg-surface-hover aria-pressed:bg-tint';

function Thumb({ event, size = 'size-14' }) {
  const Icon = CATEGORIES.find((c) => c.id === event.category)?.Icon ?? CalendarDays;
  return event.image?.src ? (
    <img src={event.image.src} alt={''} loading="lazy" style={{ objectPosition: event.image.position }} className={`${size} shrink-0 rounded-control object-cover outline outline-1 -outline-offset-1 outline-image-edge`} />
  ) : (
    <span aria-hidden="true" className={`${size} grid shrink-0 place-items-center rounded-control bg-sunk text-ink-3`}>
      <Icon size={20} strokeWidth={1.5} />
    </span>
  );
}

function NoPin() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-tint px-2 py-0.5 text-[0.6875rem] font-medium text-ink-2">
      <MapPinOff aria-hidden="true" size={12} strokeWidth={1.5} />
      {t('map.item.noLocation')}
    </span>
  );
}

export function EventRow({ event, timeZone, distance, selected, onSelect }) {
  const when = useEventDate(timeZone);
  return (
    <button type="button" aria-pressed={selected} onClick={() => onSelect(event)} className={ROW}>
      <Thumb event={event} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{event.title}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-2 first-letter:uppercase">{when(event.startsAt)}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-2">{[event.place?.name ?? event.venue, distance].filter(Boolean).join(' · ')}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <DataStatusBadge status={event.dataStatus} />
          {!event.place && <NoPin />}
          {event.sourceUrl && <span className="block truncate text-xs text-ink-2">{event.sourceUrl}</span>}
        </span>
      </span>
    </button>
  );
}

export function PoiRow({ poi, distance, selected, onSelect }) {
  const { t, locale } = useI18n();
  const Icon = CATEGORIES.find((c) => c.id === poi.category)?.Icon ?? Shapes;
  return (
    <button type="button" aria-pressed={selected} onClick={() => onSelect(poi)} className={`${ROW} min-h-11`}>
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-sunk text-ink-2">
        <Icon size={16} strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{poiName(poi, locale)}</span>
        <span className="block truncate text-xs text-ink-2">{[t(`discovery.categories.${poi.category}`), distance].filter(Boolean).join(' · ')}</span>
      </span>
    </button>
  );
}

export function RouteRow({ route, selected, onSelect }) {
  const { locale } = useI18n();
  return (
    <button type="button" aria-pressed={selected} onClick={() => onSelect(route)} className={`${ROW} min-h-11`}>
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-sunk text-map-transit">
        <Bus size={16} strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{route.name}</span>
      {route.fareCents != null && <span className="font-mono text-xs text-ink-2 tabular-nums">{formatFare(route.fareCents, locale)}</span>}
    </button>
  );
}

export function ZoneRow({ zone, selected, onSelect }) {
  const { t } = useI18n();
  return (
    <button type="button" aria-pressed={selected} onClick={() => onSelect(zone)} className={`${ROW} min-h-11`}>
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-sunk">
        <span className="size-3.5 border border-ink-2 bg-tint" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{zone.name}</span>
      <span className="text-xs text-ink-2">{t(`discovery.districts.kind.${zone.kind}`)}</span>
    </button>
  );
}

// Tarjeta de lo elegido, arriba de la hoja. La X quita la selección (también Escape o tocar el mapa vacío).
function Card({ children, onClear }) {
  const { t } = useI18n();
  return (
    <article className="relative rounded-card border border-line-strong bg-surface-hover p-3 shadow-raised">
      {children}
      <button
        type="button"
        onClick={onClear}
        aria-label={t('map.item.clear')}
        className="absolute top-1 right-1 z-10 grid size-11 place-items-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-tint hover:text-ink"
      >
        <X aria-hidden="true" size={18} strokeWidth={1.5} />
      </button>
    </article>
  );
}

function SourceLine({ source }) {
  const { t, locale } = useI18n();
  const date = formatDate(source.retrievedAt, locale);
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">
      <DataStatusBadge status={source.dataStatus} />
      <span>{[source.name, date && t('map.layers.asOf', { date })].filter(Boolean).join(' · ')}</span>
    </p>
  );
}

function SourceLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current">
      {children}
      <ExternalLink aria-hidden="true" size={14} strokeWidth={1.5} />
    </a>
  );
}

export function EventCardSelected({ event, timeZone, distance, onOpen, onClear }) {
  const { t } = useI18n();
  const when = useEventDate(timeZone);
  return (
    <Card onClear={onClear}>
      <div className="flex items-center gap-3 pr-9">
        <Thumb event={event} size="size-20" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[0.9375rem] font-semibold text-ink">
            <button
              type="button"
              onClick={() => onOpen(event)}
              aria-label={t('events.openDetail', { title: event.title })}
              className="text-left focus-visible:outline-none after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent focus-visible:after:outline-solid"
            >
              {event.title}
            </button>
          </h3>
          <p className="mt-0.5 truncate text-xs text-ink-2 first-letter:uppercase">{when(event.startsAt)}</p>
          <p className="mt-0.5 truncate text-xs text-ink-2">{[event.place?.name ?? event.venue, distance].filter(Boolean).join(' · ')}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <DataStatusBadge status={event.dataStatus} />
            {!event.place && <NoPin />}
          {event.sourceUrl && <span className="block truncate text-xs text-ink-2">{event.sourceUrl}</span>}
            {event.place?.dataStatus === 'DEMO' && <span className="text-[0.6875rem] text-ink-2">{t('map.item.approxLocation')}</span>}
          </div>
        </div>
      </div>
      <span aria-hidden="true" className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-accent text-on-accent shadow-solid">
        <ArrowRight size={16} strokeWidth={1.5} />
      </span>
    </Card>
  );
}

export function PlaceGroupCard({ group, distance, onClear, children }) {
  const { t } = useI18n();
  return (
    <Card onClear={onClear}>
      <div className="flex items-center gap-3 pr-10">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
          <CalendarDays size={16} strokeWidth={1.5} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[0.9375rem] font-semibold text-ink">{group.place.name}</h3>
          <p className="text-xs text-ink-2">{[t('map.pin.eventCount', { count: group.events.length }), distance].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <div className="mt-2 grid gap-1">{children}</div>
    </Card>
  );
}

export function PoiCard({ poi, source, distance, onClear }) {
  const { t, locale } = useI18n();
  const Icon = CATEGORIES.find((c) => c.id === poi.category)?.Icon ?? Shapes;
  return (
    <Card onClear={onClear}>
      <div className="flex items-center gap-3 pr-10">
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
          <Icon size={18} strokeWidth={1.5} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[0.9375rem] font-semibold text-ink">{poiName(poi, locale)}</h3>
          <p className="text-xs text-ink-2">{[t(`discovery.categories.${poi.category}`), distance].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {source && <SourceLine source={source} />}
      {poi.url && <SourceLink href={poi.url}>{t('map.item.openInOsm')}</SourceLink>}
    </Card>
  );
}

export function RouteCard({ route, source, onClear }) {
  const { t, locale } = useI18n();
  return (
    <Card onClear={onClear}>
      <div className="flex items-center gap-3 pr-10">
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
          <Bus size={18} strokeWidth={1.5} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[0.9375rem] font-semibold text-pretty text-ink">{route.name}</h3>
          {route.fareCents != null && <p className="font-mono text-xs text-ink-2 tabular-nums">{t('map.item.fare', { fare: formatFare(route.fareCents, locale) })}</p>}
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-2">{t(route.stops?.length ? 'transit.staticNotice' : 'map.item.routeNoStops')}</p>
      {route.stops?.length > 0 && <details className="mt-2 text-sm text-ink-2"><summary className="min-h-11 cursor-pointer py-2">{t('transit.stops', { count: route.stops.length })}</summary><ol className="list-inside list-decimal">{route.stops.map((stop) => <li key={stop.id}>{stop.name}</li>)}</ol></details>}
      {source && <SourceLine source={source} />}
      {source?.url && <SourceLink href={source.url}>{t('map.item.openSource')}</SourceLink>}
    </Card>
  );
}

export function ZoneCard({ zone, source, onClear }) {
  const { t } = useI18n();
  return (
    <Card onClear={onClear}>
      <div className="pr-10">
        <h3 className="text-[0.9375rem] font-semibold text-ink">{zone.name}</h3>
        <p className="text-xs text-ink-2">{t(`discovery.districts.kind.${zone.kind}`)}</p>
      </div>
      {source && <SourceLine source={source} />}
      {source?.url && <SourceLink href={source.url}>{t('discovery.districts.sourceLink')}</SourceLink>}
    </Card>
  );
}
