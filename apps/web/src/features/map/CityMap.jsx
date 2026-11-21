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

const NO_ROUTES = [];
const EMPTY_COLLECTION = { type: 'FeatureCollection', features: [] };
const ACCENT = '#ccff00';

function lineCollection(routes) {
  return {
    type: 'FeatureCollection',
    features: routes.map((route) => ({
      type: 'Feature',
      properties: { id: route.id, name: route.name, color: route.color ?? null },
      geometry: route.geometry,
    })),
  };
}

function stopCollection(routes) {
  return {
    type: 'FeatureCollection',
    features: routes.flatMap((route) =>
      (route.stops ?? []).map((stop) => ({
        type: 'Feature',
        properties: { id: stop.id, name: stop.name, color: route.color ?? null },
        geometry: { type: 'Point', coordinates: stop.coordinates },
      })),
    ),
  };
}

function coordinatePairs(routes) {
  const pairs = [];
  for (const route of routes) {
    const { geometry } = route;
    if (geometry?.type === 'LineString') pairs.push(...geometry.coordinates);
    else if (geometry?.type === 'MultiLineString') {
      for (const line of geometry.coordinates) pairs.push(...line);
    }
    for (const stop of route.stops ?? []) pairs.push(stop.coordinates);
  }
  return pairs.filter((pair) => Array.isArray(pair) && pair.length >= 2);
}

function boundsOf(routes) {
  const pairs = coordinatePairs(routes);
  if (pairs.length === 0) return null;
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of pairs) {
    minLon = Math.min(minLon, lon);
    minLat = Math.min(minLat, lat);
    maxLon = Math.max(maxLon, lon);
    maxLat = Math.max(maxLat, lat);
  }
  return [[minLon, minLat], [maxLon, maxLat]];
}

function ensureTransitLayers(instance) {
  if (instance.getSource('kindhop-transit-routes')) return;
  instance.addSource('kindhop-transit-routes', { type: 'geojson', data: EMPTY_COLLECTION });
  instance.addSource('kindhop-transit-stops', { type: 'geojson', data: EMPTY_COLLECTION });
  instance.addLayer({
    id: 'kindhop-transit-line',
    type: 'line',
    source: 'kindhop-transit-routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['coalesce', ['get', 'color'], ACCENT],
      'line-width': 4,
      'line-opacity': 0.95,
    },
  });
  instance.addLayer({
    id: 'kindhop-transit-stops',
    type: 'circle',
    source: 'kindhop-transit-stops',
    paint: {
      'circle-radius': 4,
      'circle-color': '#09090b',
      'circle-stroke-color': ['coalesce', ['get', 'color'], ACCENT],
      'circle-stroke-width': 2,
    },
  });
}

// Un solo mapa durante toda la sesión: cambiar de ciudad vuela al nuevo centro, no recrea el mapa.
// `routes` es GeoJSON ya normalizado (vacío en ciudades sin transporte).
export function CityMap({ city, routes = NO_ROUTES }) {
  const { t } = useI18n();
  const container = useRef(null);
  const map = useRef(null);
  const [baseMapFailed, setBaseMapFailed] = useState(false);
  const fitted = useRef('');
  const [lon, lat] = city.center;
  const transitKey = routes.map((route) => `${route.id}:${route.color ?? ''}:${route.stops?.length ?? 0}:${route.geometry?.coordinates?.length ?? 0}`).join('|');

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
    return () => instance.remove();
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

  useEffect(() => {
    const instance = map.current;
    if (!instance) return undefined;
    let cancelled = false;
    // `load` ya ocurrió al crear el mapa. Durante el vuelo a otra ciudad `isStyleLoaded()`
    // puede ser false y ese evento no se repite: hay que reintentar en `idle`.
    const apply = () => {
      if (cancelled || !instance.getStyle() || !instance.isStyleLoaded()) return false;
      ensureTransitLayers(instance);
      instance.getSource('kindhop-transit-routes').setData(routes.length ? lineCollection(routes) : EMPTY_COLLECTION);
      instance.getSource('kindhop-transit-stops').setData(routes.length ? stopCollection(routes) : EMPTY_COLLECTION);
      if (!routes.length) {
        fitted.current = '';
        return true;
      }
      const bounds = boundsOf(routes);
      if (!bounds || fitted.current === transitKey) return true;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      instance.fitBounds(bounds, { padding: 48, maxZoom: 13, animate: !reduce, duration: reduce ? 0 : 900 });
      fitted.current = transitKey;
      return true;
    };
    const retry = () => {
      if (apply()) instance.off('idle', retry);
    };
    if (!apply()) instance.on('idle', retry);
    return () => {
      cancelled = true;
      instance.off('idle', retry);
    };
  }, [routes, transitKey]);

  return (
    <div role="region" aria-label={t('map.regionLabel', { city: city.name })} className="relative h-full min-h-[320px] w-full overflow-hidden rounded-card border border-line shadow-raised">
      {/* maplibre-gl.css fuerza position:relative en el contenedor: usar h-full, no absolute. */}
      <div ref={container} className="h-full w-full" />
      {baseMapFailed && (
        <p role="status" className="absolute inset-x-3 bottom-3 rounded-control border border-line bg-surface px-3 py-2 text-xs text-ink-2 shadow-raised">
          {t('map.baseMapFailed')}
        </p>
      )}
    </div>
  );
}
