# Demo para jueces (2–3 min)

**Frase:** "KinHop conecta cómo te mueves, qué sucede y cuánto puedes gastar para ayudarte a aprovechar cualquier ciudad. Dos ciudades, un motor reutilizable, decisiones explicables."

| # | Paso | Requiere | Fallback honesto |
|---|---|---|---|
| 1 | Problema: información urbana dispersa (15 s) | — | — |
| 2 | Cancún: mapa + seleccionar un POI real (ficha con fuente) | KH-004, KH-005 | lista de POI sin mapa base |
| 3 | Cómo llegar: ruta de transporte real (API Rutas Cancún declarada como externa) | KH-003, KH-006 | "transporte no disponible" + explicación |
| 4 | Incidencia **DEMO** cerca del destino → alternativa con "por qué / fuente / fecha / confianza" | KH-011–013 | se omite el paso |
| 5 | Registrar gasto de transporte → presupuesto y gráfico se actualizan | KH-010 | — |
| 6 | Cambiar a CDMX: otra fuente, mismo motor | KH-007 | catálogo + mapa CDMX sin capas, dicho tal cual |
| 7 | Cierre: arquitectura de adaptadores, fuentes, límites honestos, siguientes pasos | — | — |

Si el tiempo no alcanza se corta un paso; **nunca se falsifica**. Video de respaldo grabado de esta misma app (KH-017).
