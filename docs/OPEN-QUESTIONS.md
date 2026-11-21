# Preguntas abiertas

Formato: estado · pregunta · quién la cierra · tarjeta. Cerrar con evidencia (enlace o cita), no con suposiciones.

| # | Estado | Pregunta | Dueño | Tarjeta |
|---|---|---|---|---|
| 1 | NO VERIFICADO | ¿Las reglas oficiales del hackatón permiten consumir una API construida antes del evento por un integrante? ¿Cómo debe declararse? | integración | KH-002 |
| 2 | NO VERIFICADO | URL, endpoints, formato, licencia y disponibilidad de la API Rutas Cancún | integración | KH-002 |
| 3 | ABIERTO (Cancún) | Fuente y licencia de polígonos de **supermanzanas de Cancún**: IMPLAN expone WMS sin dataset vectorial abierto verificado; OSM no tiene polígonos nombrados fiables en el bbox urbano. CDMX sí (CC-BY, KH-009). Cerrar cuando exista descarga con licencia explícita | datos | KH-009 |
| 4 | NO VERIFICADO | Dataset GTFS de CDMX (Metrobús) vigente y su licencia | datos | KH-007 |
| 5 | DECIDIDO (propuesta) | Presupuesto local-first en el navegador sin cuenta para el MVP; reportes sin cuenta con límite por IP + moderación por token admin. El equipo puede cambiarlo con ADR | equipo | KH-010, KH-011 |
| 6 | POR VALIDAR | Mapa base: OpenFreeMap (`tiles.openfreemap.org`, sin API key) por defecto, configurable con `VITE_MAP_STYLE_URL`. Confirmar términos vigentes antes de la demo. No usar `tile.openstreetmap.org` para tráfico de demo (política de uso de OSMF) | datos | KH-005 |
| 7 | CERRADO 20/11 | Larpatron accesible y leído (commit `fcff368`). Ver `docs/agent/LARPATRON.md` | — | — |
| 8 | CERRADO 20/11 | `package-lock.json` generado; CI usa `npm ci` | — | — |
| 9 | BLOQUEADO | Repositorio remoto `MoggerSir/KindHop`: la sesión del bootstrap no tenía permiso para crearlo. Crear vacío en GitHub y hacer push (comandos en el resumen del bootstrap) | dueño del repo | — |
| 10 | DECIDIR | Plataforma de despliegue de demo (web estática + API Node + PostgreSQL) | integrador | KH-016 |
| 11 | DECIDIR | Licencia del proyecto (ver `LICENSE-NOTICE.md`) | equipo | — |
| 12 | VIGILAR | En Chromium headless (Playwright) el mapa base sale vacío en ~1 de cada 3 cargas, igual en dev, en build y en una página mínima solo con MapLibre 6.19: es del entorno de prueba o de la red con OpenFreeMap, no de la app. Estilo y teselas responden 200, sin errores. Antes de la demo: probar en el navegador real del proyector y, para E2E (KH-008), no exigir que el mapa base pinte | QA | KH-008 |
