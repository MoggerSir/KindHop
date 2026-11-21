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
| Explorar | `app/screens/ExploreScreen.jsx` | Buscador de eventos (`EventSearch`): campo grande (atajo `/`, Escape borra), categorías (`CategoryGrid`), "cuándo" (Todo / Hoy / Esta semana) y resultados en filas (`EventCard variant="row"`) con lo buscado resaltado; abre el mismo detalle expandido que Inicio. Busca sin acentos en título, lugar y categoría; resultados al instante, URL y anuncio del recuento (`aria-live`) a los 300 ms. Filtros en la URL (`&q=&category=&when=`): se comparten y el "atrás" deshace categoría y cuándo. Estados: carga, error con Reintentar, ciudad sin eventos y sin resultados con "Prueba con" lugares reales y "Quitar filtros". Lugares (POI) aún no: llegan con KH-004 | IMPLEMENTADO para eventos (KH-005) |
| Mapa | `app/screens/MapScreen.jsx` | Mapa MapLibre oscuro + estado de capas de la ciudad | IMPLEMENTADO (capas: KH-006, KH-009, KH-012) |
| Billetera (`?tab=budget`) | `app/screens/BudgetScreen.jsx` | Presupuesto del viaje; hoy estado vacío honesto | PLANIFICADO (KH-010) |

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

## Patrones visuales (tokens de `src/index.css`; reglas en [ux-rules](ux-rules.md))

- **Membrete:** sello de tinta + `KINDHOP` en versalitas expandidas; ciudad en campo hundido; perfil como pieza grabada. Filete inferior, sin caja.
- **Tarjetas de evento:** cartulina `shadow-raised` con corte recto; foto arriba (sin texto encima) y texto impreso debajo: título `title`, fecha en `font-mono`, lugar en `text-ink-2`. La flecha del destacado es la única tarjeta negra. Alturas de foto en `dvh` (y `short:`) para que Inicio quepa sin scroll desde 375×667.
- **Segmentados** (días, idioma): pista `bg-sunk shadow-sunk` y una ficha `bg-surface shadow-embossed` que se desliza al elegido.
- **Categorías:** piezas grabadas (`shadow-embossed`) con icono de 1.5 px y etiqueta `label`. "Ver todo" se vuelve tarjeta negra al abrir y expande el resto debajo.
- **Barra inferior:** tinta para la activa con un filete bajo la etiqueta; el resto en `text-ink-3`.
- **Fechas** con `Intl.DateTimeFormat(locale, { timeZone: city.timezone })`: idioma de la app, hora de la ciudad.
- **Movimiento:** ver [motion.md](motion.md) (momento focal, expansiones con reversa, fichas que se deslizan, hojas).

## Añadir una pantalla nueva

1. `app/navigation/tabs.js`: entrada `{ id, Icon }` (icono de `lucide-react`).
2. `app/screens/<Nombre>Screen.jsx`: compone componentes de features; sin `fetch` ni lógica de negocio.
3. `app/App.jsx`: una línea `{tab === '<id>' && <NombreScreen … />}`.
4. Textos: `nav.<id>` y `screens.<id>.*` en `es.json` **y** `en.json`.
5. Estados: carga, error con "Reintentar" y vacío honesto. Probar a 390 px y 1440 px.
6. Fila en la tabla de pantallas de este documento y en `docs/FILEMAP.md`.

## Pendiente conocido

- La foto del mercado nocturno es la miniatura de 480 px (Wikimedia limitó la descarga de la de 960 px); por eso ese evento va en tarjeta compacta. Si pasa a destacado, sustituir `apps/web/public/demo/events/night-market.jpg` por la versión de 960 px (misma licencia CC0).
- Tipografía: Archivo (variable, anchura 62-125 %) e IBM Plex Mono autoalojadas en `apps/web/public/fonts/` (244 kB, OFL), declaradas en `src/index.css`.
- El detalle de evento no tiene "Cómo llegar" real: llega con transporte (KH-003, KH-006).
