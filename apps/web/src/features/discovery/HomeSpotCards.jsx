import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Compass, MapPin, Store } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { StarRating } from '@/shared/components/StarRating.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, press } from '@/shared/motion/motion.js';
import { CATEGORY_ICON_BY_ID } from './categories.js';
import { PlaceDetailBody } from './PlaceDetailSheet.jsx';
import { poiName } from './searchPois.js';
import { IllustrativePhotoTag } from './IllustrativePhotoTag.jsx';
import { isIllustrative } from './photo.js';
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

// Dos tarjetas de acceso rápido en Inicio: Comercios locales y Puntos turísticos.
// Reutiliza `PlaceDetailBody` al abrir un lugar para mantener una única fuente de verdad de la ficha.
export function HomeSpotCards({ city, onOpenMap }) {
  const { t, locale, has } = useI18n();
  const { status, pois, source, error, reload } = usePois(city);
  const [openKey, setOpenKey] = useState(null);
  const [chipId, setChipId] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);

  const cardsByKey = useMemo(() => {
    const businesses = [];
    const tourist = [];
    for (const p of pois) {
      if (p.category === 'markets') businesses.push(p);
      else if (p.category in TOURIST_ORDER) tourist.push(p);
    }
    tourist.sort((a, b) => TOURIST_ORDER[a.category] - TOURIST_ORDER[b.category]);
    return {
      businesses: { key: 'businesses', Icon: Store, items: businesses },
      tourist: { key: 'tourist', Icon: Compass, items: tourist },
    };
  }, [pois]);

  const active = openKey ? cardsByKey[openKey] : null;
  const label = (id) => (has(`discovery.categories.${id}`) ? t(`discovery.categories.${id}`) : t('places.otherCategory'));
  const retrieved = source?.retrievedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: city.timezone }).format(new Date(source.retrievedAt))
    : t('places.unknownDate');

  const closeSheet = () => {
    setOpenKey(null);
    setSelected(null);
    setChipId('all');
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section aria-label={t('home.spots.sectionLabel')} className="grid gap-3">
      <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">
        {[cardsByKey.businesses, cardsByKey.tourist].map(({ key, Icon, items }) => (
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
            className="flex min-h-32 min-w-0 flex-col justify-between gap-3 rounded-card border border-line bg-surface p-4 text-left shadow-raised transition-[border-color,background-color,box-shadow] duration-150 hover:border-line-strong hover:bg-surface-hover hover:shadow-lifted"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
                <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
              </span>
              <ChevronDown aria-hidden="true" size={16} strokeWidth={1.5} className="mt-1 shrink-0 text-ink-3" />
            </div>
            <div className="grid gap-0.5">
              <span className="break-words text-[0.9375rem] leading-snug font-semibold text-ink">
                {t(`home.spots.${key}.title`)}
              </span>
              <span className="break-words text-xs text-ink-2">
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
              <motion.div key={`detail-${selected.id}`} variants={fadeOnly} initial="hidden" animate="visible" exit="exit">
                <PlaceDetailBody
                  poi={selected}
                  city={city}
                  source={source}
                  onBack={() => setSelected(null)}
                  onOpenMap={() => {
                    const target = selected;
                    closeSheet();
                    onOpenMap?.(target);
                  }}
                />
              </motion.div>
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
                          <ul className="grid min-w-0 gap-2.5 [&>li]:min-w-0">
                            {visible.map((poi) => {
                              const RowIcon = CATEGORY_ICON_BY_ID[poi.category] ?? active.Icon;
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
                                      {isIllustrative(poi) && <IllustrativePhotoTag compact />}
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
