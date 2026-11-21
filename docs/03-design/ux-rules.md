# UX/UI y movimiento

**Principio:** mobile-first (desde 360px), el mapa es protagonista, todo alcanzable con el pulgar. Sobrio, aireado, jerarquía tipográfica clara. Una acción principal por vista.

## Tokens (fuente única: `apps/web/src/index.css`, bloque `@theme`)
`paper` fondo · `surface` tarjetas · `ink` / `ink-2` texto (≥ 4.5:1) · `line` bordes · `accent` acción principal y foco · `status-real` / `status-demo` / `status-unverified` procedencia · `danger` errores. Se usan como clases Tailwind (`bg-surface`, `text-ink-2`, `ring-line`). **No hex sueltos en componentes**; si falta un token, se añade al `@theme` con nombre semántico.

## Reglas
- HTML semántico (`header`, `main`, `section` con título, `button` para acciones), `lang="es"`.
- Texto: nunca fijo en el JSX; sale de `shared/i18n/locales/<idioma>.json` con `t()` (ver [i18n](i18n.md)). Diseña pensando en que el inglés y el español no miden lo mismo: nada de anchos fijos para texto.
- Iconos solo `lucide-react`, 16px junto a texto, `aria-hidden` si hay texto; `aria-label` si va solo. Nunca emojis.
- Estados obligatorios: carga (`aria-busy`), error (`role="alert"` + "Reintentar"), vacío con explicación, datos.
- Todo dato del mapa o listas lleva `DataStatusBadge` y su fuente.
- Táctil ≥ 44px; foco visible (anillo `accent`); navegable con teclado (radios nativos para segmentados).
- Móvil: barra inferior (`BottomNav`) y fichas inferiores (`Sheet`); catálogo de pantallas y componentes en [screens](screens.md). Escritorio: panel lateral. El mapa nunca queda tapado del todo.
- Sin glassmorphism que baje el contraste, sin degradados en texto, sin rejillas de tarjetas idénticas como estructura de página.

## Movimiento
- Con propósito: abrir ficha, activar capa, cambiar ciudad (`flyTo`). 150–300 ms para UI, curva `--ease-out-expo`. Nunca `transition: all`; hover dentro de `@media (hover: hover)`.
- `prefers-reduced-motion`: regla global en `index.css` + `flyTo` sin animación. Ninguna animación es la única pista de un cambio.

## Comprobación rápida (2 min)
Solo teclado · zoom 200% · 360px sin scroll horizontal · reduced-motion activado · proyector 1280×720.
