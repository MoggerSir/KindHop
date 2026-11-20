# Módulo: mapa

**Qué hace:** mapa protagonista mobile-first; vuela al centro de la ciudad elegida; muestra capas con su fuente.
**Dónde:** `apps/web/src/features/map/CityMap.jsx`. Una sola instancia de MapLibre por sesión; el cambio de ciudad usa `flyTo` (sin animación con reduced-motion).
**Datos:** estilo vectorial OpenFreeMap "liberty" (configurable con `VITE_MAP_STYLE_URL`), atribución desde el estilo. Capas futuras como fuentes GeoJSON de MapLibre (`addSource`/`addLayer`), no marcadores DOM masivos.

| Pieza | Estado |
|---|---|
| Mapa, zoom, cambio de ciudad animado, aviso si el mapa base no carga | IMPLEMENTADO |
| Capas transporte / POI / zonas / incidencias, toggles, ficha inferior | PLANIFICADO (KH-005, KH-006, KH-009, KH-012) |
| Ubicación del usuario (opcional, con permiso explícito, sin guardarla) | PLANIFICADO (P1) |
| Términos del proveedor de teselas | POR VALIDAR (OPEN-QUESTIONS #6) |

**Prueba:** `npm run dev` → cambiar Cancún ↔ CDMX; con red bloqueada aparece "No se pudo cargar el mapa base".
**Terminado cuando:** cada capa tiene toggle accesible, leyenda con fuente/fecha y estado vacío honesto.
