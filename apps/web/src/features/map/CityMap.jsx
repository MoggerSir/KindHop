import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Estilo vectorial sin API key. La atribución la aporta el propio estilo (OpenFreeMap / OpenMapTiles / OSM).
const STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty';

// Un solo mapa durante toda la sesión: cambiar de ciudad vuela al nuevo centro, no recrea el mapa.
export function CityMap({ city }) {
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

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.current?.flyTo({ center: [lon, lat], zoom: city.zoom, animate: !reduce, duration: 1200 });
  }, [lon, lat, city.zoom]);

  return (
    <div role="region" aria-label={`Mapa de ${city.name}`} className="relative h-full min-h-[360px] w-full overflow-hidden rounded-2xl ring-1 ring-line">
      {/* maplibre-gl.css fuerza position:relative en el contenedor: usar h-full, no absolute. */}
      <div ref={container} className="h-full w-full" />
      {baseMapFailed && (
        <p role="status" className="absolute inset-x-3 bottom-3 rounded-lg bg-surface/95 px-3 py-2 text-xs text-ink-2 shadow">
          No se pudo cargar el mapa base. Revisa la conexión; los datos de la ciudad siguen disponibles.
        </p>
      )}
    </div>
  );
}
