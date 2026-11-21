# Módulo: mapa

**Qué hace:** mapa oscuro como fondo completo entre cabecera y navegación; sin marco, radio ni título que reduzcan el lienzo. Fechas, capas y controles flotan sobre él. Una hoja inferior plegable muestra el primer evento disponible, la selección y la lista accesible al expandirse.
**Dónde:** `apps/web/src/features/map/CityMap.jsx`. Una sola instancia de MapLibre por sesión; el cambio de ciudad usa `flyTo` (sin animación con reduced-motion).
**Datos:** estilo vectorial OpenFreeMap "dark" (configurable con `VITE_MAP_STYLE_URL`), atribución desde el estilo. Capas densas como fuentes GeoJSON de MapLibre (`addSource`/`addLayer`), no marcadores DOM masivos.

| Pieza | Estado |
|---|---|
| Mapa, zoom, cambio de ciudad animado, aviso si el mapa base no carga | IMPLEMENTADO |
| Capa de transporte en CDMX (línea y paradas GeoJSON, crédito con fuente y fecha) | IMPLEMENTADO (KH-007). El interruptor y la selección se integran en KH-006 |
| Capa de zonas (alcaldías CDMX), toggle, ficha con fuente | IMPLEMENTADO (KH-009, solo CDMX) |
| Transporte Cancún/CDMX, POI OSM, zonas CDMX y eventos con lugar enlazado: capas, selección, controles y lista accesible | IMPLEMENTADO (KH-006); incidencias web pendientes KH-012 |
| Ubicación opcional, solicitada con botón; memoria de sesión, sin persistir ni enviar; distancia geodésica explícita | IMPLEMENTADO |
| Términos del proveedor de teselas | POR VALIDAR (OPEN-QUESTIONS #6) |
| Worker de MapLibre servido por Vite (`setWorkerUrl` + `?url` en `CityMap.jsx`). Sin esto el mapa nunca pintaba ("Worker failed to load") en dev ni en build | IMPLEMENTADO |
| Mapa vacío intermitente en Chromium headless (también fuera de la app) | VIGILAR (OPEN-QUESTIONS #12) |

**Prueba:** `npm run dev` → cambiar Cancún ↔ CDMX; con red bloqueada aparece "No se pudo cargar el mapa base".
**Terminado cuando:** cada capa tiene toggle accesible, leyenda con fuente/fecha y estado vacío honesto.

**Composición:** `MapView` coordina capas y selección; `useMapData` carga mediante `useResource` y los clientes públicos de cada feature. `DataLayers` dibuja POI/rutas/zonas como GeoJSON; `EventPins` reserva marcadores accesibles para eventos agrupados por lugar. `LayerPanel` explica disponibilidad y procedencia. Lista alternativa seleccionable; eventos sin coordenadas permanecen listados sin pin. `WeekStrip` empieza con todos los próximos y filtra días en la zona de la ciudad. La fuente de rutas no publica paradas ni tiempo real.

**CDMX GTFS (KH-007):** la misma capa `DataLayers` pinta línea y paradas publicadas, con color oficial y encuadre al cargar. `TransitCredit` conserva atribución SEMOVI, licencia enlazada, fecha y aviso de recorrido estático; seleccionar la ruta permite leer sus paradas en texto. `CityMap` solo gestiona el mapa base, sin una segunda capa de transporte.

**QA de fondo completo (2026-11-20):** Chromium 390/1440, Cancún/CDMX y hoja abierta/cerrada; canvas del ancho exacto del viewport desde 64 px bajo la cabecera hasta la navegación, sin scroll del documento. La hoja conserva scroll interno y se expande/contrae con teclado (`aria-expanded`/`aria-controls`); movimiento reducido y atribución visible bajo fechas. Capturas `/tmp/map-background-cancun-390-closed.png` y `/tmp/map-background-cdmx-1440-open.png`. Detector de Impeccable sin hallazgos.

**Una sola superficie:** la hoja exterior es el único panel del detalle/lista. Las selecciones de grupo, evento, POI, ruta y zona usan secciones transparentes, sin borde/radio/sombra; lista por títulos y separadores, crédito GTFS plano. Se conservan X, fuentes, badges, filas seleccionables y foco. Verificado en Chromium 390/1440 con grupo de dos eventos, lista abierta/cerrada, POI, ruta y zona; estilos calculados de las secciones: fondo transparente, borde/radio cero y sombra `none`, sin errores JS ni scroll del documento. Capturas `/tmp/map-flat-group-390-closed.png`, `/tmp/map-flat-group-1440-open.png`, `/tmp/map-flat-poi-390.png`, `/tmp/map-flat-route-390.png`.
