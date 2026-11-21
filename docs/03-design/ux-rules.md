# UX/UI y movimiento

**Principio:** mobile-first (desde 360px), el mapa es protagonista, todo alcanzable con el pulgar. Sobrio, aireado, jerarquía tipográfica clara. Una acción principal por vista.

## Tokens (fuente única: `apps/web/src/index.css`, bloque `@theme`)
Mundo **tarjeta de visita** ([ADR-0005](../adr/0005-tarjeta-de-visita-y-motion.md)): papel hueso, tinta casi negra, cortes rectos, relieve de imprenta, **sin color de acento**.

| Token / clase | Uso |
|---|---|
| `bg-paper` | Fondo de página |
| `bg-surface` | Cartulina realzada: tarjetas, hojas, botón secundario, ficha elegida |
| `bg-sunk` | Pozos hundidos: campos, pistas de segmentados, estados vacíos, avisos |
| `text-ink` / `text-ink-2` / `text-ink-3` | Texto principal / secundario (≥ 4.5:1) / opciones inactivas |
| `--color-line` / `--color-line-strong` | Filetes (como `shadow-[inset_0_-1px_0_var(--color-line)]`), nunca cajas con borde |
| `bg-solid` + `text-on-solid` + `shadow-solid` | La "tarjeta negra": **una** acción principal por grupo (flecha del destacado, Reintentar, Ver todo abierto) |
| `text-success` / `text-danger` | REAL y confirmaciones / errores (siempre con texto) |
| `shadow-raised` · `shadow-lifted` · `shadow-floating` · `shadow-embossed` · `shadow-sunk` · `shadow-well` | Relieves: tarjeta · tarjeta con puntero · hoja · pieza que se toca · hundido · pozo grande. **Pulsar hunde**: lo realzado pasa a `shadow-sunk` |
| `rounded-none` (tarjetas) · `rounded-control` 2 px · `rounded-sheet` 3 px | Forma angular: nada pasa de 3 px, nada de píldoras |
| `label` · `title` · `display` · `font-mono` | Versalitas expandidas (etiquetas, botones, navegación) · semiexpandida (títulos) · titular ancho y ligero · datos (fechas, números) |

**No hex ni colores sueltos en componentes**; si falta un token, se añade al `@theme` con nombre semántico. Variante `short:` para pantallas de menos de 700 px de alto.

## Reglas
- HTML semántico (`header`, `main`, `section` con título, `button` para acciones), `lang="es"`.
- Texto: nunca fijo en el JSX; sale de `shared/i18n/locales/<idioma>.json` con `t()` (ver [i18n](i18n.md)). Diseña pensando en que el inglés y el español no miden lo mismo: nada de anchos fijos para texto.
- Iconos solo `lucide-react`, 16px junto a texto, `aria-hidden` si hay texto; `aria-label` si va solo. Nunca emojis.
- Estados obligatorios: carga (`aria-busy`), error (`role="alert"` + "Reintentar"), vacío con explicación, datos.
- Todo dato del mapa o listas lleva `DataStatusBadge` y su fuente.
- Táctil ≥ 44px; foco visible (contorno de tinta de 1.5 px); navegable con teclado (radios nativos para segmentados).
- Móvil: barra inferior (`BottomNav`) y fichas inferiores (`Sheet`); catálogo de pantallas y componentes en [screens](screens.md). Escritorio: panel lateral. El mapa nunca queda tapado del todo.
- Sin glassmorphism que baje el contraste, sin degradados en texto, sin rejillas de tarjetas idénticas como estructura de página.

## Movimiento
Guía completa y vocabulario: [motion.md](motion.md). Resumen:
- Con propósito: abrir ficha, activar capa, cambiar ciudad (`flyTo`). 150–300 ms para UI, curva `--ease-out-expo`. Nunca `transition: all`; hover dentro de `@media (hover: hover)`.
- `prefers-reduced-motion`: regla global en `index.css` + `flyTo` sin animación. Ninguna animación es la única pista de un cambio.

## Comprobación rápida (2 min)
Solo teclado · zoom 200% · 360px sin scroll horizontal · reduced-motion activado · proyector 1280×720.
