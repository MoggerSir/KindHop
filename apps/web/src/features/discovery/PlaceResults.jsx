import { useState } from 'react';
import { ArrowUpRight, MapPin, SearchX } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, press } from '@/shared/motion/motion.js';
import { poiName, searchPois } from './searchPois.js';
import { usePois } from './usePois.js';

// Lugares y eventos comparten texto y categoría; cada fuente conserva su estado y procedencia.
export function PlaceResults({ city, query, category }) {
  const { t, locale, has } = useI18n();
  const { status, pois, source, error, reload } = usePois(city);
  const [selected, setSelected] = useState(null);
  const label = (id) => has(`discovery.categories.${id}`) ? t(`discovery.categories.${id}`) : t('places.otherCategory');
  const results = searchPois(pois, { query, category, locale, categoryLabel: label });
  const retrieved = source?.retrievedAt ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: city.timezone }).format(new Date(source.retrievedAt)) : t('places.unknownDate');

  return (
    <section aria-labelledby="places-title" aria-busy={status === 'loading'} className="grid gap-3">
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
            {results.map((poi) => (
              <li key={poi.id}>
                <motion.button type="button" whileTap={press} variants={fadeOnly} initial={false} animate="visible" onClick={() => setSelected(poi)} className="flex min-h-16 w-full items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover">
                  <MapPin aria-hidden="true" size={20} strokeWidth={1.5} className="shrink-0 text-ink-2" />
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="font-medium text-ink">{poiName(poi, locale)}</span>
                    <span className="text-xs text-ink-2">{label(poi.category)}</span>
                  </span>
                  <DataStatusBadge status={poi.dataStatus} />
                </motion.button>
              </li>
            ))}
          </ul>
          {source && <p className="text-xs text-ink-2">{t('places.provenance', { source: source.name, date: retrieved })}</p>}
        </>
      )}
      <Sheet open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? poiName(selected, locale) : t('places.title')}>
        {selected && (
          <div className="grid justify-items-start gap-4">
            <DataStatusBadge status={selected.dataStatus} />
            <p className="text-sm text-ink-2">{label(selected.category)}</p>
            <p className="text-sm text-ink-2">{t('places.provenance', { source: source?.name ?? t('places.unknownSource'), date: retrieved })}</p>
            {source?.license && <p className="text-xs text-ink-2">{source.license}</p>}
            {(selected.url || source?.url) && <a href={selected.url || source.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-control text-sm text-accent underline underline-offset-4">{t('places.openSource')}<ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} /></a>}
          </div>
        )}
      </Sheet>
    </section>
  );
}
