import { useEffect, useMemo, useState } from 'react';
import { useGeoJsonLayer } from './useGeoJsonLayer.js';
import { poisToGeoJson, routesToGeoJson, stopsToGeoJson } from './geo.js';
import { token } from './mapTheme.js';

// Iconos vectoriales mínimos por categoría de POI (comercios y puntos turísticos) registrados como sprites en MapLibre.
// Usan colores de los tokens del tema para mantener consistencia y evitar 100+ nodos DOM sobre el mapa.
const POI_SVG_PATHS = {
  markets: '<path d="M3 9l1.5-5h15L21 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 20v-6h6v6"/>',
  beaches: '<path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M12 4v4m-4-2 1.5 2M16 6l-1.5 2"/>',
  museums: '<path d="M3 20h18M5 20V10m4 10V10m6 10V10m4 10V10M2 10l10-6 10 6z"/>',
  parks: '<path d="M12 22v-5m0 0-5-5h3l-3-5h10l-3 5h3z"/>',
  sports: '<path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M14 4l6 6M4 14l6 6"/>',
  other: '<path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
};

function makePoiSvg(pathMarkup, bg, stroke, border) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="${bg}" stroke="${border}" stroke-width="3"/><g transform="translate(16 16)" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pathMarkup}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Las capas densas usan GeoJSON; los POI (comercios y puntos turísticos) dibujan icono por categoría.
export function DataLayers({ map, pois, routes, districts, enabled, onSelect, onClear, selection }) {
  const [iconsReady, setIconsReady] = useState(false);
  const poiData = useMemo(() => poisToGeoJson(pois), [pois]);
  const routeData = useMemo(() => routesToGeoJson(routes), [routes]);
  const stopData = useMemo(() => stopsToGeoJson(routes), [routes]);

  useEffect(() => {
    if (!map) return;
    let active = true;
    const bg = token('surface');
    const accent = token('accent');
    const ink = token('ink');
    const border = token('line-strong');
    const entries = Object.entries(POI_SVG_PATHS);
    let pending = entries.length;
    const done = () => {
      pending -= 1;
      if (pending === 0 && active) setIconsReady(true);
    };
    for (const [key, path] of entries) {
      const id = `kh-poi-${key}`;
      if (map.hasImage(id)) {
        done();
        continue;
      }
      const img = new Image(56, 56);
      img.onload = () => {
        if (active && !map.hasImage(id)) map.addImage(id, img, { pixelRatio: 2 });
        done();
      };
      img.onerror = done;
      img.src = makePoiSvg(path, bg, key === 'markets' ? accent : ink, key === 'markets' ? accent : border);
    }
    return () => { active = false; };
  }, [map]);

  const poiLayers = useMemo(() => [
    {
      id: 'kh-pois-dot',
      type: 'circle',
      paint: { 'circle-radius': 15, 'circle-opacity': 0.01, 'circle-color': token('accent') },
    },
    {
      id: 'kh-pois-icon',
      type: 'symbol',
      layout: {
        'icon-image': ['match', ['get', 'category'], 'markets', 'kh-poi-markets', 'beaches', 'kh-poi-beaches', 'museums', 'kh-poi-museums', 'parks', 'kh-poi-parks', 'sports', 'kh-poi-sports', 'kh-poi-other'],
        'icon-size': 1,
        'icon-allow-overlap': false,
        'icon-padding': 2,
      },
    },
  ], []);

  useGeoJsonLayer(iconsReady ? map : null, { id: 'kh-pois', data: poiData, visible: enabled.pois, layers: poiLayers });
  useGeoJsonLayer(map, { id: 'kh-transit', data: routeData, visible: enabled.transit, layers: [
    { id: 'kh-transit-line', type: 'line', paint: { 'line-width': 3, 'line-opacity': 0.8, 'line-color': ['coalesce', ['get', 'color'], token('map-transit')] } },
  ] });
  useGeoJsonLayer(map, { id: 'kh-transit-stops', data: stopData, visible: enabled.transit, layers: [
    { id: 'kh-transit-stop', type: 'circle', paint: { 'circle-radius': 4, 'circle-color': token('paper'), 'circle-stroke-color': ['coalesce', ['get', 'color'], token('map-transit')], 'circle-stroke-width': 2 } },
  ] });
  useGeoJsonLayer(map, { id: 'kh-districts', data: districts, visible: enabled.districts, layers: [
    { id: 'kh-districts-fill', type: 'fill', paint: { 'fill-color': token('ink-2'), 'fill-opacity': 0.12 } },
    { id: 'kh-districts-line', type: 'line', paint: { 'line-color': token('ink-2'), 'line-width': 1 } },
  ] });
  useEffect(() => {
    if (!map) return;
    const click = (event) => {
      if (event.originalEvent.target.closest('[data-map-pin]')) return;
      const ids = ['kh-pois-icon', 'kh-pois-dot', 'kh-transit-stop', 'kh-transit-line', 'kh-districts-fill'].filter((id) => map.getLayer(id));
      const feature = ids.length ? map.queryRenderedFeatures(event.point, { layers: ids })[0] : null;
      if (!feature) { onClear(); return; }
      const kind = feature.layer.id.startsWith('kh-pois') ? 'pois' : feature.layer.id.startsWith('kh-transit') ? 'transit' : 'districts';
      const items = kind === 'pois' ? pois : kind === 'transit' ? routes : districts?.features ?? [];
      const item = items.find((item) => String(item.id ?? item.properties.id) === String(feature.properties.routeId ?? feature.properties.id));
      if (item) onSelect(kind, item);
    };
    map.on('click', click);
    return () => map.off('click', click);
  }, [map, pois, routes, districts, onSelect, onClear]);
  useEffect(() => {
    if (!map) return;
    const id = String(selection?.item?.id ?? selection?.item?.properties?.id ?? '');
    if (map.getLayer('kh-pois-dot') && iconsReady) {
      map.setPaintProperty('kh-pois-dot', 'circle-opacity', ['case', ['==', ['to-string', ['get', 'id']], selection?.kind === 'pois' ? id : ''], 0.35, 0.01]);
      map.setPaintProperty('kh-pois-dot', 'circle-color', token('accent'));
    }
    for (const [layer, property, normal, chosen, kind] of [
      ['kh-transit-line', 'line-color', ['coalesce', ['get', 'color'], token('map-transit')], token('accent'), 'transit'],
      ['kh-districts-fill', 'fill-color', token('ink-2'), token('accent'), 'districts'],
    ]) {
      if (map.getLayer(layer)) map.setPaintProperty(layer, property, ['case', ['==', ['to-string', ['get', 'id']], selection?.kind === kind ? id : ''], chosen, normal]);
    }
  }, [map, selection, iconsReady]);
  return null;
}
