import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useI18n } from '@/shared/i18n';

// MapLibre 6 calcula la URL de su worker en tiempo de ejecución y Vite no la detecta (ni en dev ni en build):
// sin esto el mapa queda en blanco con "Worker failed to load". `?url` hace que Vite sirva y empaquete el worker.
setWorkerUrl(workerUrl);

// Estilo vectorial sin API key. Modo oscuro para coincidir con la nueva identidad.
const STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/dark';

// Un solo mapa durante toda la sesión: cambiar de ciudad vuela al nuevo centro, no recrea el mapa.
export function CityMap({ city, mapOverlay }) {
  const { t } = useI18n();
  const container = useRef(null);
  const map = useRef(null);
  const [mapReady, setMapReady] = useState(null);
  const [baseMapFailed, setBaseMapFailed] = useState(false);
  const [lon, lat] = city.center;

  useEffect(() => {
    const instance = new MapLibreMap({
      container: container.current,
      style: STYLE_URL,
      center: [lon, lat],
      zoom: city.zoom,
      attributionControl: { compact: true },
    });
    // Si las teselas o el estilo no cargan (sin red, proveedor caído) se avisa en vez de dejar un lienzo vacío.
    instance.on('error', () => setBaseMapFailed(true));
    instance.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.current = instance;
    setMapReady(instance);
    return () => {
      setMapReady(null);
      instance.remove();
    };
    // Solo al montar: los cambios de ciudad se animan en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MapLibre no permite cambiar su idioma en caliente: las etiquetas de su lienzo y botones se ponen desde el JSON.
  // El botón de atribución vive fuera del contenedor del lienzo, por eso se busca desde el padre.
  useEffect(() => {
    const root = container.current;
    const labels = [
      ['.maplibregl-canvas', 'map.canvasLabel'],
      ['.maplibregl-ctrl-zoom-in', 'map.zoomIn'],
      ['.maplibregl-ctrl-zoom-out', 'map.zoomOut'],
      ['.maplibregl-ctrl-attrib-button', 'map.toggleAttribution'],
    ];
    for (const [selector, key] of labels) {
      const element = root?.parentElement?.querySelector(selector);
      if (element?.hasAttribute('title')) element.setAttribute('title', t(key));
      element?.setAttribute('aria-label', t(key));
    }
  }, [t]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.current?.flyTo({ center: [lon, lat], zoom: city.zoom, animate: !reduce, duration: 1200 });
  }, [lon, lat, city.zoom]);

  return (
    <div role="region" aria-label={t('map.regionLabel', { city: city.name })} className="relative h-full min-h-[320px] w-full overflow-hidden rounded-card border border-line shadow-raised">
      {/* maplibre-gl.css fuerza position:relative en el contenedor: usar h-full, no absolute. */}
      <div ref={container} className="h-full w-full" />
      {typeof mapOverlay === 'function' ? mapOverlay(mapReady) : mapOverlay}
      {baseMapFailed && (
        <p role="status" className="absolute inset-x-3 bottom-3 rounded-control border border-line bg-surface px-3 py-2 text-xs text-ink-2 shadow-raised">
          {t('map.baseMapFailed')}
        </p>
      )}
    </div>
  );
}
