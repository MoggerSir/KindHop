import { useState } from 'react';
import { ArrowUpRight, ChevronDown, Compass, MapPin, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { poiName } from './searchPois.js';
import { usePois } from './usePois.js';

const TOURIST_ORDER = { beaches: 0, museums: 1, culture: 2, art: 3, parks: 4 };

// Dos tarjetas de acceso rápido en Inicio: Comercios locales y Puntos turísticos.
// Consumen los POI reales de `/api/cities/:cityId/pois` y abren una hoja desplegable plana con fuente y estado.
export function HomeSpotCards({ city }) {
  const { t, locale, has } = useI18n();
  const { status, pois, source, error, reload } = usePois(city);
  const [openKey, setOpenKey] = useState(null); // 'businesses' | 'tourist' | null

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

  return (
    <section aria-label={t('home.spots.sectionLabel')} className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ key, Icon, items }) => (
          <motion.button
            key={key}
            type="button"
            whileTap={press}
            aria-expanded={openKey === key}
            onClick={() => setOpenKey(key)}
            className="flex min-h-32 flex-col justify-between gap-3 rounded-card border border-line bg-surface p-4 text-left shadow-raised transition-[border-color,background-color,box-shadow] duration-150 hover:border-line-strong hover:bg-surface-hover hover:shadow-lifted"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
                <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
              </span>
              <ChevronDown aria-hidden="true" size={16} strokeWidth={1.5} className="mt-1 shrink-0 text-ink-3" />
            </div>
            <div className="grid gap-0.5">
              <span className="text-[0.9375rem] font-semibold leading-snug text-ink">
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
        onClose={() => setOpenKey(null)}
        title={active ? t(`home.spots.${active.key}.title`) : t('home.spots.sectionLabel')}
      >
        {active && (
          <div className="grid gap-3">
            {status === 'loading' && <LoadingState>{t('places.loading')}</LoadingState>}
            {status === 'error' &&
              (error.code === 'MODULE_UNAVAILABLE' ? (
                <EmptyState icon={MapPin}>{t('places.unavailable', { city: city.name })}</EmptyState>
              ) : (
                <ErrorState error={error} onRetry={reload} />
              ))}
            {status === 'ready' && (
              <>
                {source && (
                  <p className="flex flex-wrap items-center gap-2 text-xs text-ink-2">
                    <DataStatusBadge status={source.dataStatus} />
                    <span>{t('places.provenance', { source: source.name, date: retrieved })}</span>
                  </p>
                )}
                {active.items.length === 0 ? (
                  <EmptyState icon={active.Icon}>{t('home.spots.empty')}</EmptyState>
                ) : (
                  <ul className="divide-y divide-line">
                    {active.items.map((poi) => (
                      <li key={poi.id} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
                        <div className="grid min-w-0 gap-0.5">
                          <span className="truncate text-sm font-medium text-ink">{poiName(poi, locale)}</span>
                          <span className="text-xs text-ink-2">{label(poi.category)}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <DataStatusBadge status={poi.dataStatus} />
                          {(poi.url || source?.url) && (
                            <a
                              href={poi.url || source.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${poiName(poi, locale)} — ${t('places.openSource')}`}
                              className="grid size-11 place-items-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-tint hover:text-accent"
                            >
                              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </Sheet>
    </section>
  );
}
