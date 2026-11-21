# Módulo: mapa

**Qué hace:** mapa protagonista mobile-first; vuela al centro de la ciudad elegida; muestra capas con su fuente.
**Dónde:** `apps/web/src/features/map/CityMap.jsx`. Una sola instancia de MapLibre por sesión; el cambio de ciudad usa `flyTo` (sin animación con reduced-motion).
**Datos:** estilo vectorial OpenFreeMap "dark" (configurable con `VITE_MAP_STYLE_URL`), atribución desde el estilo. Capas densas como fuentes GeoJSON de MapLibre (`addSource`/`addLayer`), no marcadores DOM masivos.

| Pieza | Estado |
|---|---|
| Mapa, zoom, cambio de ciudad animado, aviso si el mapa base no carga | IMPLEMENTADO |
| Capa de zonas (alcaldías CDMX), toggle, ficha con fuente | IMPLEMENTADO (KH-009, solo CDMX) |
| Transporte Cancún, POI OSM, zonas CDMX y eventos con lugar enlazado: capas, selección, controles y lista accesible | IMPLEMENTADO (KH-006); incidencias web pendientes KH-012 |
| Ubicación opcional, solicitada con botón; memoria de sesión, sin persistir ni enviar; distancia geodésica explícita | IMPLEMENTADO |
| Términos del proveedor de teselas | POR VALIDAR (OPEN-QUESTIONS #6) |
| Worker de MapLibre servido por Vite (`setWorkerUrl` + `?url` en `CityMap.jsx`). Sin esto el mapa nunca pintaba ("Worker failed to load") en dev ni en build | IMPLEMENTADO |
| Mapa vacío intermitente en Chromium headless (también fuera de la app) | VIGILAR (OPEN-QUESTIONS #12) |

**Prueba:** `npm run dev` → cambiar Cancún ↔ CDMX; con red bloqueada aparece "No se pudo cargar el mapa base".
**Terminado cuando:** cada capa tiene toggle accesible, leyenda con fuente/fecha y estado vacío honesto.

**Composición:** `MapView` coordina capas y selección; `useMapData` carga mediante `useResource` y los clientes públicos de cada feature. `DataLayers` dibuja POI/rutas/zonas como GeoJSON; `EventPins` reserva marcadores accesibles para eventos agrupados por lugar. `LayerPanel` explica disponibilidad y procedencia. Lista alternativa seleccionable; eventos sin coordenadas permanecen listados sin pin. `WeekStrip` empieza con todos los próximos y filtra días en la zona de la ciudad. La fuente de rutas no publica paradas ni tiempo real.
