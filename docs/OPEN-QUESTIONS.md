# Preguntas abiertas

Formato: estado · pregunta · quién la cierra · tarjeta. Cerrar con evidencia (enlace o cita), no con suposiciones.

| # | Estado | Pregunta | Dueño | Tarjeta |
|---|---|---|---|---|
| 1 | NO CERRADO | ¿Las reglas oficiales del hackatón permiten consumir una API construida antes del evento por un integrante? ¿Cómo debe declararse? El repo no nombra el evento. El prompt del 20/11/2026 exige declararla y no copiar código. Hackatón México 2026 §9 (https://hackatonmexico.com/reglas, 4/11/2026) sí permite un componente previo declarado, pero ese evento es de CoDi, no de turismo: no se usa como cierre. KindHop la declara en `source` y en `data_sources` | equipo | KH-002 |
| 2 | CERRADO 21/11 | URL, formato, licencia y disponibilidad de la API Rutas Cancún. Evidencia en [cities-and-transit](02-modules/cities-and-transit.md): catálogo público 200 (34 rutas, volcado 2026-09-06); `api.rutascancun.com/api/routes` 401; sin licencia para guardar copia → opción A | — | KH-003 |
| 3 | NO VERIFICADO | Fuente y licencia de polígonos de supermanzanas de Cancún | datos | KH-009 |
| 4 | NO VERIFICADO | Dataset GTFS de CDMX (Metrobús) vigente y su licencia | datos | KH-007 |
| 5 | DECIDIDO (propuesta) | Presupuesto local-first en el navegador sin cuenta para el MVP; reportes sin cuenta con límite por IP + moderación por token admin. El equipo puede cambiarlo con ADR | equipo | KH-010, KH-011 |
| 6 | POR VALIDAR | Mapa base: OpenFreeMap (`tiles.openfreemap.org`, sin API key) por defecto, configurable con `VITE_MAP_STYLE_URL`. Confirmar términos vigentes antes de la demo. No usar `tile.openstreetmap.org` para tráfico de demo (política de uso de OSMF) | datos | KH-005 |
| 7 | CERRADO 20/11 | Larpatron accesible y leído (commit `fcff368`). Ver `docs/agent/LARPATRON.md` | — | — |
| 8 | CERRADO 20/11 | `package-lock.json` generado; CI usa `npm ci` | — | — |
| 9 | BLOQUEADO | Repositorio remoto `MoggerSir/KindHop`: la sesión del bootstrap no tenía permiso para crearlo. Crear vacío en GitHub y hacer push (comandos en el resumen del bootstrap) | dueño del repo | — |
| 10 | DECIDIR | Plataforma de despliegue de demo (web estática + API Node + PostgreSQL) | integrador | KH-016 |
| 11 | DECIDIR | Licencia del proyecto (ver `LICENSE-NOTICE.md`) | equipo | — |
| 12 | VIGILAR | En Chromium headless (Playwright) el mapa base sale vacío en ~1 de cada 3 cargas, igual en dev, en build y en una página mínima solo con MapLibre 6.19: es del entorno de prueba o de la red con OpenFreeMap, no de la app. Estilo y teselas responden 200, sin errores. Antes de la demo: probar en el navegador real del proyector y, para E2E (KH-008), no exigir que el mapa base pinte | QA | KH-008 |
