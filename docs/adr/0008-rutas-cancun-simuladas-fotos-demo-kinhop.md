# ADR-0008 — Rutas de Cancún simuladas, fotos genéricas DEMO y nombre KinHop

**Fecha:** 2026-11-21 · **Estado:** Aceptado (decisión del usuario, revisión de los PR #32 y #33) · **Modifica:** las reglas "nunca simular rutas" de [AGENTS](../../AGENTS.md), [cities-and-transit](../02-modules/cities-and-transit.md) y [database](../06-data/database.md); KH-003.

## Contexto
El PR #32 cambió la capa de transporte de Cancún: dejó de leer el catálogo público de Rutas Cancún (servicio preexistente de un integrante del equipo, KH-002/KH-003) y pasó a dibujar rutas simuladas. También puso fotos genéricas en lugares OSM REAL y renombró la app a "KinHop". Las tres cosas chocaban con las reglas escritas, así que el usuario tuvo que decidir.

## Decisión
1. **Rutas de Cancún simuladas (DEMO).** La demo muestra rutas inventadas por el equipo, con trazado y paradas aproximados (`adapters/cancun-demo.ts`). Así no se consume el servicio preexistente del autor. Condiciones:
   - La API las devuelve con `source.dataStatus = 'DEMO'`, `name` que dice "Simulada" y paradas que dicen "(simulada)".
   - El catálogo publica `modules.transit = 'DEMO'`. `IMPLEMENTED` queda solo para datos reales.
   - **Nunca llevan tarifa ni horario.** Lo simulado es solo el dibujo; un precio o un horario inventados podrían confundir a alguien que viaje de verdad.
   - La web muestra el badge DEMO en cada ruta y el aviso, en ES y EN: "rutas simuladas e ilustrativas, no oficiales, sin horario ni tarifa". No muestra "fecha de consulta".
   - El adaptador en vivo de Rutas Cancún **queda desactivado, no se borra** (`adapters/cancun-live.ts` y `cancun-live.test.ts` siguen en CI). Para reactivarlo: pasar `fetchCancunLiveRoutes` en `transit/routes.ts` y volver `transit` de Cancún a `IMPLEMENTED`.
   - CDMX (Metrobús línea 1, GTFS de SEMOVI) sigue REAL.
2. **Fotos genéricas en lugares, siempre DEMO.** Un lugar sin foto propia recibe una foto ilustrativa:
   - La API la marca `imageDataStatus: 'DEMO'` y la web pone la etiqueta "Demo · Foto ilustrativa, no de este lugar" sobre la imagen.
   - A los lugares OSM REAL la foto se la asigna la API al responder: **nunca se escribe en sus filas**. Una reimportación OSM no la pisa ni la borra.
   - Las fotos que sí se guardan (seed DEMO) declaran `places.image_data_status`. Una migración exige que toda foto guardada lo declare.
   - Como foto genérica solo se usan imágenes cuyo uso no exige crédito al lado: las 6 del equipo en `public/demo/places/` y la CC0 del mercado nocturno. Las fotos CC BY / CC BY-SA de Wikimedia se usan solo en eventos, con autor y licencia reales visibles.
3. **Nombre de la app: KinHop.** Se usa en la interfaz (marca, título, descripción, ES/EN) y en los documentos de producto. El repositorio `KindHop`, los paquetes `@kindhop/*`, la base `kindhop`, la fuente `kindhop-demo` y la clave `kindhop.budget.v1` conservan el nombre técnico: cambiarlos rompería despliegue, datos y almacenamiento sin aportar nada al usuario.

## Consecuencias
- Sigue vigente "no inventar horarios, tiempo real, costos ni métricas". La única excepción es el trazado de rutas de Cancún, que se marca DEMO.
- Pendiente (OPEN-QUESTIONS): que el equipo confirme el origen y la licencia de las 6 fotos de `public/demo/places/`. Se añadieron sin metadatos ni crédito.
- Si KH-002 confirma que se puede usar Rutas Cancún, se reactiva el adaptador en vivo y Cancún vuelve a REAL. Eso cambia este ADR.
