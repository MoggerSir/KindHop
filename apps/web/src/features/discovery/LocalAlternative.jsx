import { HandCoins, Store } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useResource } from '@/shared/hooks/useResource.js';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, stageItem, stagger } from '@/shared/motion/motion.js';
import { fetchSuggestions } from './suggestions.api.js';

const SHOWN = 3;

// Gasto local (KH-020): si el lugar es de una cadena según OSM, propone negocios cercanos sin marca de cadena
// y muestra por qué, la fuente y la confianza que da la API. Sin cadena no se pide nada.
export function LocalAlternative({ poi, city }) {
  if (poi.isChain !== true) return null;
  return <LocalAlternativeList poi={poi} city={city} />;
}

function LocalAlternativeList({ poi, city }) {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const item = reduce ? fadeOnly : stageItem;
  const { status, data } = useResource(fetchSuggestions, { cityId: city.id, placeId: poi.id, lang: locale });
  const list = (data?.suggestions ?? []).slice(0, SHOWN);

  return (
    <section aria-labelledby="local-alt-title" className="grid min-w-0 gap-3 rounded-card border border-line bg-surface p-4 shadow-raised">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
          <HandCoins aria-hidden="true" size={18} strokeWidth={1.5} />
        </span>
        <div className="grid min-w-0 gap-0.5">
          <h4 id="local-alt-title" className="text-sm font-semibold text-balance break-words text-ink">{t('local.title')}</h4>
          <p className="text-xs text-pretty break-words text-ink-2">{t('local.chainNotice', { brand: poi.brand ?? t('local.unknownBrand') })}</p>
        </div>
      </div>
      {status === 'loading' && <p className="text-xs text-ink-3" role="status">{t('local.loading')}</p>}
      {status === 'error' && <p className="text-xs text-ink-2" role="status">{t('local.error')}</p>}
      {status === 'ready' && list.length === 0 && <p className="text-xs text-ink-2">{t('local.none')}</p>}
      {list.length > 0 && (
        <motion.ul variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-2">
          {list.map((s) => (
            <motion.li key={s.placeId} variants={item} className="grid min-w-0 gap-1.5 rounded-control border border-line bg-paper/60 p-3">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-ink">
                  <Store aria-hidden="true" size={15} strokeWidth={1.5} className="shrink-0 text-accent" />
                  <span className="truncate">{s.title}</span>
                </span>
                <span className="shrink-0"><DataStatusBadge status={s.dataStatus} /></span>
              </div>
              <p className="text-xs text-pretty break-words text-ink-2">{s.why}</p>
              <p className="text-[11px] break-words text-ink-3">
                {t('local.meta', { source: s.source, confidence: t(`local.confidence.${s.confidence}`) })}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}
