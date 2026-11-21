import { useState } from 'react';
import { ArrowUpRight, Check, Compass, Info, Landmark, MapPin, Share2, Store, Tag, Trees, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { StarRating } from '@/shared/components/StarRating.jsx';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { poiName } from './searchPois.js';

const CATEGORY_ICON = {
  markets: Store,
  beaches: Waves,
  museums: Landmark,
  parks: Trees,
  culture: Landmark,
  art: Compass,
};

// Tarjeta de detalle de un lugar (POI) con la misma estética que las fichas de Inicio:
// foto superior, estado, título, estrellas, datos estructurados y acciones (compartir y fuente).
export function PlaceDetailSheet({ poi, city, source, onClose }) {
  const { t, locale, has } = useI18n();
  const [copied, setCopied] = useState(false);

  const label = (id) => (has(`discovery.categories.${id}`) ? t(`discovery.categories.${id}`) : t('places.otherCategory'));
  const retrieved = source?.retrievedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: city.timezone }).format(new Date(source.retrievedAt))
    : t('places.unknownDate');

  const Icon = (poi && CATEGORY_ICON[poi.category]) ?? MapPin;

  const sharePlace = async () => {
    if (!poi) return;
    const text = [poiName(poi, locale), poi.url || source?.url].filter(Boolean).join(' · ');
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles: no bloquea la ficha.
    }
  };

  return (
    <Sheet open={Boolean(poi)} onClose={onClose} title={poi ? poiName(poi, locale) : t('places.title')}>
      {poi && (
        <div className="grid gap-4">
          <div className="relative overflow-hidden rounded-card border border-line bg-sunk shadow-sunk">
            {poi.imageUrl ? (
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={poi.imageUrl}
                  alt={''}
                  aria-hidden="true"
                  className="size-full object-cover outline-1 -outline-offset-1 outline-image-edge"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-sunk via-sunk/20 to-transparent" />
              </div>
            ) : (
              <div className="grid h-28 place-items-center text-ink-3">
                <Icon aria-hidden="true" size={32} strokeWidth={1.5} />
              </div>
            )}
            <div className={`relative flex items-start gap-3.5 p-4 ${poi.imageUrl ? '-mt-7' : ''}`}>
              <span className="grid size-12 shrink-0 place-items-center rounded-control border border-line bg-surface text-accent shadow-raised">
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
              </span>
              <div className="grid min-w-0 justify-items-start gap-1.5">
                <DataStatusBadge status={poi.dataStatus} />
                <h3 className="text-xl leading-tight font-semibold text-balance text-ink">{poiName(poi, locale)}</h3>
                <StarRating rating={poi.rating} count={poi.ratingCount} />
              </div>
            </div>
          </div>

          <dl className="grid gap-3 rounded-card border border-line bg-paper/60 p-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
              <div className="grid gap-0.5">
                <dt className="text-xs text-ink-3">{t('home.spots.location')}</dt>
                <dd className="font-mono text-xs tabular-nums text-ink">
                  {poi.coordinates[1].toFixed(4)}, {poi.coordinates[0].toFixed(4)} · {city.name}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-line pt-3">
              <Tag aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-3" />
              <div className="grid gap-0.5">
                <dt className="text-xs text-ink-3">{t('home.spots.category')}</dt>
                <dd className="text-ink">{label(poi.category)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-line pt-3">
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

          <div className="flex flex-wrap gap-2">
            <motion.button
              type="button"
              whileTap={press}
              onClick={sharePlace}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-on-accent shadow-solid transition-colors duration-150 hover:bg-accent-hover"
            >
              {copied ? <Check aria-hidden="true" size={16} strokeWidth={1.5} /> : <Share2 aria-hidden="true" size={16} strokeWidth={1.5} />}
              {t(copied ? 'home.spots.copied' : 'home.spots.share')}
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
          </div>
        </div>
      )}
    </Sheet>
  );
}
