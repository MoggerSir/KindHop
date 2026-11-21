import { memo, useDeferredValue, useMemo, useState } from 'react';
import { ArrowUpRight, MapPin, SearchX } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { LocalAlternative } from './LocalAlternative.jsx';
import { poiName, searchPois } from './searchPois.js';
import { usePois } from './usePois.js';

const PLACE_PAGE = 24;

// Lugares y eventos comparten texto y categoría; cada fuente conserva su estado y procedencia.
export const PlaceResults = memo(function PlaceResults({ city, query, category }) {
  const { t, locale, has } = useI18n();
  const { status, pois, source, error, reload } = usePois(city);
  const [selected, setSelected] = useState(null);
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => {
    const label = (id) => (has(`discovery.categories.${id}`) ? t(`discovery.categories.${id}`) : t('places.otherCategory'));
    return searchPois(pois, { query: deferredQuery, category, locale, categoryLabel: label });
  }, [pois, deferredQuery, category, locale, t, has]);
  const label = (id) => (has(`discovery.categories.${id}`) ? t(`discovery.categories.${id}`) : t('places.otherCategory'));
  const filterKey = `${deferredQuery}\0${category ?? ''}`;
  const [page, setPage] = useState({ key: filterKey, shown: PLACE_PAGE });
  if (page.key !== filterKey) setPage({ key: filterKey, shown: PLACE_PAGE });
  const visible = results.slice(0, page.shown);
  const retrieved = source?.retrievedAt ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: city.timezone }).format(new Date(source.retrievedAt)) : t('places.unknownDate');

  return (
    <section aria-labelledby="places-title" aria-busy={status === 'loading'} className="grid min-w-0 gap-3">
      <h2 id="places-title" className="text-sm font-semibold text-ink">{t('places.title')}</h2>
      <p className="text-xs text-ink-2">{t('places.dateHint')}</p>
      {status === 'loading' && <LoadingState>{t('places.loading')}</LoadingState>}
      {status === 'error' && (error.code === 'MODULE_UNAVAILABLE'
        ? <EmptyState icon={MapPin}>{t('places.unavailable', { city: city.name })}</EmptyState>
        : <ErrorState error={error} onRetry={reload} />)}
      {status === 'ready' && (
        <>
          <p className="text-xs text-ink-2">{t('places.count', { count: results.length })}</p>
          {results.length === 0 && <EmptyState icon={SearchX}>{t(pois.length ? 'places.noResults' : 'places.empty')}</EmptyState>}
          <ul className="grid gap-2">
            {visible.map((poi) => (
              <li key={poi.id} className="[content-visibility:auto] [contain-intrinsic-size:auto_4.5rem]">
                <button type="button" onClick={() => setSelected(poi)} className="tap-press flex min-h-16 w-full min-w-0 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left hover:border-line-strong hover:bg-surface-hover">
                  <MapPin aria-hidden="true" size={20} strokeWidth={1.5} className="shrink-0 text-ink-2" />
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="font-medium break-words text-ink">{poiName(poi, locale)}</span>
                    <span className="text-xs break-words text-ink-2">{label(poi.category)}</span>
                  </span>
                  <DataStatusBadge status={poi.dataStatus} />
                </button>
              </li>
            ))}
          </ul>
          {page.shown < results.length && (
            // Mismo control «Ver más...» que Inicio y el Mapa (texto, estilo y pulsación de Motion): uno solo, al final.
            <motion.button
              type="button"
              whileTap={press}
              onClick={() => setPage((current) => ({ ...current, shown: current.shown + PLACE_PAGE }))}
              className="mx-auto inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink-3 transition-colors duration-150 hover:text-ink"
            >
              {t('events.seeMore')}
            </motion.button>
          )}
          {source && <p className="text-xs text-ink-2">{t('places.provenance', { source: source.name, date: retrieved })}</p>}
        </>
      )}
      <Sheet open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? poiName(selected, locale) : t('places.title')}>
        {selected && (
          <div className="grid min-w-0 justify-items-start gap-4 break-words">
            <DataStatusBadge status={selected.dataStatus} />
            <p className="text-sm text-ink-2">{label(selected.category)}</p>
            <p className="text-sm text-ink-2">{t('places.provenance', { source: source?.name ?? t('places.unknownSource'), date: retrieved })}</p>
            {source?.license && <p className="text-xs text-ink-2">{source.license}</p>}
            {(selected.url || source?.url) && <a href={selected.url || source.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-control text-sm text-accent underline underline-offset-4">{t('places.openSource')}<ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} /></a>}
            <div className="w-full"><LocalAlternative poi={selected} city={city} /></div>
          </div>
        )}
      </Sheet>
    </section>
  );
});
