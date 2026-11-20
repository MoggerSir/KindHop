# Módulo: ciudades y transporte

**Meta:** un mismo contrato público para Cancún y CDMX. Cada adaptador conserva procedencia/licencia y versión de sus datos.

**Cancún:** se planea consumir API pública de Rutas Cancún (desarrollada previamente por un integrante), sujeto a autorización, disponibilidad y reglas del hackatón. Supervisar rutas, geometrías y transbordos.

**CDMX:** fuentes de datos abiertos GTFS, movilidad y OSM. Confirmar cobertura, fechas de publicación y legalidad antes de integrar; no presentar una programación obsoleta como vigente.

**Contrato normalizado propuesto:** `cityId`, `routeId`, `name`, `mode`, `polyline/GeoJSON`, `stops[]`, `source`, `updatedAt`, `dataStatus`. Ninguna ruta se inventa para llenar el mapa.

**Aceptación:** seleccionar Cancún/CDMX sin cambiar motor; al menos un subconjunto real de transporte por ciudad, o señalización transparente de falta de datos; los costes solo cuando estén verificados.
