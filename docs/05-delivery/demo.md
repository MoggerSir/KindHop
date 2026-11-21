# Demo para jueces (2–3 min)

**Frase:** "KindHop conecta cómo te mueves, qué sucede y cuánto puedes gastar para ayudarte a aprovechar cualquier ciudad. Dos ciudades, un motor reutilizable, decisiones explicables."

| # | Paso | Requiere | Fallback honesto |
|---|---|---|---|
| 1 | Problema: información urbana dispersa (15 s) | — | — |
| 2 | Cancún: mapa + seleccionar un POI real (ficha con fuente) | KH-004, KH-005 | lista de POI sin mapa base |
| 3 | Cómo llegar: ruta de transporte real (API Rutas Cancún declarada como externa) | KH-003, KH-006 | "transporte no disponible" + explicación |
| 4 | Incidencia **DEMO** cerca del destino → alternativa con "por qué / fuente / fecha / confianza" | KH-011–013 | se omite el paso |
| 5 | Registrar gasto de transporte → presupuesto y gráfico se actualizan | KH-010 | — |
| 6 | Cambiar a CDMX: línea 1 de Metrobús con fuente y fecha (tras `npm run db:import:cdmx`) | KH-007 | si no se importó: mapa sin línea y texto de vacío; no inventar el recorrido |
| 7 | Cierre: arquitectura de adaptadores, fuentes, límites honestos, siguientes pasos | — | — |

Si el tiempo no alcanza se corta un paso; **nunca se falsifica**. Video de respaldo grabado de esta misma app (KH-017).

## Video editado para el jurado (KH-017)

[Reproducir el MP4](kinhop-demo-jurado.mp4): 96 segundos, 1920×1080, 30 fps, sin narración ni música para acompañar el pitch oral. No necesita red al reproducirse. Composición editable, capturas y comandos de exportación en [video/demo-jurado](../../video/demo-jurado/README.md).

Se muestran alternativas locales con fuente y confianza media, registro de gasto local, mapas de Cancún/CDMX, eventos, idiomas y monetización DEMO de KH-020/KH-021. Las capturas proceden de la rama de la app que presentó Claude en el PR #35; este video no integra ni activa sus funcionalidades en developers. Los precios son propuestas y Stripe/AdMob siguen pendientes.

La clasificación de negocios usa las etiquetas de OSM, no una certificación del propietario. El medidor refleja gastos marcados manualmente por la persona; no es una medición auditada del impacto económico.
