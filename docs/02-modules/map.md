# Módulo: mapa

**Objetivo:** ver el territorio y activar capas comprensibles sin saturar pantalla. Pantalla principal mobile-first con mapa grande, selector de ciudad, botón de localización opcional, filtros y ficha inferior de lugar.

**Capas:** rutas/paradas, polígonos de supermanzanas/colonias cuando estén disponibles, POI (playas, plazas, museos), eventos, incidencias con fecha y verificación.

**Criterios de aceptación:** un marcador puede abrir ficha con fuente; cambiar ciudad centra mapa y reemplaza datos; layers toggle; pantalla accesible y responsive; cuando no hay datos se dice claramente; mostrar atribución cartográfica.

**Puntos de riesgo:** teselas OSM públicas tienen uso limitado; verificar proveedor y política antes de producción; no copiar Google Places; no confundir reporte de inundación con vía confirmada como cerrada.
