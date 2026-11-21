import { useEffect, useMemo } from 'react';
import { useGeoJsonLayer } from './useGeoJsonLayer.js';
import { poisToGeoJson, routesToGeoJson } from './geo.js';
import { token } from './mapTheme.js';

// Las capas densas usan GeoJSON; la lista ofrece la misma selección mediante teclado.
export function DataLayers({ map, pois, routes, districts, enabled, onSelect, onClear, selection }) {
  const poiData = useMemo(() => poisToGeoJson(pois), [pois]);
  const routeData = useMemo(() => routesToGeoJson(routes), [routes]);
  useGeoJsonLayer(map, { id: 'kh-pois', data: poiData, visible: enabled.pois, layers: [
    { id: 'kh-pois-dot', type: 'circle', paint: { 'circle-radius': 5, 'circle-color': token('ink-2'), 'circle-stroke-width': 1, 'circle-stroke-color': token('paper') } },
  ] });
  useGeoJsonLayer(map, { id: 'kh-transit', data: routeData, visible: enabled.transit, layers: [
    { id: 'kh-transit-line', type: 'line', paint: { 'line-width': 2, 'line-opacity': 0.75, 'line-color': token('map-transit') } },
  ] });
  useGeoJsonLayer(map, { id: 'kh-districts', data: districts, visible: enabled.districts, layers: [
    { id: 'kh-districts-fill', type: 'fill', paint: { 'fill-color': token('ink-2'), 'fill-opacity': 0.12 } },
    { id: 'kh-districts-line', type: 'line', paint: { 'line-color': token('ink-2'), 'line-width': 1 } },
  ] });
  useEffect(() => {
    if (!map) return;
    const click = (event) => {
      if (event.originalEvent.target.closest('[data-map-pin]')) return;
      const ids = ['kh-pois-dot', 'kh-transit-line', 'kh-districts-fill'].filter((id) => map.getLayer(id));
      const feature = ids.length ? map.queryRenderedFeatures(event.point, { layers: ids })[0] : null;
      if (!feature) { onClear(); return; }
      const kind = feature.layer.id.startsWith('kh-pois') ? 'pois' : feature.layer.id.startsWith('kh-transit') ? 'transit' : 'districts';
      const items = kind === 'pois' ? pois : kind === 'transit' ? routes : districts?.features ?? [];
      const item = items.find((item) => String(item.id ?? item.properties.id) === String(feature.properties.id));
      if (item) onSelect(kind, item);
    };
    map.on('click', click);
    return () => map.off('click', click);
  }, [map, pois, routes, districts, onSelect, onClear]);
  useEffect(() => {
    if (!map) return;
    const id = String(selection?.item?.id ?? selection?.item?.properties?.id ?? '');
    for (const [layer, property, normal, chosen, kind] of [
      ['kh-pois-dot', 'circle-color', token('ink-2'), token('accent'), 'pois'],
      ['kh-transit-line', 'line-color', token('map-transit'), token('accent'), 'transit'],
      ['kh-districts-fill', 'fill-color', token('ink-2'), token('accent'), 'districts'],
    ]) {
      if (map.getLayer(layer)) map.setPaintProperty(layer, property, ['case', ['==', ['to-string', ['get', 'id']], selection?.kind === kind ? id : ''], chosen, normal]);
    }
  }, [map, selection]);
  return null;
}
