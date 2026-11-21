# Movimiento (motion design)

Toda la app se mueve: entradas, expansiones, fichas que se deslizan, hojas que suben. El movimiento es **suave, preciso y físico**: curvas que desaceleran y se posan, resortes sin rebote y texto que llega nítido. Explica qué pasó, de dónde viene algo y qué importa. Si quitar una animación no hace perder significado ni carácter, sobra.

Reglas combinadas de los proyectos del equipo Galería de imágenes (expansiones y paneles en cascada, rendimiento) y Larpatron (vocabulario, relieve), reescritas para KinHop. Decisión: [ADR-0005](../adr/0005-tarjeta-de-visita-y-motion.md) (punto 2, vigente; el mundo visual lo fija [ADR-0007](../adr/0007-tema-oscuro-acento-lima.md)).

## Dónde está

| Pieza | Ruta |
|---|---|
| Vocabulario (curvas, resortes, variantes) | `apps/web/src/shared/motion/motion.js` |
| Seguir con el scroll a un panel que se expande | `apps/web/src/shared/motion/useRevealScroll.js` |
| Movimiento reducido global | `MotionConfig reducedMotion="user"` en `apps/web/src/main.jsx` |
| Librería | `motion` (`motion/react`), la misma de Galería y Larpatron |

**Usa siempre los nombres del vocabulario**, nunca números sueltos en un componente.

## Vocabulario

| Nombre | Qué es | Para |
|---|---|---|
| `ease.outExpo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Llegadas con aplomo: entradas |
| `ease.fluid` | `cubic-bezier(0.2, 0, 0, 1)` | Cambios de estado, salidas de paneles |
| `ease.sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` | Hojas y paneles que se deslizan |
| `spring.snappy` | 0.3 s, rebote 0 | Fichas e indicadores que se deslizan (`layoutId`), iconos, hover |
| `spring.layout` | 0.45 s, rebote 0 | Reacomodos de listas |
| `spring.reveal` | 0.55 s, rebote 0 | Paneles que se expanden |
| `spring.sheet` | 0.5 s, rebote 0 | Hojas (`Sheet`) |
| `spring.morph` | `visualDuration` 0.55, rebote 0 | Elemento compartido tarjeta → detalle. Respeta la velocidad del gesto: cerrar a mitad de la apertura vuelve con esa inercia (lo "orgánico" sale de aquí, no del rebote) |
| `press` | escala 0.96 en 150 ms | `whileTap` de todo lo que se toca |
| `fadeRise` | sube 12 px y aparece (600 ms); sale hacia arriba en 150 ms | Entrada de un bloque |
| `stagger(paso, retraso)` | padre que escalona a sus hijos | Entradas poco frecuentes |
| `typeSet` | la palabra sube desde debajo de su línea (padre con `overflow: hidden`) | El momento focal |
| `expand` + `cascadeItem` | panel que crece con resorte y piezas en cascada; al cerrar, en reversa | "Ver más eventos", "Ver todo" |
| `tileReveal` | sube 16 px y se enfoca (desenfoque 4 px → 0) con resorte de 0.6 s | Piezas del bento en cascada |
| `photoSettle` | la foto entra al 112 % y se asienta en 1,2 s | Fotos de eventos (solo la foto, dentro de su marco) |
| `iconPop` | escala 1 → 1.22 → 1 en 420 ms | Icono de la categoría o pestaña recién elegida |
| `iconSwap` | escala 0.25 → 1, opacidad y desenfoque 4 px (el único desenfoque) | Cambio de icono ("…" → "×") |
| `fadeOnly` | fundido de 150 ms | Movimiento reducido y cambio de pestaña |

`bounce` siempre es 0. Nada de curvas elásticas ni `linear` (salvo un giro continuo).

## Recetas en la app

| Momento | Cómo se mueve | Dónde |
|---|---|---|
| **Entrada de Inicio** (uno por pantalla) | Categorías y bento entran en cascada (`stagger(0.08)` + `fadeRise`). `typeSet` queda en el vocabulario para un titular focal, hoy sin uso | `HomeScreen` |
| **Expansión** | El panel crece con `spring.reveal`; sus piezas entran con `cascadeItem` cada 60 ms; **la página baja con él** (`useRevealScroll`) para mostrarlo entero sobre la barra inferior | `CategoryGrid` ("Más"), `EventsSection` ("Ver más eventos") |
| **Plegado** | Reversa exacta: las piezas se hunden de la última a la primera (35 ms entre piezas) y **después** el panel se pliega (`when: 'afterChildren'`) | Los mismos |
| **Fichas que se deslizan** | Un solo elemento con `layoutId` viaja entre opciones con `spring.snappy` | Día elegido (`WeekStrip`), idioma (`LanguageSwitcher`), filete de la pestaña activa (`BottomNav`) |
| **Tarjeta → detalle** (momento focal de Inicio) | La pieza del bento se expande hasta ser el panel: marco y foto compartidos (`layoutId` `event-${id}` / `event-media-${id}`, `spring.morph`); su hueco queda reservado; el contenido entra en cascada; al cerrar, vuelve a su hueco. Capa en portal con `layoutRoot`, sin `<dialog>` (su top layer no está soportado por el layout). Al empezar a salir (`useIsPresent`) deja de capturar toques, sale del árbol de accesibilidad y devuelve el foco a la tarjeta | `EventCard`, `EventDetail` |
| **Tarjetas** | La pieza **no se mueve** con el puntero (se escaparía del cursor): hace zoom lento la foto dentro del marco y la flecha avanza 2 px; al pulsar, 0.96 | `EventCard` |
| **Píldora de categoría** | Una sola píldora lima viaja a la categoría elegida (`layoutId="category-pill"`, `spring.snappy`); el color del texto llega con 120 ms de retraso para no quedar negro sobre oscuro mientras viaja; `iconPop` en el icono | `CategoryGrid` |
| **Bento** | Entrada en cascada con `tileReveal` (70 ms); al filtrar, las piezas se reacomodan con `layout` | `EventsSection` |
| **Cambio de día** | El destacado y la rejilla se intercambian: entra el nuevo subiendo, sale el viejo (`AnimatePresence mode="popLayout"`) | `EventsSection` |
| **Hoja** | Sube 48 px con `spring.sheet`; su contenido entra en cascada; al cerrar baja 24 px y se desvanece en 150 ms **antes** de cerrarse el `<dialog>` | `Sheet` (Ajustes) |
| **Cambio de icono** | `iconSwap` dentro de `AnimatePresence mode="popLayout" initial={false}` | "Ver todo" ↔ "Ver menos" |
| **Resultados de búsqueda** (frecuente) | Sin cascada: al escribir o filtrar, las filas entran y salen con `fadeOnly` (150 ms) y las que quedan se reacomodan con `layout="position"` (`spring.layout`, solo `transform`); el "cuándo" es una ficha que se desliza (`layoutId="explore-when"`). La fila abre el detalle con el mismo marco compartido que el bento | `EventSearch`, `EventCard variant="row"` |
| **Cambio de pestaña** | Solo fundido de 150 ms (es frecuente); cada pantalla trae su propia entrada | `App` |
| **Estados vacío y de error** | Entran con `fadeRise` | `EmptyState`, `ErrorState` |

## Reglas

1. **Un solo momento focal por pantalla.** No repitas la misma entrada vistosa en cada sección.
2. **Interacciones frecuentes, sin espectáculo:** cambiar de pestaña, escribir o pasar el puntero por filas responden al instante o con 150 ms de opacidad o color. El movimiento expresivo es para lo poco frecuente: la primera carga, una expansión, un éxito, un vacío.
3. **La salida es más corta y más pequeña que la entrada.** Lo que se expandió se pliega **en reversa**.
4. **Escalonado** solo en entradas poco frecuentes (100 ms entre grupos, 60-70 ms entre piezas o palabras). Nunca en listas que cambian de contenido.
5. **Anima `transform` y `opacity`** (y `filter` solo en `iconSwap`). Para alturas usa las variantes de Motion (`height: 'auto'`), nunca `width`/`top`/`margin` a mano. `backdrop-filter` nunca se anima.
6. **Estado interactivo con transiciones o resortes** (se pueden invertir a mitad); `@keyframes` solo para secuencias de una vez. Nunca `transition: all` ni la clase `transition-all`: nombra las propiedades (`transition-colors`, `transition-transform`, `transition-[border-color,box-shadow]`) con `duration-150`, y no dupliques en CSS lo que ya anima Motion (`whileHover`, `whileTap`).
7. **`AnimatePresence initial={false}`** en cambios de estado, para que el estado inicial no se anime al cargar.
8. **Nunca un contenido oculto por defecto que solo una animación revela.** Si la animación no corre, el contenido debe verse (la prueba de abajo lo comprueba).
9. **El movimiento nunca es la única pista:** todo cambio lleva también color, icono, texto o `aria-expanded`/`aria-current`.
10. **Rendimiento:** `will-change` solo si ves tirones, nombrando la propiedad. No uses `layout` en listas de más de ~40 elementos (en resultados de búsqueda, `layout="position"`: el mismo reacomodo, solo con `transform`). Un `onUpdate` que toca el DOM (como `useRevealScroll`) debe ser barato y apagarse al terminar. Una lista de cientos de filas no lleva un `whileTap` por fila: usa `.tap-press` (la misma escala 0.96 en 150 ms) y páginala.
11. **Hover** dentro de `@media (hover: hover)` (Tailwind 4 `hover:` ya lo hace; `whileHover` de Motion ignora el táctil).

## Movimiento reducido (obligatorio)

- `MotionConfig reducedMotion="user"` quita desplazamientos y escalas y deja los fundidos en toda la app.
- Para alturas y recorridos (expansiones, hojas) usa `useReducedMotion()` y cambia a `fadeOnly`, como en `CategoryGrid` y `Sheet`.
- CSS propio: movimiento solo con `motion-safe:`; la regla global de `index.css` acorta las transiciones.

## Cómo probarlo

- DevTools → Rendering → *Emulate CSS prefers-reduced-motion: reduce*: todo sigue visible y usable.
- DevTools → Animations → velocidad al 10 % para revisar curvas y cascadas.
- Automático: el guion de QA de Playwright comprueba que tras cargar no queda ningún elemento con opacidad 0, con y sin movimiento reducido.
