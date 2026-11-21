# PITCH.md: KinHop @ Hack Maya 2026

<!-- Generado con /pitch-timebox el 21/11/2026 a partir de HACKATHON.md y docs/05-delivery/demo.md.
     Los nombres van entre paréntesis hasta que el equipo los complete. -->

**Time limit:** 5 min pitch + preguntas (duración de preguntas por confirmar)
**Word budget:** ~600 palabras (140 ppm × 5 min − 10 % de margen)
**Speakers:** (Presentador) → (Demo) → (Presentador) → (Técnico) en preguntas

## Timing table

| Start–End | Speaker | Section | Words | Script (verbatim for open/close, bullets elsewhere) | Handoff line |
|---|---|---|---|---|---|
| 0:00–0:40 | (Presentador) | Gancho + urgencia | ~90 | **Literal:** "Imaginen que llegan a Cancún. Abren el mapa y buscan dónde tomar un café. Lo primero que reconocen es un Starbucks, y ahí entran. Ese dinero sale de la ciudad. En los datos abiertos de OpenStreetMap, 207 de los 656 comercios para turistas de Cancún son de cadena. Los negocios locales no pueden pagar anuncios para competir. Nadie le dice al turista, justo cuando decide, dónde su dinero se queda en Cancún." | "KinHop hace exactamente eso. (Demo), enséñalo." |
| 0:40–2:40 | (Demo) | Solución + demo en vivo | ~270 | Seguir `docs/05-delivery/demo.md`: 1) cuenta demo (Pro simulado); 2) Explorar → "Starbucks" → "Cadena según OpenStreetMap" → 3 negocios locales a 186–312 m con su "por qué", fuente y confianza; 3) Billetera → registrar gasto local → el medidor sube; 4) avatar → Cupones → abrir uno → QR y en qué locales se usa. ⚠ fallback: `docs/05-delivery/video-demo.webm` | "Y esto también es cómo ganamos dinero. (Presentador)." |
| 2:40–3:45 | (Presentador) | **Modelo de ingresos** | ~150 | Enseñar en pantalla Inicio (los 3 primeros eventos recomendados dicen "Patrocinado · #n") y el menú "Negocios y organizadores". Cinco fuentes: 1) anuncios de **AdMob** para usuarios gratis; 2) organizadores pagan por los **3 primeros puestos** de eventos recomendados: $599, $399 y $249 por semana; 3) **negocios locales** pagan $299 al mes por prioridad en búsqueda, recomendaciones y mapa; 4) **anuncios personalizados** propios en app y web, desde $1,500 al mes; 5) **KinHop Pro con Stripe**, $59 al mes: sin anuncios y con cupones en negocios con convenio. El convenio también es gasto local: el negocio da el descuento y recibe clientes. **Regla:** todo lo pagado dice "Patrocinado" o "Anuncio" y nunca cambia el "por qué" de una recomendación. | "¿Y por qué importa? (Presentador)." |
| 3:45–4:20 | (Presentador) | Impacto / por qué ahora | ~80 | Turismo y economía son la misma acción: dónde gasta el visitante. Inclusión: el pequeño comercio aparece sin pagar en las alternativas explicadas. Ambiente: las alternativas están a pie. Honestidad: fuente y confianza en cada sugerencia. | "Cierro." |
| 4:20–5:00 | (Presentador) | Equipo + cierre | ~80 | Dos ciudades, un motor, datos abiertos con fuente, sesión segura con Google. Siguiente paso: piloto con 20 negocios del centro de Cancún que confirmen su perfil local. **Literal de cierre:** "Cada peso que un turista gasta en un negocio local es un peso que se queda en Cancún. KinHop se lo pone enfrente, en el momento justo." | n/a |

## Demo fallback

- Video de respaldo: `docs/05-delivery/video-demo.webm` (grabado con Playwright sobre la misma app; ver demo.md). Comprobar que se reproduce sin sonido en la máquina del pitch.
- Quién lo lanza: (Demo), en cuanto la demo en vivo se quede parada más de 10 segundos. Sin disculpas: "les enseño la grabación".

## Q&A prep

| Likely question | One-line answer | Who answers |
|---|---|---|
| ¿Cómo saben que un negocio es local? | OSM etiqueta las cadenas con `brand` o `brand:wikidata`; sin esa etiqueta lo tratamos como independiente según OSM, y por eso la confianza es media, nunca alta. | (Técnico) |
| ¿Qué pasa si OSM se equivoca? | Se ve la fuente y el enlace al objeto OSM en cada ficha; corregirlo en OSM corrige KinHop en la siguiente importación. El piloto añade verificación por el propio negocio. | (Técnico) |
| ¿Quién paga? | Cinco fuentes: AdMob, organizadores (puestos 1–3 de eventos), negocios locales (visibilidad y anuncios propios) y turistas (Pro con Stripe, $59/mes). Precios en `apps/web/src/features/monetization/pricing.js`. | (Presentador) |
| Si los negocios pagan prioridad, ¿no rompe la recomendación "honesta"? | No se mezcla: lo pagado siempre dice "Patrocinado" o "Anuncio"; la alternativa local explicada no se vende y su "por qué" no cambia. | (Presentador) |
| ¿Los cupones son reales? | En la demo no: negocios y convenios simulados, marcados DEMO. El piloto empieza firmando convenios con negocios del centro. | (Demo) |
| ¿Cómo cobran? | Stripe Checkout y webhook; KinHop nunca ve la tarjeta. En la demo el Pro es simulado. | (Técnico) |
| ¿Por qué las rutas de Cancún son simuladas? | Las reglas no permiten usar APIs creadas por el equipo antes del evento. Están marcadas DEMO en la app; CDMX usa el GTFS oficial (REAL). | (Técnico) |
| ¿En qué se diferencia de Google Maps o TripAdvisor? | Ellos ordenan por popularidad o anuncios; KinHop ordena por dónde se queda el dinero y explica cada sugerencia con su fuente. | (Presentador) |
| ¿El medidor no depende de que el usuario marque? | Sí, y lo decimos: es su registro, local en su navegador. El siguiente paso es marcarlo solo al registrar el gasto desde la ficha. | (Demo) |
| ¿Escala a otra ciudad? | CDMX ya corre con el mismo motor; una ciudad nueva es un adaptador y una importación de OSM. | (Técnico) |

## Rehearsal checklist

- [ ] Pasada completa #1 con cronómetro, tiempo: ____ (más de 5:30 → recortar contenido, no hablar más rápido)
- [ ] Pasada completa #2, tiempo: ____
- [ ] Cada frase de relevo funciona (el siguiente empieza en menos de 2 segundos)
- [ ] El video de respaldo se reproduce en la máquina del pitch
- [ ] Cada responsable contesta su pregunta en voz alta una vez, sin leer
- [ ] Máquina del pitch: notificaciones apagadas, pestañas cerradas, cargador; sesión demo ya iniciada
- [ ] `npm run db:seed` hecho antes del pitch (fechas DEMO frescas y puestos patrocinados)
- [ ] Volver a entrar con la cuenta demo el día del pitch (el Pro simulado dura 30 días)
