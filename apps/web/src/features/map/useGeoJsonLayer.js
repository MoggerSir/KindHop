import { useEffect, useRef, useState } from 'react';

const EMPTY = { type: 'FeatureCollection', features: [] };

// Fuente GeoJSON + sus capas de MapLibre, con el ciclo de vida de React: se añaden una vez por mapa, `data` se
// actualiza con setData y `visible` solo cambia la visibilidad (no se recrean). Devuelve true cuando ya están.
// `layers` se lee solo al añadir: los cambios de estilo en caliente (selección) van con setFilter/setPaintProperty.
export function useGeoJsonLayer(map, { id, data, layers, visible = true, source = {} }) {
  const [ready, setReady] = useState(false);
  const spec = useRef({ layers, source });

  useEffect(() => {
    if (!map) return undefined;
    const { layers: layerSpecs, source: sourceOptions } = spec.current;
    let added = false;
    const remove = () => {
      try {
        for (const layer of [...layerSpecs].reverse()) if (map.getLayer(layer.id)) map.removeLayer(layer.id);
        if (map.getSource(id)) map.removeSource(id);
      } catch {
        // El mapa ya se destruyó (cambio de pestaña): no queda nada que quitar.
      }
    };
    // addSource necesita el JSON del estilo; si aún carga lanza "Style is not done loading": se reintenta en styledata.
    const add = () => {
      if (added) return;
      try {
        map.addSource(id, { type: 'geojson', data: EMPTY, ...sourceOptions });
        for (const layer of layerSpecs) map.addLayer({ ...layer, source: id });
        added = true;
        // `styledata` sigue disparándose al mover el mapa (teselas). Ya no hace falta escucharlo.
        map.off('styledata', add);
        setReady(true);
      } catch {
        remove();
      }
    };
    add();
    if (!added) map.on('styledata', add);
    return () => {
      map.off('styledata', add);
      remove();
      setReady(false);
    };
  }, [map, id]);

  useEffect(() => {
    if (ready) map.getSource(id)?.setData(data ?? EMPTY);
  }, [ready, map, id, data]);

  useEffect(() => {
    if (!ready) return;
    for (const layer of spec.current.layers) {
      if (map.getLayer(layer.id)) map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none');
    }
  }, [ready, map, visible]);

  return ready;
}
