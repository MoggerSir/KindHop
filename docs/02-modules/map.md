# Módulo: mapa

**Qué hace:** mapa protagonista mobile-first; vuela al centro de la ciudad elegida; muestra capas con su fuente.
**Dónde:** `apps/web/src/features/map/CityMap.jsx`. Una sola instancia de MapLibre por sesión; el cambio de ciudad usa `flyTo` (sin animación con reduced-motion).
**Datos:** estilo vectorial OpenFreeMap "liberty" (configurable con `VITE_MAP_STYLE_URL`), atribución desde el estilo. Capas futuras como fuentes GeoJSON de MapLibre (`addSource`/`addLayer`), no marcadores DOM masivos.

| Pieza | Estado |
|---|---|
| Mapa, zoom, cambio de ciudad animado, aviso si el mapa base no carga | IMPLEMENTADO |
| Capa de transporte en CDMX (línea y paradas GeoJSON, crédito con fuente y fecha) | IMPLEMENTADO (KH-007). El interruptor de capa sigue en KH-006 |
| Capas POI / zonas / incidencias, toggles, ficha inferior | PLANIFICADO (KH-005, KH-006, KH-009, KH-012) |
| Ubicación del usuario (opcional, con permiso explícito, sin guardarla) | PLANIFICADO (P1) |
| Términos del proveedor de teselas | POR VALIDAR (OPEN-QUESTIONS #6) |
| Worker de MapLibre servido por Vite (`setWorkerUrl` + `?url` en `CityMap.jsx`). Sin esto el mapa nunca pintaba ("Worker failed to load") en dev ni en build | IMPLEMENTADO |
| Mapa vacío intermitente en Chromium headless (también fuera de la app) | VIGILAR (OPEN-QUESTIONS #12) |

**Prueba:** `npm run dev` → cambiar Cancún ↔ CDMX; con red bloqueada aparece "No se pudo cargar el mapa base".
**Terminado cuando:** cada capa tiene toggle accesible, leyenda con fuente/fecha y estado vacío honesto.
