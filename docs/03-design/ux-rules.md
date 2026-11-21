# UX/UI y movimiento

**Principio:** mobile-first (desde 360px), el mapa es protagonista, todo alcanzable con el pulgar. Sobrio, aireado, jerarquía tipográfica clara. Una acción principal por grupo (en lima).

## Tokens (fuente única: `apps/web/src/index.css`, bloque `@theme`)
Tema **oscuro con acento lima** ([ADR-0007](../adr/0007-tema-oscuro-acento-lima.md), sustituye el mundo "tarjeta de visita" de ADR-0005): fondo casi negro, texto blanco, superficies apenas más claras con borde fino y **un solo acento**, lima `#ccff00`.

### Paleta y contraste (WCAG 2.2 AA, medido)

| Token / clase | Valor | Uso | Contraste |
|---|---|---|---|
| `bg-paper` | #09090b | Fondo de página, cabecera y barra inferior (`/95` + `backdrop-blur`) | — |
| `bg-surface` | #141417 | Tarjetas, hojas, campos, botones secundarios | — |
| `bg-surface-hover` | #1c1c21 | Hover de piezas sobre `surface` | — |
| `bg-sunk` | #0f0f12 | Pozos: miniatura sin foto, avisos | — |
| `text-ink` | #ffffff | Texto principal | 19.9 paper · 18.4 surface |
| `text-ink-2` | #9ca3af | Texto secundario (fechas, lugar, etiquetas) | 7.8 paper · 7.2 surface · 6.4 sobre `bg-tint` |
| `text-ink-3` | #83838c | Texto atenuado (encabezados pequeños, placeholder, carga) | 5.3 paper · 4.9 surface · 4.5 surface-hover |
| `bg-accent` / `text-accent` (= `solid`) | #ccff00 | Acción principal, activo, foco (ver abajo) | 16.9 paper · 15.7 surface |
| `text-on-accent` (= `on-solid`) | #000000 | Texto e iconos **sobre** el lima | 17.9 accent · 14.4 accent-hover |
| `text-success` / `bg-success` | #22c55e | REAL, confirmaciones, punto de "Hoy" | 8.1 surface |
| `bg-info` | #60a5fa | Punto de "Próximamente" | punto decorativo junto a texto |
| `text-danger` | #ef4444 | Errores (siempre con texto) | 4.9 surface · 5.3 paper |
| `outline-image-edge` | blanco 10 % | Contorno interior de imágenes en tema oscuro; sin texto | — |
| `bg-scrim` | negro 70 % | Velo bajo texto sobre fotos; fondo de `<dialog>` | blanco sobre velo encima de foto blanca: 8.5 |
| `bg-tint` | blanco 5 % | Relleno de etiquetas; hover de botones de icono | — |
| `border-line` / `border-line-strong` | blanco 8 % / 16 % | Bordes finos de tarjetas, campos y separadores; `line-strong` en hover | decorativos: la pieza se reconoce por icono y texto |

**Mínimo obligatorio:** todo texto ≥ 4.5:1 sobre su fondo real (≥ 3:1 solo si es ≥ 24 px, o ≥ 18.7 px en negrita); iconos y bordes que sean la única pista de un estado, ≥ 3:1. `ink-3` es el texto más tenue permitido: nada de `text-ink-3/60` ni opacidades sobre texto. Si un token nuevo lleva texto, su ratio va en esta tabla.

### Cuándo usar el lima
- **Sí:** la acción principal de cada grupo (flecha de la tarjeta de evento, "Reintentar"), lo activo o elegido (pestaña de la barra inferior, categoría, idioma, "Más" abierto), el foco visible (`outline` de 2 px) y el icono de un aviso.
- **No:** texto de párrafo, títulos, fondos grandes, decoración, ni dos piezas lima compitiendo en el mismo grupo. Sobre el lima, el texto siempre es `text-on-accent` (negro), nunca blanco.
- Un brillo (`shadow-solid`, `shadow-glow-accent`) acompaña solo a piezas lima pequeñas.

### Estados

| Estado | Cómo se ve |
|---|---|
| Reposo | `bg-surface border-line text-ink` (o `text-ink-2` si es secundario) |
| Hover (`@media (hover: hover)`) | `border-line-strong` y/o `bg-surface-hover`; tarjetas suben 2 px con `shadow-lifted` |
| Pulsado | `press` (escala 0.96) de `motion.js`; nada de `active:scale-*` a mano además |
| Activo / elegido | `bg-accent border-accent text-on-accent shadow-solid`, o `text-accent` + filete lima en la barra inferior. Además del color, `aria-pressed`, `aria-current` o radio `checked` |
| Foco | `outline` lima de 2 px con 2 px de separación (regla global de `index.css`); si un campo quita el outline, su contenedor pasa a `border-accent` |
| Deshabilitado | `text-ink-3` y `cursor-not-allowed`; nunca solo opacidad |
| Error | `text-danger` + texto + `role="alert"` |

### Badges y etiquetas
- **Procedencia** (`DataStatusBadge`): obligatoria en todo dato de mapa o listas. REAL en `text-success`, DEMO en `text-ink`, reportado y sin verificar en `text-ink-2`; contorno `line-strong`. Nunca se oculta ni se colorea en lima.
- **Hoy / Próximamente** (tarjeta de evento): píldora `bg-scrim text-ink` sobre la foto con un punto `bg-success shadow-glow-success` (Hoy) o `bg-info shadow-glow-info` (Próximamente). El punto es decorativo (`aria-hidden`); el texto dice el estado. Se calcula con la fecha en la zona de la ciudad y nunca se aplica a eventos terminados.
- **Etiquetas de tema:** `bg-tint text-ink-2 rounded-full`, texto de `events.tags.*`.

### Forma, relieve y tipografía

| Token / clase | Uso |
|---|---|
| `rounded-control` 0.75 rem | Miniaturas, avisos y piezas internas |
| `rounded-card` 1 rem | Tarjetas, campos, paneles, foto del detalle |
| `rounded-sheet` 1.5 rem | Hojas y diálogos (`rounded-t-sheet` en móvil) |
| `rounded-full` | Solo chips, badges, segmentados, selector de ciudad y botones de icono |
| `shadow-raised` · `shadow-lifted` · `shadow-floating` · `shadow-embossed` · `shadow-sunk` · `shadow-well` | Tarjeta · tarjeta con puntero · hoja · pieza que se toca · campo hundido · pozo grande |
| `shadow-solid` · `shadow-glow-accent` · `shadow-glow-success` · `shadow-glow-info` | Brillos: solo piezas lima pequeñas e indicadores de estado |
| `label` · `title` · `display` · `font-mono` | Etiqueta corta · títulos de tarjeta y secciones · titular · datos (fechas, números) |

Tipografía: Archivo (variable) para todo, IBM Plex Mono solo para datos. Marca y títulos de pantalla en `text-2xl font-bold tracking-tight text-ink`.

### Prohibido en componentes
- Hex, `rgb()`/`rgba()` y colores de la paleta de Tailwind (`text-white`, `text-black`, `bg-black/70`, `bg-white/5`, `bg-blue-400`, `shadow-[0_0_6px_#60a5fa]`…). Si falta un color, se añade al `@theme` con nombre semántico y su fila en la tabla de arriba.
- Radios sueltos (`rounded-xl`, `rounded-2xl`, `rounded-3xl`): usar `rounded-control`, `rounded-card`, `rounded-sheet` o `rounded-full`.
- `transition-all` / `transition: all`: nombra las propiedades (`transition-colors`, `transition-transform`, `transition-[border-color,box-shadow]`) con `duration-150`.

Variante `short:` para pantallas de menos de 700 px de alto.

## Reglas
- HTML semántico (`header`, `main`, `section` con título, `button` para acciones), `lang="es"`.
- Texto: nunca fijo en el JSX; sale de `shared/i18n/locales/<idioma>.json` con `t()` (ver [i18n](i18n.md)). Diseña pensando en que el inglés y el español no miden lo mismo: nada de anchos fijos para texto.
- Iconos solo `lucide-react`, 16px junto a texto, `aria-hidden` si hay texto; `aria-label` si va solo. Nunca emojis.
- Estados obligatorios: carga (`aria-busy`), error (`role="alert"` + "Reintentar"), vacío con explicación, datos.
- Todo dato del mapa o listas lleva `DataStatusBadge` y su fuente.
- Táctil ≥ 44px (`size-11`, `min-h-11`) en todo lo que se toca, incluidos selector de ciudad, ajustes, cerrar e idioma; foco visible (contorno lima de 2 px); navegable con teclado (radios nativos para segmentados, `aria-pressed` en filtros que se activan y desactivan).
- Móvil: barra inferior (`BottomNav`) y fichas inferiores (`Sheet`); catálogo de pantallas y componentes en [screens](screens.md). Escritorio: panel lateral. El mapa nunca queda tapado del todo.
- `backdrop-blur` solo en cabecera, barra inferior, badges sobre foto y fondo de diálogos, siempre sobre un fondo de token casi opaco (`bg-paper/95`, `bg-scrim`) para no bajar el contraste. Sin degradados en texto.
- Filtros honestos: un filtro (categoría, búsqueda) nunca viene activado por defecto si esconde datos, y el vacío que produce lo dice ("ningún evento coincide…"), distinto del vacío real ("no hay eventos próximos").

## Movimiento
Guía completa y vocabulario: [motion.md](motion.md). Resumen:
- Con propósito: abrir ficha, activar capa, cambiar ciudad (`flyTo`). 150–300 ms para UI, curva `--ease-out-expo`. Nunca `transition: all`; hover dentro de `@media (hover: hover)`.
- `prefers-reduced-motion`: regla global en `index.css` + `flyTo` sin animación. Ninguna animación es la única pista de un cambio.

## Comprobación rápida (2 min)
Solo teclado · zoom 200% · 360/375/390 px sin scroll horizontal · reduced-motion activado · proyector 1280×720 · buscar en el diff `text-white`, `text-black`, `bg-black`, `bg-white`, hex, `rounded-2xl` y `transition-all` (debe dar cero).
