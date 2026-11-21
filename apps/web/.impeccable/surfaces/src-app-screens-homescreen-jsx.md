---
version: 1
slug: "src-app-screens-homescreen-jsx"
primary_target: "src/app/screens/HomeScreen.jsx"
related_targets: ["src/features/events/EventsSection.jsx"]
---

# Pantalla de inicio (pestaña Inicio)

**Alcance y modo:** pantalla principal de la app web mobile-first; modo Operate (decidir qué hacer hoy en la ciudad). Extiende el mundo visual existente (tokens de `src/index.css`), no lo reemplaza.

**Audiencia y tarea:** visitante en la calle, con una mano, que quiere ver qué pasa hoy y los próximos días y abrir un evento. Contenido: eventos DEMO (hasta KH-014) con fotos de Wikimedia Commons acreditadas; categorías que llevan a Explorar.

**Restricciones:** todo texto en `src/shared/i18n/locales/{es,en}.json`; etiqueta DEMO visible en cada evento de ejemplo; sin cuentas (el botón de perfil abre Ajustes); barra inferior Inicio / Explorar / Mapa / Presupuesto; objetivos táctiles de 44 px.

## Direction contract

THESIS: la referencia del usuario fija la composición (marca + ciudad + perfil, tira de 7 días, evento destacado a sangre, dos eventos en rejilla, "ver más", categorías, barra inferior); se rechaza su tema oscuro con acento neón y se traduce al mundo claro de KindHop.

OWN-WORLD: fondo `paper` verdoso, superficies blancas con anillo `line`, acento teal `#0e7c74` solo para día elegido, flecha del destacado, iconos de categoría y pestaña activa; fotos a sangre con degradado de tinta para el texto blanco; esquinas de 24 px en tarjetas, 16 px en chips.

STORY: el visitante ve de un vistazo qué hay hoy en su ciudad, sabe que los eventos son de ejemplo, cambia de día con el pulgar, abre un evento y ve cuándo, dónde y el crédito de la foto, o salta a Explorar por categoría.

FIRST VIEWPORT: a 390 px: cabecera (marca, píldora de ciudad, perfil) → lema → 7 chips de día → evento destacado (≈ 320 px de alto, título 30 px, flecha teal) → dos tarjetas compactas → "Ver más eventos"; barra inferior fija. Acción principal: tocar el evento destacado.

FORM: referencia del usuario fijada; seed: none (pinned) — "asi debe lucir la primera pantalla y solo cambiale los colores y componentes para adaptarlos a los componentes que usamos y el estilo que usamos".

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
