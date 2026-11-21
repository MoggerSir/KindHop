# Pantallas y componentes de la web

Mapa de la app (mobile-first, desde 360 px), qué componente vive dónde y cómo añadir una pantalla. Reglas visuales: [ux-rules](ux-rules.md). Textos: [i18n](i18n.md). Decisiones de producto: [`apps/web/PRODUCT.md`](../../apps/web/PRODUCT.md).

## Estructura

```text
App.jsx ── AppHeader (marca · CityPicker · perfil → SettingsSheet)
        ├─ pantalla de la pestaña activa (app/screens/)
        └─ BottomNav (Inicio · Explorar · Mapa · Billetera)
```

La pestaña activa vive en la URL: `?tab=home|explore|map|budget` (+ `&q=`, `&category=` y `&when=today|week` en Explorar, `&city=` siempre). Cada cambio de pestaña crea entrada de historial: el "atrás" del móvil vuelve a la anterior. Código: `app/navigation/{tabs.js,useRoute.js}`. Sin librería de rutas.

## Pantallas

| Pestaña | Archivo | Qué muestra | Estado |
|---|---|---|---|
| Inicio | `app/screens/HomeScreen.jsx` | Categorías (filtro; tocar la activa lo quita) y "Recomendado por nosotros" en bento: destacado a todo lo ancho + mosaicos de dos columnas; "Ver más eventos" expande el resto. Sin buscador (está en Explorar) | IMPLEMENTADO con diseño oscuro y acento lima de la maqueta (KH-015) |
| Explorar | `app/screens/ExploreScreen.jsx` | Buscador de eventos (`EventSearch`): campo grande (atajo `/`, Escape borra), categorías (`CategoryGrid`), "cuándo" (Todo / Hoy / Esta semana) y resultados en filas (`EventCard variant="row"`) con lo buscado resaltado; abre el mismo detalle expandido que Inicio. Busca sin acentos en título, lugar y categoría; resultados al instante, URL y anuncio del recuento (`aria-live`) a los 300 ms. Filtros en la URL (`&q=&category=&when=`): se comparten y el "atrás" deshace categoría y cuándo. Estados: carga, error con Reintentar, ciudad sin eventos y sin resultados con "Prueba con" lugares reales y "Quitar filtros". Lugares OSM: mismo texto/categoría, lista independiente con ficha de fuente/fecha; el filtro de fecha solo afecta eventos; CDMX sin fuente muestra vacío honesto | IMPLEMENTADO para eventos y lugares (KH-005) |
| Mapa | `app/screens/MapScreen.jsx` | Mapa oscuro como fondo completo entre cabecera y navegación, fechas y controles flotantes, hoja inferior plegable con selección y lista accesible | IMPLEMENTADO (capas: KH-006, KH-009, KH-012) |
| Billetera (`?tab=budget`) | `app/screens/BudgetScreen.jsx` | Presupuesto local MXN, gastos manuales, disponible/exceso, gráfico e historial editable | IMPLEMENTADO (KH-010, en revisión) |

Referencia de diseño de Inicio: composición fiel a la maqueta móvil del equipo (tema oscuro con acento lima neón, tarjetas horizontales y barra de navegación de 4 pestañas).

## Catálogo de componentes

**Compartidos** (`src/shared/components/`, sin lógica de negocio, reutilizables en cualquier feature):

| Componente | Uso | Props clave |
|---|---|---|
| `Sheet` | Hoja inferior en móvil / diálogo en escritorio (`<dialog>` nativo: foco atrapado, Escape, tocar fuera) | `open`, `onClose`, `title`, `children` |
| `EmptyState` | Vacío honesto que explica por qué no hay datos | `icon`, `title?`, `children` |
| `LoadingState` / `ErrorState` | Carga y error con "Reintentar" | `children` / `error`, `hint`, `onRetry` |
| `DataStatusBadge` | Etiqueta REAL / DEMO / reportado / sin verificar | `status`, `onImage` (fondo sólido sobre fotos) |

**De layout** (`src/app/layout/`): `AppHeader`, `BottomNav`, `SettingsSheet`.

**De feature** (se importan solo desde el `index.js` de la feature):

| Feature | Exporta | Notas |
|---|---|---|
| `cities` | `useSelectedCity`, `CityPicker`, `ModuleStatusList` | `CityPicker` es un `<select>` nativo vestido de campo hundido |
| `events` | `EventsSection`, `EventSearch`, `WeekStrip`, `dayKey` | Internos: `EventCard` (`variant="featured" \| "tile" \| "row"`, marco y foto compartidos con el detalle), `EventMeta`, `EventDetail` (la tarjeta se expande hasta este panel), `useEvents`, `events.api.js`, `dates.js` y `search.js` (+ tests), `Highlight` |
| `discovery` | `CategoryGrid`, `CATEGORIES` | Categorías en `categories.js` (id + icono) |
| `map` | `CityMap` | Una instancia por pantalla Mapa |
| `budget` | `BudgetPanel` | Presupuesto local, formularios, gráfico SVG con leyenda textual, historial y CSV |

## Patrones visuales (tokens de `src/index.css`; reglas, contraste y cuándo usar el lima en [ux-rules](ux-rules.md))

- **Cabecera:** marca `KindHop` en `text-2xl font-bold text-ink`; selector de ciudad en píldora `bg-surface border-line` (≥ 44 px de alto); botón de ajustes redondo `size-11` con icono genérico (no hay cuentas). Fondo `bg-paper/95` con desenfoque y `border-b border-line`.
- **Buscador:** campo `rounded-card bg-surface border-line shadow-sunk`; al enfocar, el borde pasa a `border-accent`.
- **Categorías:** 5 piezas `rounded-card` (4 categorías + "Más"). Elegida: `bg-accent text-on-accent shadow-solid` y `aria-pressed="true"`; vuelve a tocarla para quitar el filtro. Por defecto ninguna está elegida. "Más" expande el resto debajo y se pone en lima mientras está abierto.
- **Tarjetas de evento:** fila `rounded-card bg-surface border-line shadow-raised`: miniatura `rounded-control` (o recuadro `bg-sunk` con icono si no hay foto) con badge Hoy/Próximamente encima, título en `text-ink`, fecha y lugar en `text-ink-2` con iconos `text-ink-3`, `DataStatusBadge` y etiquetas `bg-tint`. La flecha lima de la derecha es decorativa: toda la tarjeta abre el detalle.
- **Detalle (hoja):** `rounded-sheet`, fondo `bg-scrim` con desenfoque; foto con crédito o "sin foto", cuándo y dónde, aviso DEMO con icono lima y aviso honesto de transporte.
- **Segmentados** (idioma): pista `rounded-full bg-sunk border-line` y ficha lima `bg-accent` con texto `text-on-accent` que se desliza a la opción elegida.
- **Barra inferior:** 4 pestañas; la activa en `text-accent` con filete lima `shadow-glow-accent` y `aria-current="page"`; el resto en `text-ink-2`.
- **Fechas** con `Intl.DateTimeFormat(locale, { timeZone: city.timezone })`: idioma de la app, hora de la ciudad.
- **Movimiento:** ver [motion.md](motion.md) (entrada en cascada, expansiones con reversa, fichas que se deslizan, hojas).

## Añadir una pantalla nueva

1. `app/navigation/tabs.js`: entrada `{ id, Icon }` (icono de `lucide-react`).
2. `app/screens/<Nombre>Screen.jsx`: compone componentes de features; sin `fetch` ni lógica de negocio.
3. `app/App.jsx`: una línea `{tab === '<id>' && <NombreScreen … />}`.
4. Textos: `nav.<id>` y `screens.<id>.*` en `es.json` **y** `en.json`.
5. Estados: carga, error con "Reintentar" y vacío honesto. Probar a 390 px y 1440 px.
6. Fila en la tabla de pantallas de este documento y en `docs/FILEMAP.md`.

## Pendiente conocido

- La foto del mercado nocturno es la miniatura de 480 px (Wikimedia limitó la descarga de la de 960 px); basta para la miniatura de la tarjeta en fila. Si se muestra grande, sustituir `apps/web/public/demo/events/night-market.jpg` por la versión de 960 px (misma licencia CC0).
- Tipografía: Archivo (variable, anchura 62-125 %) e IBM Plex Mono autoalojadas en `apps/web/public/fonts/` (244 kB, OFL), declaradas en `src/index.css`.
- El detalle de evento no tiene "Cómo llegar" real: llega con transporte (KH-003, KH-006).
- `MapScreen` y `ExploreScreen` aún usan `text-white` y `rounded-2xl`; se pasan a tokens después de integrar el PR #17, que toca esos archivos.
- El buscador y las categorías filtran solo la lista de Inicio; las categorías ya no abren Explorar (`?tab=explore&category=`), que hoy solo se alcanza desde la barra inferior.

El mapa conserva `EventDetailSheet` (hoja nativa) como exportación pública de eventos; Inicio y Explorar usan el detalle compartido `EventDetail` para la expansión desde una tarjeta.
