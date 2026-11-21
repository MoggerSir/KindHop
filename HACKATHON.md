# HACKATHON.md: Hack Maya 2026 · KinHop

<!-- Generado con /hackathon-kickoff el 21/11/2026. Lo leen la demo (docs/05-delivery/demo.md), PITCH.md y
     .hackathon/state/*. Si el equipo pivota o recorta, actualiza este archivo primero. -->

## The one-liner

**KinHop lleva el gasto del turista a los negocios locales.**

Versión larga (para la ficha de entrega): app mobile-first que, cuando un visitante abre un lugar de cadena, le propone negocios locales cercanos de la misma categoría, explica por qué (fuente, distancia, confianza) y le muestra qué parte de su gasto se quedó en la ciudad. Pilotos: Cancún y CDMX.

**A diferencia de** Google Maps o TripAdvisor, que ordenan por popularidad o por anuncios, **KinHop ordena por dónde se queda el dinero** y explica cada sugerencia con su fuente y su confianza.

## Urgency hook

En nuestra importación de OpenStreetMap del 21/11/2026, **207 de los 656 comercios** de turista en Cancún (restaurantes, cafés, bares y tiendas) son de cadena: Oxxo, Starbucks, Walmart y otras. Un turista que sigue el mapa por defecto acaba gastando en marcas que ya conoce de casa, y ese dinero sale de Cancún. Los negocios locales no tienen presupuesto para competir en anuncios. Hoy nadie le dice al turista, en el momento de decidir, dónde su dinero se queda en la ciudad.

> Solo usamos cifras propias y verificables (la consulta está en `scripts/fetch-osm-pois.mjs`). Cualquier dato externo de "fuga turística" necesita su fuente antes de decirse en el escenario.

## Modelo de ingresos

Detalle y estado en [`docs/02-modules/monetization.md`](docs/02-modules/monetization.md). Precios propuestos en `apps/web/src/features/monetization/pricing.js`.

| Fuente | Quién paga | Precio propuesto |
|---|---|---|
| Anuncios AdMob (usuarios gratis) | anunciantes vía Google | por impresión / clic |
| Eventos destacados: puestos 1, 2 y 3 | organizadores | $599 / $399 / $249 MXN por semana |
| Negocio local destacado (búsqueda, recomendación y mapa) | negocios locales | $299 MXN / mes |
| Anuncio personalizado propio en app y web | negocios locales | desde $1,500 MXN / mes |
| KinHop Pro (Stripe): sin anuncios un mes + cupones en negocios con convenio | turistas | $59 MXN / mes |

Regla: todo lo pagado lleva «Patrocinado» o «Anuncio». Los 3 primeros eventos recomendados son los puestos pagados; la alternativa local explicada no se vende.

## Judging rubric

No hay rúbrica oficial publicada (21/11/2026). Usamos pesos estándar y los ajustamos cuando la publiquen.

| Criterion | Weight | Our proof point (what a judge can see working in 30 seconds) |
|---|---|---|
| Impacto (turismo + economía local) | 30% | Abrir "Starbucks" en Explorar → "Cadena según OpenStreetMap" → 3 negocios REAL de OSM sin marca de cadena registrada (probablemente locales) a 186–312 m, cada uno con su "por qué" |
| Originalidad | 25% | La recomendación no es "lo mejor valorado" sino "lo que deja el dinero en la ciudad", y cada sugerencia dice su fuente y su confianza (MEDIUM, nunca inventada) |
| Ejecución técnica | 25% | Datos REAL de OSM (774 lugares), motor determinista con tests (99 API + 34 web), login Google con sesiones de servidor, segunda ciudad (CDMX, Metrobús L1 GTFS REAL) con el mismo motor |
| Presentación / demo | 20% | Guion de 5 pasos en `docs/05-delivery/demo.md`, video de respaldo, PITCH.md cronometrado |

Transversales del reto: **inclusión** (pequeños comercios sin presupuesto de anuncios aparecen en el momento de la decisión) y **medio ambiente** (las alternativas están a pie: 186–312 m en el ejemplo; transporte público en el mapa).

## Angle decision

Gut-score 1–5 por criterio, ponderado con los pesos de arriba.

| Angle | Impacto 30% | Originalidad 25% | Técnica 25% | Demo 20% | Weighted |
|---|---|---|---|---|---|
| **A (chosen): Gasto local** | 5 | 5 | 4 | 4 | **4.55** |
| B: Viaje dentro del presupuesto | 4 | 3 | 5 | 4 | 4.00 |
| C: Turismo resiliente (incidencias) | 4 | 4 | 3 | 3 | 3.55 |

**Why A:** es el único ángulo en el que turismo y economía son la misma acción (dónde gasta el turista), y se apoya en un dato abierto real (`brand` de OSM) que ya tenemos importado.

Plan B ya construido: el motor también sugiere por presupuesto bajo (gratis primero) y por incidencia cercana. Si un juez pregunta por resiliencia, existe la API (`/reports`) aunque no está en el guion.

## Phase plan (back-solved from the deadline)

Quedan entre 6 y 12 horas (21/11/2026). Pitch de 5 minutos.

| Checkpoint | Time | Deliverable | Skill / command | Owner |
|---|---|---|---|---|
| Kickoff | T+0 | Este archivo | `/hackathon-kickoff` | todos |
| **Feature Zero** | T+1h | Starbucks → alternativa local → gasto marcado → medidor (hecho, KH-020) | — | Técnico |
| Integración | T+2h | PR de KH-020 y #33 revisados y fusionados en `developers` | revisión de PR | dueño del repo |
| Despliegue estable | T+4h | URL fija para el jurado + callback de Google con ese dominio (OPEN-QUESTIONS #10) | — | Técnico |
| QA + polish | T+5h | Recorrido del guion en el teléfono real, sin errores | `/judge-sim` | Demo |
| Video de respaldo | T+6h | Grabación del guion de 5 pasos | — | Demo |
| Pitch script | T+6h | `PITCH.md` | `/pitch-timebox` | Presentador |
| Rehearsal ×2 | T+7h | Dos pasadas bajo 5:00 | — | todos |
| **Submission** | fecha límite | Release `developers` → `main`, README, video | — | dueño del repo |

## Team

Por completar: no tenemos la lista de integrantes. Roles mínimos:

| Name | Strengths | Owns (build) | Pitch section |
|---|---|---|---|
| (Presentador) | contar la historia | HACKATHON.md, PITCH.md | Gancho + impacto + cierre |
| (Demo) | manejar la app en vivo | guion, video de respaldo | Demo en vivo |
| (Técnico) | API, datos, despliegue | KH-020, despliegue | Preguntas técnicas |

## Scope cuts (running log)

Si vamos tarde, se corta de arriba hacia abajo:

1. Paso CDMX de la demo (se menciona en una frase: "misma app, otra ciudad").
2. Capa de incidencias en la web (la API existe; no se enseña).
3. Ruta para llegar (rutas DEMO simuladas): se dice, no se enseña.
4. Pulido visual extra de la Billetera.

Nunca se corta: la ficha con la alternativa local explicada y el medidor de gasto local. Son la tesis.
