import { useEffect, useId, useState } from 'react';
import { Layers } from 'lucide-react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { useDistricts } from './useDistricts.js';

// MapLibre pinta en canvas y no entiende clases: lee el token --color-accent del tema (#19).
function accentColor() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  return value || '#ccff00';
}

function formatRetrieved(iso, locale) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

/** Capa vectorial de zonas (alcaldías / supermanzanas) sobre MapLibre; solo si la ciudad tiene datos REAL. */
export function DistrictMapLayer({ city, map }) {
  const { t, locale } = useI18n();
  const moduleStatus = city.modules?.districts ?? 'UNAVAILABLE';
  const canUse = moduleStatus === 'IMPLEMENTED';
  const [layerOn, setLayerOn] = useState(true);
  const enabled = canUse && layerOn;
  const [selection, setSelection] = useState(null);
  const { status, data, error } = useDistricts(city, { enabled });
  const uid = useId().replace(/:/g, '');
  const sourceId = `districts-${uid}`;
  const fillId = `districts-fill-${uid}`;
  const lineId = `districts-line-${uid}`;

  const unavailable = !canUse;

  useEffect(() => {
    if (!map || !enabled || status !== 'ready' || !data) return undefined;
    const accent = accentColor();
    let attached = false;

    const onClick = (event) => {
      const feats = map.queryRenderedFeatures(event.point, { layers: [fillId] });
      const props = feats[0]?.properties;
      if (!props?.name) {
        setSelection(null);
        return;
      }
      setSelection({
        name: props.name,
        kind: props.kind,
        source: data.source,
      });
    };
    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    // CityMap entrega el mapa recién creado: si el estilo aún carga, addSource lanzaría "Style is not done loading".
    const attach = () => {
      if (attached) return;
      attached = true;
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getLayer(fillId)) map.removeLayer(fillId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, { type: 'geojson', data, promoteId: 'id' });
      map.addLayer({
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': accent,
          'fill-opacity': 0.14,
          'fill-outline-color': accent,
        },
      });
      map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': accent,
          'line-width': 1.2,
          'line-opacity': 0.85,
        },
      });

      map.on('click', fillId, onClick);
      map.on('mouseenter', fillId, onEnter);
      map.on('mouseleave', fillId, onLeave);
    };

    // isStyleLoaded() también espera teselas e iconos y puede no llegar si falla el mapa base;
    // addSource solo necesita el JSON del estilo. Se intenta ya y se reintenta en cada styledata.
    const tryAttach = () => {
      if (attached) return;
      try {
        attach();
      } catch {
        attached = false;
      }
    };
    tryAttach();
    map.on('load', tryAttach);
    map.on('styledata', tryAttach);

    return () => {
      map.off('load', tryAttach);
      map.off('styledata', tryAttach);
      map.off('click', fillId, onClick);
      map.off('mouseenter', fillId, onEnter);
      map.off('mouseleave', fillId, onLeave);
      map.getCanvas().style.cursor = '';
      if (map.getLayer(fillId)) map.removeLayer(fillId);
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, enabled, status, data, sourceId, fillId, lineId]);

  const toggleId = `district-toggle-${uid}`;

  return (
  <>
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
        <button
          id={toggleId}
          type="button"
          disabled={unavailable}
          aria-pressed={enabled && !unavailable}
          aria-label={t('discovery.districts.toggleLabel')}
          onClick={() => !unavailable && setLayerOn((v) => !v)}
          className={`flex min-h-11 min-w-11 self-start items-center justify-center rounded-control border shadow-raised ${
            unavailable
              ? 'cursor-not-allowed border-line bg-surface text-ink-3'
              : enabled
                ? 'border-accent/40 bg-surface text-accent'
                : 'border-line bg-surface text-ink hover:bg-surface-hover'
          }`}
        >
          <Layers size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        {unavailable && (
          <p className="max-w-[11rem] rounded-control border border-line bg-surface/95 px-2 py-1.5 text-[11px] leading-snug text-ink-2 shadow-raised">
            {t('discovery.districts.unavailableCity')}
          </p>
        )}
        {enabled && status === 'ready' && data?.source && (
          <p className="max-w-[11rem] rounded-control border border-line bg-surface/95 px-2 py-1 text-[11px] leading-snug text-ink-2 shadow-raised">
            {t('discovery.districts.credit', {
              attribution: data.source.attribution ?? data.source.name,
              license: data.source.license,
            })}
          </p>
        )}
        {enabled && !unavailable && status === 'loading' && (
          <p className="rounded-control border border-line bg-surface/95 px-2 py-1 text-[11px] text-ink-2">{t('common.loading')}</p>
        )}
        {enabled && error && (
          <p role="status" className="max-w-[11rem] rounded-control border border-line bg-surface px-2 py-1.5 text-[11px] text-danger">
            {t(`errors.${error.code ?? 'UNKNOWN'}`)}
          </p>
        )}
      </div>
      {selection && (
        <div
          role="dialog"
          aria-label={t('discovery.districts.sheetLabel', { name: selection.name })}
          className="absolute inset-x-3 bottom-3 z-10 rounded-sheet border border-line-strong bg-surface p-4 shadow-floating"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label text-ink-3">{t(`discovery.districts.kind.${selection.kind}`)}</p>
              <h4 className="title text-lg font-semibold text-ink">{selection.name}</h4>
            </div>
            <DataStatusBadge status={selection.source.dataStatus} />
          </div>
          <dl className="mt-3 grid gap-1 text-xs text-ink-2">
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium text-ink-3">{t('discovery.districts.sourceName')}</dt>
              <dd>{selection.source.name}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium text-ink-3">{t('discovery.districts.sourceLicense')}</dt>
              <dd>{selection.source.license}</dd>
            </div>
            {selection.source.retrievedAt && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-ink-3">{t('discovery.districts.retrievedAt')}</dt>
                <dd>{formatRetrieved(selection.source.retrievedAt, locale)}</dd>
              </div>
            )}
            {selection.source.url && (
              <div className="mt-1">
                <a
                  href={selection.source.url}
                  className="text-accent underline-offset-2 hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t('discovery.districts.sourceLink')}
                </a>
              </div>
            )}
          </dl>
          <button
            type="button"
            className="mt-3 min-h-11 w-full rounded-control border border-line px-3 text-sm text-ink hover:bg-surface-hover"
            onClick={() => setSelection(null)}
          >
            {t('common.close')}
          </button>
        </div>
      )}
    </>
  );
}