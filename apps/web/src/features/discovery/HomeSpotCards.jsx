import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Compass,
  Info,
  Landmark,
  MapPin,
  Navigation,
  Share2,
  Store,
  Tag,
  Trees,
  Waves,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { StarRating } from '@/shared/components/StarRating.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, press } from '@/shared/motion/motion.js';
import { poiName } from './searchPois.js';
import { usePois } from './usePois.js';

const PAGE_SIZE = 4;
const TOURIST_ORDER = { beaches: 0, museums: 1, culture: 2, art: 3, parks: 4 };
const SPOT_CHIPS = {
  businesses: [
    { id: 'all', match: () => true },
    { id: 'markets', match: (p) => p.category === 'markets' },
    { id: 'downtown', match: (p) => p.coordinates[0] < -86.8 },
    { id: 'hotelZone', match: (p) => p.coordinates[0] >= -86.8 },
  ],
  tourist: [
    { id: 'all', match: () => true },
    { id: 'beaches', match: (p) => p.category === 'beaches' },
    { id: 'museums', match: (p) => p.category === 'museums' },
    { id: 'parks', match: (p) => p.category === 'parks' },
  ],
};
const CATEGORY_ICON = {
  markets: Store,
  beaches: Waves,
  museums: Landmark,
  parks: Trees,
  culture: Landmark,
  art: Compass,
};

function osmDirectionsUrl([lon, lat]) {
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${lon}#map=16/${lat}/${lon}`;
}

// Dos tarjetas de acceso rápido en Inicio: Comercios locales y Puntos turísticos.
// Al tocarlas abre una hoja con tarjetas tipo fila (estilo EventCard); al elegir un lugar, la misma hoja
// cambia su contenido a una ficha estilo Google Maps (cabecera visual, estrellas, acciones y datos).
export function HomeSpotCards({ city, onOpenMap }) {
  const { t, locale, has } = useI18n();
  const { status, pois, source, error, reload } = usePois(city);
  const [openKey, setOpenKey] = useState(null); // 'businesses' | 'tourist' | null
  const [chipId, setChipId] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const businesses = pois.filter((p) => p.category === 'markets');
  const tourist = pois
    .filter((p) => p.category in TOURIST_ORDER)
    .sort((a, b) => TOURIST_ORDER[a.category] - TOURIST_ORDER[b.category]);

  const cards = [
    { key: 'businesses', Icon: Store, items: businesses },
    { key: 'tourist', Icon: Compass, items: tourist },
  ];

  const active = cards.find((c) => c.key === openKey) ?? null;
  const label = (id) => (has(`discovery.categories.${id}`) ? t(`discovery.categories.${id}`) : t('places.otherCategory'));
  const retrieved = source?.retrievedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: city.timezone }).format(new Date(source.retrievedAt))
    : t('places.unknownDate');

  const closeSheet = () => {
    setOpenKey(null);
    setSelected(null);
    setChipId('all');
    setVisibleCount(PAGE_SIZE);
    setCopied(false);
  };

  const sharePlace = async (poi) => {
    const shareText = `${poiName(poi, locale)} · ${poi.url || osmDirectionsUrl(poi.coordinates)}`;
    try {
      await navigator.clipboard?.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles: no bloquea la ficha.
    }
  };

  return (
    <section aria-label={t('home.spots.sectionLabel')} className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ key, Icon, items }) => (
          <motion.button
            key={key}
            type="button"
            whileTap={press}
            aria-expanded={openKey === key}
            onClick={() => {
              setSelected(null);
              setChipId('all');
              setVisibleCount(PAGE_SIZE);
              setOpenKey(key);
            }}
            className="flex min-h-32 flex-col justify-between gap-3 rounded-card border border-line bg-surface p-4 text-left shadow-raised transition-[border-color,background-color,box-shadow] duration-150 hover:border-line-strong hover:bg-surface-hover hover:shadow-lifted"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
                <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
              </span>
              <ChevronDown aria-hidden="true" size={16} strokeWidth={1.5} className="mt-1 shrink-0 text-ink-3" />
            </div>
            <div className="grid gap-0.5">
              <span className="text-[0.9375rem] leading-snug font-semibold text-ink">
                {t(`home.spots.${key}.title`)}
              </span>
              <span className="text-xs text-ink-2">
                {status === 'ready' && items.length > 0
                  ? t('home.spots.count', { count: items.length })
                  : t(`home.spots.${key}.subtitle`)}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <Sheet
        open={Boolean(active)}
        onClose={closeSheet}
        title={
          selected
            ? poiName(selected, locale)
            : active
              ? t(`home.spots.${active.key}.title`)
              : t('home.spots.sectionLabel')
        }
      >
        {active && (
          <AnimatePresence mode="wait" initial={false}>
            {selected ? (
              <PlaceDetailView
                key={`detail-${selected.id}`}
                poi={selected}
                city={city}
                source={source}
                retrieved={retrieved}
                locale={locale}
                categoryLabel={label(selected.category)}
                copied={copied}
                onBack={() => {
                  setSelected(null);
                  setCopied(false);
                }}
                onShare={() => sharePlace(selected)}
                onOpenMap={() => {
                  const target = selected;
                  closeSheet();
                  onOpenMap?.(target);
                }}
              />
            ) : (
              <motion.div
                key={`list-${active.key}`}
                variants={fadeOnly}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid gap-3"
              >
                {status === 'loading' && <LoadingState>{t('places.loading')}</LoadingState>}
                {status === 'error' &&
                  (error.code === 'MODULE_UNAVAILABLE' ? (
                    <EmptyState icon={MapPin}>{t('places.unavailable', { city: city.name })}</EmptyState>
                  ) : (
                    <ErrorState error={error} onRetry={reload} />
                  ))}
                {status === 'ready' && (() => {
                  const chips = SPOT_CHIPS[active.key] ?? [];
                  const currentChip = chips.find((c) => c.id === chipId) ?? chips[0];
                  const filtered = currentChip ? active.items.filter(currentChip.match) : active.items;
                  const visible = filtered.slice(0, visibleCount);
                  const hasMore = visible.length < filtered.length;
                  return (
                    <>
                      <div role="group" aria-label={t('home.spots.filtersLabel')} className="flex flex-wrap gap-2">
                        {chips.map((chip) => {
                          const isCurrent = chip.id === currentChip?.id;
                          return (
                            <motion.button
                              key={chip.id}
                              type="button"
                              whileTap={press}
                              aria-pressed={isCurrent}
                              onClick={() => {
                                setChipId(chip.id);
                                setVisibleCount(PAGE_SIZE);
                              }}
                              className={`inline-flex min-h-11 items-center rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 ${
                                isCurrent
                                  ? 'border-accent bg-accent text-on-accent shadow-solid'
                                  : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink'
                              }`}
                            >
                              {t(`home.spots.chips.${chip.id}`)}
                            </motion.button>
                          );
                        })}
                      </div>

                      {filtered.length === 0 ? (
                        <EmptyState icon={active.Icon}>{t('home.spots.empty')}</EmptyState>
                      ) : (
                        <>
                          <ul className="grid gap-2.5">
                            {visible.map((poi) => {
                              const RowIcon = CATEGORY_ICON[poi.category] ?? active.Icon;
                              return (
                                <li key={poi.id}>
                                  <motion.button
                                    type="button"
                                    whileTap={press}
                                    onClick={() => setSelected(poi)}
                                    className="group flex w-full items-stretch gap-3 rounded-card border border-line bg-surface p-2 pr-3 text-left shadow-raised transition-[border-color,background-color,box-shadow] duration-150 hover:border-line-strong hover:bg-surface-hover hover:shadow-lifted"
                                  >
                                    <span className="relative grid size-20 shrink-0 place-items-center self-center overflow-hidden rounded-control bg-sunk text-accent shadow-sunk">
                                      {poi.imageUrl ? (
                                        <img
                                          src={poi.imageUrl}
                                          alt={''}
                                          aria-hidden="true"
                                          loading="lazy"
                                          className="size-full object-cover outline-1 -outline-offset-1 outline-image-edge"
                                        />
                                      ) : (
                                        <RowIcon aria-hidden="true" size={24} strokeWidth={1.5} />
                                      )}
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
                                      <span className="line-clamp-2 text-[0.9375rem] leading-snug font-semibold text-ink">
                                        {poiName(poi, locale)}
                                      </span>
                                      <StarRating rating={poi.rating} count={poi.ratingCount} />
                                      <span className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <span className="rounded-full border border-line px-2 py-0.5 text-[0.6875rem] text-ink-2">
                                          {label(poi.category)}
                                        </span>
                                        <DataStatusBadge status={poi.dataStatus} />
                                      </span>
                                    </span>
                                    <ArrowRight
                                      aria-hidden="true"
                                      size={20}
                                      strokeWidth={2}
                                      className="shrink-0 self-center text-accent transition-[translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:translate-x-0.5"
                                    />
                                  </motion.button>
                                </li>
                              );
                            })}
                          </ul>
                          {hasMore && (
                            <motion.button
                              type="button"
                              whileTap={press}
                              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                              className="mx-auto inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink-3 transition-colors duration-150 hover:text-ink"
                            >
                              {t('events.seeMore')}
                            </motion.button>
                          )}
                        </>
                      )}
                      {source && (
                        <p className="text-xs text-ink-3">
                          {t('places.provenance', { source: source.name, date: retrieved })}
                        </p>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Sheet>
    </section>
  );
}

// Ficha emergente estilo Google Maps dentro de la misma hoja: volver, héroe visual con foto, estrellas, acciones y filas de datos.
function PlaceDetailView({ poi, city, source, retrieved, locale, categoryLabel, copied, onBack, onShare, onOpenMap }) {
  const { t } = useI18n();
  const Icon = CATEGORY_ICON[poi.category] ?? MapPin;
  const [lon, lat] = poi.coordinates;

  return (
    <motion.div variants={fadeOnly} initial="hidden" animate="visible" exit="exit" className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <motion.button
          type="button"
          whileTap={press}
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-ink-2 transition-colors duration-150 hover:bg-tint hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          {t('home.spots.back')}
        </motion.button>
        <DataStatusBadge status={poi.dataStatus} />
      </div>

      {/* Cabecera visual estilo ficha de mapa con foto genérica de BD */}
      <div className="relative overflow-hidden rounded-card border border-line bg-sunk shadow-sunk">
        {poi.imageUrl && (
          <div className="relative h-36 w-full overflow-hidden">
            <img src={poi.imageUrl} alt={''} aria-hidden="true" className="size-full object-cover outline-1 -outline-offset-1 outline-image-edge" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-sunk via-sunk/20 to-transparent" />
          </div>
        )}
        <div className={`flex items-start gap-3.5 p-4 ${poi.imageUrl ? '-mt-6 relative' : ''}`}>
          <span className="grid size-12 shrink-0 place-items-center rounded-control border border-line bg-surface text-accent shadow-raised">
            <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
          </span>
          <div className="grid min-w-0 gap-1">
            <h3 className="text-lg leading-snug font-bold text-balance text-ink">{poiName(poi, locale)}</h3>
            <StarRating rating={poi.rating} count={poi.ratingCount} />
            <p className="text-xs text-ink-2">
              {categoryLabel} · {city.name}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de acciones estilo Google Maps: Cómo llegar lleva al mapa interno */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          type="button"
          whileTap={press}
          onClick={onOpenMap}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-on-accent shadow-solid transition-colors duration-150 hover:bg-accent-hover"
        >
          <Navigation aria-hidden="true" size={16} strokeWidth={1.5} />
          {t('home.spots.directions')}
        </motion.button>
        {(poi.url || source?.url) && (
          <a
            href={poi.url || source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover"
          >
            {t('places.openSource')}
            <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
          </a>
        )}
        <motion.button
          type="button"
          whileTap={press}
          onClick={onShare}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover"
        >
          {copied ? <Check aria-hidden="true" size={15} strokeWidth={1.5} className="text-success" /> : <Share2 aria-hidden="true" size={15} strokeWidth={1.5} />}
          {t(copied ? 'home.spots.copied' : 'home.spots.share')}
        </motion.button>
      </div>

      {/* Filas de información estructurada */}
      <dl className="divide-y divide-line border-t border-line text-sm">
        <div className="flex items-start gap-3 py-3">
          <MapPin aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
          <div className="grid gap-0.5">
            <dt className="text-xs text-ink-3">{t('home.spots.location')}</dt>
            <dd className="font-mono text-xs tabular-nums text-ink">
              {lat.toFixed(4)}, {lon.toFixed(4)} · {city.name}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-3 py-3">
          <Tag aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-3" />
          <div className="grid gap-0.5">
            <dt className="text-xs text-ink-3">{t('home.spots.category')}</dt>
            <dd className="text-ink">{categoryLabel}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3 py-3">
          <Info aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-3" />
          <div className="grid gap-0.5">
            <dt className="text-xs text-ink-3">{t('home.spots.source')}</dt>
            <dd className="text-xs text-ink-2">
              {t('places.provenance', { source: source?.name ?? t('places.unknownSource'), date: retrieved })}
              {source?.license ? ` · ${source.license}` : ''}
            </dd>
          </div>
        </div>
      </dl>
    </motion.div>
  );
}
