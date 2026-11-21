# Demo para jueces (2–3 min)

**Frase:** "KinHop conecta cómo te mueves, qué sucede y cuánto puedes gastar para ayudarte a aprovechar cualquier ciudad. Dos ciudades, un motor reutilizable, decisiones explicables."

| # | Paso | Requiere | Fallback honesto |
|---|---|---|---|
| 1 | Problema: información urbana dispersa (15 s) | — | — |
| 2 | Cancún: mapa + seleccionar un POI real (ficha con fuente) | KH-004, KH-005 | lista de POI sin mapa base |
| 3 | Cómo llegar: rutas de transporte **simuladas** de Cancún con badge DEMO y aviso "ilustrativas" (ADR-0008; la API Rutas Cancún queda desactivada) | KH-003, KH-006 | "transporte no disponible" + explicación |
| 4 | Incidencia **DEMO** cerca del destino → alternativa con "por qué / fuente / fecha / confianza" | KH-011–013 | se omite el paso |
| 5 | Registrar gasto de transporte → presupuesto y gráfico se actualizan | KH-010 | — |
| 6 | Cambiar a CDMX: línea 1 de Metrobús con fuente y fecha (tras `npm run db:import:cdmx`) | KH-007 | si no se importó: mapa sin línea y texto de vacío; no inventar el recorrido |
| 7 | Cierre: arquitectura de adaptadores, fuentes, límites honestos, siguientes pasos | — | — |

Si el tiempo no alcanza se corta un paso; **nunca se falsifica**. Video de respaldo grabado de esta misma app (KH-017).
