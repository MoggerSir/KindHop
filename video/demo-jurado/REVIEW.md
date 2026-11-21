# Revisión del video para el jurado

Fecha: 21/11/2026. Continuación de la composición y las 16 capturas de Claude Code. Se conserva su recorrido, duración y formato; se corrigen jerarquía, legibilidad, solapamientos y afirmaciones sin respaldo.

## Cambios de mayor impacto

- 0 s: la primera imagen tenía solo fondo → la marca ya aparece en el fotograma inicial.
- 6–13 s: el mensaje económico era absoluto y demasiado largo → se limita a la visibilidad de negocios locales y al snapshot de OSM documentado. Se adelantan explicación y fuente para dar tiempo de lectura.
- 30–44 s: los tres rótulos cubrían el titular → pasan a tres filas debajo del mensaje, sin tapar el teléfono.
- 63–81 s: se podía interpretar Stripe/AdMob/prioridad comercial como funciones conectadas → se explicitan las integraciones pendientes, los precios propuestos y los cupones/patrocinios DEMO.
- 81–90 s: la cifra de pruebas y de traducciones podía quedar obsoleta → se muestran las capas verificadas e idiomas sin una cifra que sugiera validación nueva del snapshot de la app.
- 90–96 s: el cierre afirmaba que todo el gasto permanecía en Cancún → se cambia por una invitación a descubrir lo local.

## Comprobado

- HyperFrames: ejecución, recursos, layout y contraste sin errores en la revisión de composición; 16 capturas disponibles.
- Inspección visual: láminas por escenas, cortes y versión reducida; además fotogramas de portada, problema, alternativas, cupones y arquitectura después de los ajustes.
- `npm run check` en la rama de entrega creada desde developers: 51 pruebas API, 30 web y 13 scripts, tipos/lint/idiomas/enlaces correctos. No se cambió código de la aplicación.
- `npm run build`: correcto; aviso existente de tamaño de MapLibre.
- MP4 exportado: H.264/yuv420p, 1920×1080, 30/1 fps, 96.000 s, 27 435 074 bytes. Decodificación completa con FFmpeg sin errores y fotogramas del archivo final revisados.

## Decisiones y límites

- Versión sin voz ni música para acompañar el pitch oral. El aviso `film_silent` se conserva por esta decisión; no se ha valorado audio que no existe.
- El validador conserva un aviso tipográfico en los rótulos auxiliares de 27 px (su recomendación es 28 px); se revisaron visualmente a resolución final. No hay errores de contraste ni de recorte del texto.
- Se conserva una única composición para terminar el material existente sin rehacer su estructura; los avisos de tamaño y sugerencias de subcomposiciones son de mantenimiento, no errores de ejecución.
- El fondo y las transiciones de capturas desbordan sus máscaras de forma intencionada durante el movimiento.
- Capturas estáticas reales animadas con GSAP, no una nueva prueba E2E ni una grabación continua del usuario. Representan KH-020/KH-021 del PR #35, no aseguran que esos PRs estén integrados.
- El plano más denso es el modelo de ingresos: cinco propuestas en 18 s. Para otra edición, conviene dedicarle más tiempo o mostrar menos precios; no se amplía el video sin necesidad en esta entrega.
- No se han inventado convenios, cobros, datos en tiempo real, valoración del jurado ni impacto económico auditado.

## Skills de hackatón aplicadas

Se registraron en Codex las mismas cuatro skills que Claude comparte desde `~/.agents/skills`. Se aplicó `judge-sim` al plan/demo/verificación que dejó Claude, sin backend externo; resultado y limitaciones en `JURADO.md`. No se rehízo el kickoff ni se recortó el alcance ya acordado con scope-knife. No hay rúbrica oficial verificada ni evidencia de ensayo con el equipo, por lo que el informe no promete una nota real.

## Sincronización con developers

Antes de entregar se incorporó el avance de developers y se resolvieron los conflictos de documentación conservando ambas entregas. `npm run check` y `npm run build` volvieron a pasar: 71 pruebas API, 34 pruebas web, 18 pruebas scripts. Las pruebas que requieren PostgreSQL no corrieron en este checkout sin DATABASE_URL; no se presentan como verificadas. La entrega de video sigue sin cambiar código de la aplicación respecto a developers.
