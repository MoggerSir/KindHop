import { useEffect, useRef, useState } from 'react';
import { AttributionControl, Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useI18n } from '@/shared/i18n';
import { mapPixelRatio, prefersReducedMotion } from './mapTheme.js';

// MapLibre 6 calcula la URL de su worker en tiempo de ejecución y Vite no la detecta (ni en dev ni en build):
// sin esto el mapa queda en blanco con "Worker failed to load". `?url` hace que Vite sirva y empaquete el worker.
setWorkerUrl(workerUrl);

// Estilo vectorial oscuro de OpenFreeMap, sin API key (docs/06-data/sources.md). Nunca teselas de tile.openstreetmap.org.
const STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/dark';

// Un solo mapa durante toda la sesión: cambiar de ciudad vuela al nuevo centro, no recrea el mapa.
// `onReady(map)` entrega la instancia a quien pinta capas y controles; `children` se dibuja encima del lienzo.
// `padding` deja hueco a paneles que tapan el mapa (panel lateral en escritorio) para centrar en la zona visible.
export function CityMap({ city, onReady, padding, children }) {
  const { t } = useI18n();
  const container = useRef(null);
  const map = useRef(null);
  const [baseMapFailed, setBaseMapFailed] = useState(false);
  const [lon, lat] = city.center;

  useEffect(() => {
    const instance = new MapLibreMap({
      container: container.current,
      style: STYLE_URL,
      center: [lon, lat],
      zoom: city.zoom,
      attributionControl: false,
      pixelRatio: mapPixelRatio(),
    });
    // Atribución del estilo (OpenFreeMap · OpenMapTiles · © OpenStreetMap) siempre en el lienzo, compacta.
    instance.addControl(new AttributionControl({ compact: true }), 'top-left');
    // Si el estilo o las teselas no cargan (sin red, proveedor caído) se avisa en vez de dejar un lienzo vacío.
    instance.on('error', () => setBaseMapFailed(true));
    map.current = instance;
    onReady?.(instance);
    return () => {
      onReady?.(null);
      instance.remove();
    };
    // Solo al montar: los cambios de ciudad se animan en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MapLibre no permite cambiar su idioma en caliente: las etiquetas de su lienzo y botones se ponen desde el JSON.
  useEffect(() => {
    const root = container.current;
    const labels = [
      ['.maplibregl-canvas', 'map.canvasLabel'],
      ['.maplibregl-ctrl-attrib-button', 'map.toggleAttribution'],
    ];
    for (const [selector, key] of labels) {
      const element = root?.querySelector(selector);
      if (element?.hasAttribute('title')) element.setAttribute('title', t(key));
      element?.setAttribute('aria-label', t(key));
    }
  }, [t]);

  const paddingKey = JSON.stringify(padding ?? null);
  useEffect(() => {
    if (padding) map.current?.setPadding(padding);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paddingKey]);

  useEffect(() => {
    map.current?.flyTo({ center: [lon, lat], zoom: city.zoom, animate: !prefersReducedMotion(), duration: 1200 });
  }, [lon, lat, city.zoom]);

  return (
    <div role="region" aria-label={t('map.regionLabel', { city: city.name })} className="relative size-full overflow-hidden bg-paper">
      {/* maplibre-gl.css fuerza position:relative en el contenedor: usar size-full, no absolute. */}
      <div ref={container} className="size-full" />
      {children}
      {baseMapFailed && (
        <p role="status" className="absolute inset-x-3 top-20 z-10 mx-auto max-w-sm rounded-control border border-line bg-surface px-3 py-2 text-xs text-ink-2 shadow-raised">
          {t('map.baseMapFailed')}
        </p>
      )}
    </div>
  );
}
