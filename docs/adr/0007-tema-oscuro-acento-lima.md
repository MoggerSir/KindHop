# ADR-0007 — Tema oscuro con acento lima (maqueta del equipo)

**Fecha:** 2026-11-20 · **Estado:** Aceptado · **Sustituye:** el punto 1 (mundo visual "tarjeta de visita") de [ADR-0005](0005-tarjeta-de-visita-y-motion.md). El punto 2 de ADR-0005 (motion design) sigue vigente.

## Contexto
El equipo hizo una maqueta móvil nueva (fondo casi negro, acento verde lima neón, tarjetas en fila con badges y flechas, barra de 4 pestañas) y la integró en el PR #18 (KH-015). Los tokens de `apps/web/src/index.css` ya cambiaron, pero las reglas escritas (`ux-rules.md`, `screens.md`, `AGENTS.md`, ADR-0005) seguían describiendo el papel hueso sin acento y con esquinas de ≤ 3 px, así que las reglas y el código se contradecían.

## Decisión
1. **Tema oscuro único** (`color-scheme: dark`): fondo `paper` #09090b, superficies `surface` #141417 / `sunk` #0f0f12, texto `ink` blanco, `ink-2` #9ca3af e `ink-3` #83838c. No hay tema claro en el MVP.
2. **Un único acento, lima `#ccff00`** (`accent` = `solid`), con texto negro encima (`on-accent`). Se usa solo para: la acción principal de cada grupo, lo activo o elegido (pestaña, categoría, idioma), el foco visible y los iconos de aviso. Nunca como color de texto largo ni para decorar.
3. **Colores semánticos** con token propio: `success` (REAL, Hoy), `info` (Próximamente), `danger` (errores). Siempre acompañados de texto.
4. **Contraste medido** (WCAG 2.2 AA): todo texto ≥ 4.5:1 sobre su fondo. Por eso `ink-3` sube de #71717a (3.8:1 sobre `surface`) a #83838c (4.9:1).
5. **Formas suaves** con tokens: `rounded-control` 0.75 rem, `rounded-card` 1 rem, `rounded-sheet` 1.5 rem; `rounded-full` solo en chips, badges, segmentados y botones de icono. Los filetes pasan a bordes finos `border-line` / `border-line-strong`.
6. **Sin colores sueltos:** ni hex, ni `rgba()`, ni paleta de Tailwind (`text-white`, `bg-black/70`, `bg-blue-400`…) en componentes. Lo que falte se añade al `@theme` con nombre semántico (así nacen `info`, `scrim`, `tint` y los `shadow-glow-*`).
7. Se mantienen Archivo + IBM Plex Mono, las utilidades `label`/`title`/`display`, la variante `short:` y todo el vocabulario de movimiento de ADR-0005. Se retira el grano de papel.

## Consecuencias
- Reglas al día en [ux-rules](../03-design/ux-rules.md) (tokens, contraste, cuándo usar el lima, estados, badges) y [screens](../03-design/screens.md) (patrones visuales).
- Cambiar de nuevo el mundo visual = otro ADR; los tokens siguen todos en `@theme`.
- Pendiente fuera de este ADR: llevar a tokens los colores sueltos que quedan en `MapScreen` y `ExploreScreen` cuando se integre el PR #17, que toca esos archivos.
