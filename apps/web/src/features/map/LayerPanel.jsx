import { useEffect, useId, useRef } from 'react';
import { Layers, RotateCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { OsmAttribution } from '@/features/discovery';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { press, spring } from '@/shared/motion/motion.js';

// Muestra de la leyenda: la misma forma y color que la capa en el mapa.
const SWATCH = {
  events: <span className="size-3.5 rounded-full border-2 border-paper bg-ink shadow-raised" />,
  pois: <span className="size-2.5 rounded-full border border-paper bg-ink-2" />,
  transit: <span className="h-1 w-4 rounded-full bg-map-transit" />,
  districts: <span className="size-3.5 border border-ink-2 bg-tint" />,
};

function formatDate(iso, locale) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

// Botón "Capas" + panel desplegable (no modal: el mapa sigue usable). Cada capa: interruptor con aria-pressed,
// leyenda, cuántos elementos hay, procedencia (REAL/DEMO, fuente, licencia, fecha) y su estado de carga, error o vacío.
// Escape o tocar fuera lo cierran; al cerrarse vuelve el foco al botón.
export function LayerPanel({ city, layers, open, onOpenChange, onToggle }) {
  const { t, locale, has } = useI18n();
  const panelId = useId();
  const titleId = useId();
  const root = useRef(null);
  const trigger = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!root.current?.contains(event.target)) onOpenChange(false);
    };
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
      trigger.current?.focus();
    };
    // Captura: el lienzo del mapa se queda el Escape en burbuja y el panel no se cerraría.
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey, true); };
  }, [open, onOpenChange]);

  const close = () => {
    onOpenChange(false);
    trigger.current?.focus();
  };

  const activeCount = layers.filter((l) => l.on && l.status !== 'unavailable').length;

  return (
    <div ref={root} className="relative flex flex-col items-end">
      <motion.button
        ref={trigger}
        type="button"
        whileTap={press}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium shadow-floating transition-colors duration-150 ${
          open ? 'border-accent bg-accent text-on-accent shadow-solid' : 'border-line-strong bg-surface text-ink hover:bg-surface-hover'
        }`}
      >
        <Layers aria-hidden="true" size={16} strokeWidth={1.5} />
        {t('map.layers.button')}
        <span className={`font-mono text-xs tabular-nums ${open ? 'text-on-accent' : 'text-ink-2'}`}>{activeCount}</span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.section
            id={panelId}
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: spring.snappy }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15, ease: 'easeOut' } }}
            className="absolute top-full right-0 z-30 mt-2 max-h-[min(32rem,calc(100dvh-14rem-env(safe-area-inset-bottom)))] w-[min(21rem,calc(100cqw-1.5rem-env(safe-area-inset-left)-env(safe-area-inset-right)))] min-w-0 overflow-y-auto overscroll-contain rounded-card border border-line-strong bg-surface p-2 shadow-floating"
          >
            <header className="flex min-w-0 items-center justify-between gap-3 pl-2">
              <h2 id={titleId} className="title min-w-0 text-base font-semibold text-balance break-words text-ink">
                {t('map.layers.title', { city: city.name })}
              </h2>
              <button type="button" onClick={close} aria-label={t('common.close')} className="grid size-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-tint hover:text-ink">
                <X aria-hidden="true" size={18} strokeWidth={1.5} />
              </button>
            </header>
            <ul className="grid gap-1">
              {layers.map((layer) => {
                const unavailable = layer.status === 'unavailable';
                const errorKey = `errors.${layer.error?.code}`;
                return (
                  <li key={layer.id} className="rounded-control">
                    <button
                      type="button"
                      onClick={() => onToggle(layer.id)}
                      disabled={unavailable}
                      aria-pressed={unavailable ? undefined : layer.on}
                      className="flex min-h-12 w-full items-center gap-3 rounded-control px-2 text-left transition-colors duration-150 enabled:hover:bg-surface-hover disabled:cursor-not-allowed"
                    >
                      <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center">
                        {SWATCH[layer.id]}
                      </span>
                      <span className={`min-w-0 flex-1 text-sm font-medium break-words ${unavailable ? 'text-ink-3' : 'text-ink'}`}>{t(`cities.modules.${layer.id}`)}</span>
                      <span className="font-mono text-xs text-ink-2 tabular-nums">
                        {unavailable
                          ? t('map.layers.unavailable')
                          : layer.status === 'loading'
                            ? t('common.loading')
                            : layer.status === 'ready'
                              ? t('map.layers.count', { count: layer.count })
                              : null}
                      </span>
                      {!unavailable && (
                        <span aria-hidden="true" className={`relative h-5 w-8 shrink-0 rounded-full border transition-colors duration-150 ${layer.on ? 'border-accent bg-accent' : 'border-line-strong bg-sunk'}`}>
                          <span className={`absolute top-0.5 size-3.5 rounded-full transition-transform duration-150 ${layer.on ? 'translate-x-3.5 bg-on-accent' : 'translate-x-0.5 bg-ink-2'}`} />
                        </span>
                      )}
                    </button>
                    <div className="grid gap-1 px-2 pb-2 pl-10 text-xs text-ink-2">
                      {unavailable && <p>{t(`map.layers.why.${layer.id}`, { city: city.name })}</p>}
                      {layer.status === 'error' && (
                        <div role="alert" className="flex flex-wrap items-center gap-x-3">
                          <p className="text-danger">{t(has(errorKey) ? errorKey : 'errors.UNKNOWN')}</p>
                          <button type="button" onClick={layer.reload} className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current">
                            <RotateCw aria-hidden="true" size={13} strokeWidth={1.5} />
                            {t('common.retry')}
                          </button>
                        </div>
                      )}
                      {layer.status === 'ready' && layer.source && (
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <DataStatusBadge status={layer.source.dataStatus} />
                          <span>
                            {[layer.source.name, layer.source.license, formatDate(layer.source.retrievedAt, locale) && t('map.layers.asOf', { date: formatDate(layer.source.retrievedAt, locale) })]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </p>
                      )}
                      {layer.status === 'ready' && layer.count === 0 && <p>{t(`map.layers.empty.${layer.id}`)}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line px-2 pt-1">
              <OsmAttribution />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
