# ADR-0005 — Mundo "tarjeta de visita" (Larpatron) y motion design (Galería)

**Fecha:** 2026-11-20 · **Estado:** Aceptado · **Sustituye:** el punto 2 de [ADR-0002](0002-reglas-larpatron-y-tooling.md) (tokens teal con acento)

## Contexto
El equipo vio la primera versión de Inicio (fondo verdoso, acento teal, esquinas redondeadas) y la rechazó por fea. Pidió componentes sobrios y minimalistas como los de Larpatron, y que toda la app se mueva con motion design fluido, con expansiones, como en el proyecto Galería de imágenes y con sus mismas reglas.

## Decisión
1. **Mundo visual "tarjeta de visita"** de Larpatron, **reescrito en Tailwind** (no se copia código: regla de oro 1):
   - Papel hueso y tinta casi negra; **sin color de acento**. La acción principal es la "tarjeta negra" (`bg-solid`).
   - Relieves de cartulina como sombras de `@theme`: `shadow-raised`, `shadow-lifted`, `shadow-floating`, `shadow-embossed`, `shadow-sunk`, `shadow-well`, `shadow-solid`.
   - Forma angular: tarjetas con corte recto y nada por encima de 3 px (`rounded-control` 2 px, `rounded-sheet` 3 px).
   - Archivo variable (ejes de peso y anchura) para todo; IBM Plex Mono solo para datos (fechas, números). Utilidades `label` (versalitas expandidas), `display` y `title`.
   - Grano de papel fijo y estático.
   - **Fuentes:** archivos OFL tomados del build de Larpatron (Fontsource), en `apps/web/public/fonts/`. Inter se retira.
2. **Motion design** con la librería `motion` (la misma de Galería y Larpatron). Vocabulario en `shared/motion/motion.js`; reglas en [`docs/03-design/motion.md`](../03-design/motion.md).
3. **`eslint-plugin-react`** (solo la regla `react/jsx-uses-vars`), para que ESLint entienda las variables usadas solo en JSX (`<Icon />`, `<motion.div>`) sin excepciones ad hoc.
4. Se amplía el stack fijo de `AGENTS.md`: `motion` y `eslint-plugin-react` quedan aceptados.

## Consecuencias
- Unos 65 kB más de JavaScript comprimido (`motion`). Aceptable para una demo; si pesa, se puede usar `LazyMotion` con `domAnimation`.
- Los colores de procedencia también son monocromos: REAL en verde gris (`text-success`) y el resto en tinta. La etiqueta DEMO sigue siempre visible.
- Cambiar el mundo de nuevo = un ADR que sustituya este. Los tokens están todos en `apps/web/src/index.css` (`@theme`), así que el cambio queda casi entero en un archivo.
