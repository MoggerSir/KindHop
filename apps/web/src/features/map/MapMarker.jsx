import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Marker } from 'maplibre-gl';

// Marcador DOM de MapLibre cuyo contenido es React (portal). Solo para pocos elementos que se tocan con teclado
// (pines de evento, mi ubicación); las capas grandes (lugares, rutas, zonas) son GeoJSON en el lienzo.
export function MapMarker({ map, lngLat, front = false, children }) {
  const [element] = useState(() => document.createElement('div'));
  const [lon, lat] = lngLat;

  useEffect(() => {
    const marker = new Marker({ element, anchor: 'center' }).setLngLat([lon, lat]).addTo(map);
    return () => marker.remove();
  }, [map, element, lon, lat]);

  // El elegido va por encima de los demás pines (y su globo no queda tapado).
  useEffect(() => {
    element.style.zIndex = front ? '2' : '1';
  }, [element, front]);

  return createPortal(children, element);
}
