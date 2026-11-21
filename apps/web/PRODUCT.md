# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Visitantes y residentes de Cancún (piloto principal) y Ciudad de México (prueba multicidad) que, con el móvil en la mano y a menudo en la calle, quieren decidir a dónde ir, cómo llegar en transporte local, qué eventos hay y cuánto llevan gastado en el viaje.

## Product Purpose
KindHop es una plataforma de decisiones urbanas mobile-first: reúne movilidad, lugares, eventos, incidencias y presupuesto de viaje en un solo lugar, y explica por qué recomienda cada opción. Éxito en el hackatón: una demo que cambia de ciudad, abre un lugar o evento, muestra cómo llegar y registra un gasto, todo con datos de procedencia visible.

## Positioning
Multicidad por adaptadores (cambiar de ciudad cambia fuentes, no la app) y decisiones explicables con procedencia: cada dato dice si es REAL, DEMO, reportado o sin verificar, con fuente y fecha. No promete IA mágica ni exclusividad tecnológica.

## Operating Context
Uso en la calle, de pie, con una mano y luz exterior variable; pantallas desde 360 px. Demo ante jueces en proyector (1280×720). Hackatón con equipo pequeño y agentes de IA trabajando en paralelo sobre el mismo repo.

## Capabilities and Constraints
- Web React + Vite + Tailwind, sin app nativa. Pantallas: Inicio (eventos y categorías), Explorar, Mapa, Presupuesto.
- Bilingüe español/inglés: todo texto de interfaz en `src/shared/i18n/locales/{es,en}.json`.
- Sin cuentas de usuario en el MVP (autenticación es P2); presupuesto local en el navegador, sin datos bancarios.
- Eventos: `GET /api/cities/:cityId/events` con datos DEMO de PostgreSQL (etiqueta DEMO).
- Prohibido inventar rutas, horarios, eventos o métricas presentados como reales; prohibido scraping de Google Maps.

## Brand Commitments
Nombre KindHop (juego con *kind*, *hop*, viaje y salto). Iconos solo `lucide-react`, nunca emojis en la interfaz.

## Evidence on Hand
Catálogo real de dos ciudades (`/api/cities`). Sin eventos, lugares, rutas ni testimonios reales todavía: cualquier contenido de ejemplo lleva la etiqueta DEMO. Fotos de ejemplo de Wikimedia Commons con licencia y crédito registrados en `docs/06-data/sources.md`.

## Product Principles
1. Datos honestos antes que pantallas llenas: procedencia visible y estados vacíos que dicen la verdad.
2. El pulgar manda: todo alcanzable con una mano, objetivos táctiles de 44 px.
3. Cambiar de ciudad o idioma nunca rompe la app.
4. Explicar cada recomendación: por qué, fuente, fecha y confianza.

## Accessibility & Inclusion
Teclado completo, foco visible, etiquetas en controles, contraste 4.5:1, objetivos de 44 px y respeto a `prefers-reduced-motion`.
