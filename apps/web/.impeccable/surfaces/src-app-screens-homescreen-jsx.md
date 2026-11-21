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

OWN-WORLD: tarjeta de visita (ADR-0005): papel hueso, tinta, sin acento; cartulinas con corte recto y relieve (raised/embossed/sunk); Archivo ancha en versalitas para etiquetas y Plex Mono para fechas; la flecha del destacado es la única tarjeta negra. Movimiento según docs/03-design/motion.md.

STORY: el visitante ve de un vistazo qué hay hoy en su ciudad, sabe que los eventos son de ejemplo, cambia de día con el pulgar, abre un evento y ve cuándo, dónde y el crédito de la foto, o salta a Explorar por categoría.

FIRST VIEWPORT: a 390×844 (y 375×667 con `short:`): membrete (sello, KINDHOP, ciudad hundida, perfil) → lema que se compone → pista de 7 días → destacado (foto arriba, texto y flecha negra abajo) → dos compactas → Ver más eventos → categorías con Ver todo; barra inferior fija. Todo sin scroll. Acción principal: tocar el destacado.

FORM: referencia del usuario fijada; seed: none (pinned) — "asi debe lucir la primera pantalla y solo cambiale los colores y componentes para adaptarlos a los componentes que usamos y el estilo que usamos".

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
