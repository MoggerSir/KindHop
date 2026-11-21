# KinHop — apoyo visual para una exposición de cinco minutos

300 segundos exactos · 1920×1080 · 30 fps · H.264/yuv420p. Sin narración ni música: habla una persona. Discurso sincronizado de 635 palabras en `PITCH.md`; fuente de tiempos y texto en `storyboard.json`.

El relato sigue una decisión: descubrir una alternativa cercana, entenderla y registrar el gasto. Después explica quién pagaría, la arquitectura que permite repetirlo en otra ciudad y cómo validar el negocio. Cada capítulo responde una pregunta del jurado. No se limita a ralentizar el anuncio anterior de 96 s.

| Tiempo (s) | Pregunta / apoyo |
|---|---|
| 0–25 | Una decisión que conecta: Kinship → conexión · Hop → salto |
| 25–45 | Qué es y por qué usarla: Descubrir · decidir · registrar |
| 45–85 | La diferencia, en una decisión: Cadena → alternativas → explicación |
| 85–110 | Del descubrimiento al gasto: Registro manual · sin conectar el banco |
| 110–135 | La ciudad en contexto: Cancún DEMO · CDMX GTFS oficial |
| 135–175 | Quién paga y qué obtiene: Valor para turista y negocio |
| 175–205 | Tecnología y arquitectura: Interfaz → API modular → datos |
| 205–235 | De Cancún a otros estados: Fuente → adaptador → contrato común |
| 235–265 | Método y siguiente validación: Kanban · una entrega funcional cada vez |
| 265–300 | Por qué apostar por KinHop: Descubrir → elegir → conectar |

Diseño: tema oscuro, acento lima #ccff00, Archivo + IBM Plex Mono. Titulares de 72–85 px, texto principal de 30–36 px y notas de 28 px. Márgenes de 120 px; teléfono persistente entre 25 y 175 s. Diagramas conceptuales sin tarjetas anidadas. Entradas con transform/opacity de 0.55–0.8 s y fundidos de salida de 0.35 s, sin rebote. Reloj discreto y ancla por capítulo para ayudar al expositor. Los planos se sostienen deliberadamente para acompañar una explicación en vivo.

Evidencia: 16 capturas reales del prototipo con cuenta DEMO (390 px, escala 2, 21/11/2026), heredadas de Claude. Los esquemas de arquitectura y adaptadores se basan en `docs/01-architecture/overview.md`; el tablero en `docs/agent/WORKFLOW.md`. No se dibujan pantallas inexistentes.

Evitar: texto completo del discurso sobre el video, tarjetas dentro de tarjetas, transiciones rápidas que compitan con la voz, métricas sin fuente, juicios oficiales inventados, atribuir propiedad local por ausencia de marca, afirmar impacto auditado, prometer cobertura nacional o monetización activa. No se añaden avatares, voz sintética ni pistas sonoras.

Límites: distancias y porcentaje son del ejemplo, no una estadística general. Las rutas de Cancún, cupones y patrocinios mostrados son DEMO. Stripe y AdMob no están conectados. El piloto y la disposición a pagar son propuestas por validar.
