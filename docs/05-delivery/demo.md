# Demo para jueces (dentro de un pitch de 5 min)

**Frase:** "KinHop lleva el gasto del turista a los negocios locales."

Ángulo y rúbrica: [HACKATHON.md](../../HACKATHON.md). Quién dice qué y cuándo: [PITCH.md](../../PITCH.md). El apoyo visual ocupa los 5:00 completos; el recorrido de producto va de 0:25 a 2:55. La tabla siguiente se conserva como recorrido opcional en vivo para preguntas.

| # | Paso (≈ tiempo) | Requiere | Fallback honesto |
|---|---|---|---|
| 1 | Entrar con la cuenta demo (o Google) → Inicio en Cancún (10 s) | KH-019, `AUTH_DEV_LOGIN=true` fuera de producción | sesión ya iniciada antes de subir al escenario |
| 2 | Explorar → escribir «Starbucks» → abrir el resultado: «Cadena según OpenStreetMap» y 3 negocios REAL de OSM sin marca de cadena registrada (probablemente locales) a 186–312 m (40 s) | KH-020, `npm run db:import-osm` | video de respaldo |
| 3 | Leer en voz alta un «por qué»: fuente, distancia, confianza media y por qué no es alta (25 s) | KH-013, KH-020 | — |
| 4 | Billetera → «Añadir gasto» → Comida, 120, marcar «Lo pagué en un negocio local» → el medidor sube (35 s) | KH-010, KH-020 | datos DEMO ya cargados muestran 22 % |
| 4b | Avatar → «Cupones de descuento» → abrir uno: QR y en qué locales se usa; volver → «Negocios y organizadores»: puestos 1–3 de eventos (25 s) | KH-021 | capturas del video |
| 5 | Cambiar a CDMX: Metrobús L1 REAL en el mapa, mismo motor (20 s) | KH-007, `npm run db:import:cdmx` | se dice en una frase (recorte 1 de HACKATHON.md) |

Las rutas de Cancún son **simuladas** (`DEMO`) por reglas del hackatón ([OPEN-QUESTIONS #1](../OPEN-QUESTIONS.md)): si alguien pregunta, se dice así.

Si el tiempo no alcanza se corta un paso; **nunca se falsifica**. Video de respaldo grabado de esta misma app (KH-017): `docs/05-delivery/kinhop-demo-jurado.mp4`.

## Video editado para el jurado (KH-017)

[Reproducir el MP4](kinhop-demo-jurado.mp4): 300 segundos exactos, 1920×1080, 30 fps, sin narración ni música, sincronizado con el discurso de 635 palabras de [PITCH.md](../../PITCH.md). No necesita red al reproducirse. Composición editable, capturas y comandos de exportación en [video/demo-jurado](../../video/demo-jurado/README.md).

Se muestran alternativas locales con fuente y confianza media, registro de gasto local, mapas de Cancún/CDMX, eventos, idiomas y monetización DEMO de KH-020/KH-021. Las capturas proceden de la rama de la app que presentó Claude en el PR #35; esta entrega no modifica su implementación. Los precios son propuestas y Stripe/AdMob siguen pendientes.

La clasificación de negocios usa las etiquetas de OSM, no una certificación del propietario. El medidor refleja gastos marcados manualmente por la persona; no es una medición auditada del impacto económico.

El video incluye nombre y propuesta de valor, razones de uso y pago, diagrama de tecnologías/arquitectura, adaptadores para otros estados, metodología Kanban y propuesta de piloto. La voz del presentador explica; los rótulos sirven de apoyo. Ensayar dos veces antes de exponer: el ritmo humano no se garantiza por el número de palabras.
