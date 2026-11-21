# Revisión — pitch KinHop de cinco minutos

## Decisión editorial

Se rehízo el video de 96 s como apoyo de una exposición de 300 s; no se estiraron sus planos mecánicamente. Diez capítulos siguen problema/usuario → alternativa explicada → registro → mapa → pago → arquitectura → expansión → método → cierre. `PITCH.md` y el speech limpio contienen los mismos 635 términos separados por espacios que `storyboard.json`.

El expositor vende una elección mejor informada y una hipótesis comercial; no lee un catálogo técnico. La voz queda a cargo de una persona, sin música ni narración grabada. Nombre, arquitectura y proceso se explican con diagramas conceptuales; las pantallas siguen siendo capturas reales. Se evita inventar visitas, ventas, convenios o cobertura nacional.

## Medido y observado

- HyperFrames 0.9.77, `check --json`, informe `614b8d61-1cfc-48e3-a649-a56d6eb60ebf`: `ok: true`, sin errores de ejecución, layout ni contraste; contraste 87/87. Revisión de craft en 599 instantes.
- Revisión visual: diez fotogramas centrales, láminas de inicios/centros, visualización a 360 px y corte de salida del teléfono hacia el diagrama. Se generaron 67 capturas que incluyen los nueve cortes. Vista previa del diagrama verificada en navegador.
- Correcciones: primer fotograma con título visible, opacidad inicial del teléfono explícita, cierre sostenido hasta el último fotograma. Eliminadas tarjetas anidadas; texto principal ≥30 px y notas 28 px.
- Script de consistencia: diez capítulos contiguos de 0 a 300, conteo 635 e igualdad del texto hablado en storyboard, PITCH y speech limpio.
- `npm run check` y `npm run build` correctos. 71 pruebas API, 34 web y 18 de scripts; sin fallos. La prueba real de Google y la demo de la app no se han repetido para esta edición de material audiovisual.

## Avisos aceptados

- `film_silent`: deliberado; el presentador habla en vivo durante los cinco minutos.
- 13 avisos de mantenibilidad: una composición HTML con escenas anidadas. Se conserva una línea de tiempo compartida para el teléfono y los diagramas; son avisos, no errores de render ni tarjetas visuales anidadas.
- El build avisa del tamaño del bundle existente de la app; esta entrega no cambia código de la aplicación.
- Los planos se sostienen para la voz. No se añaden movimiento ni texto continuamente, para que la audiencia pueda escuchar y mirar al expositor.

## Punto más débil y pendiente humano

Los detalles pequeños de las capturas (especialmente condiciones de cupones) no se leen desde el fondo de un auditorio: los rótulos grandes y el discurso explican lo esencial. Con más tiempo conviene ensayar en el proyector real. La disposición a pagar, las visitas y el impacto no están validados. El equipo debe ensayar el discurso; un conteo de palabras no garantiza la duración de una voz humana.

MP4 comprobado con FFprobe y decodificación completa sin errores: 300.000 s, 9000 fotogramas, 1920×1080, 30 fps, H.264/yuv420p, 17,290,629 bytes y sin pista de audio. Se revisaron fotogramas extraídos del archivo a 76 s y 299.5 s. Evidencia en `verification.json`. No se ha escuchado audio: el archivo está previsto sin pista sonora.
