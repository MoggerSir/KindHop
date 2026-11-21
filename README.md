<div align="center">

# KinHop

**Lleva el gasto del turista a los negocios locales.**

Cuando abres un lugar de cadena, KinHop te propone negocios locales cercanos de la misma categoría, explica por qué (fuente, distancia y confianza) y te deja registrar qué parte de tu gasto se quedó en la ciudad.

<a href="../../actions/workflows/ci.yml"><img alt="CI" src="../../actions/workflows/ci.yml/badge.svg?branch=developers"></a>
<img alt="Licencia: pendiente" src="https://img.shields.io/badge/licencia-pendiente-lightgrey">
<img alt="Node ≥ 22.12" src="https://img.shields.io/badge/node-%E2%89%A5%2022.12-339933?logo=nodedotjs&logoColor=white">
<img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white">
<img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white">
<img alt="Express 5" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white">
<img alt="PostgreSQL 17" src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white">
<img alt="MapLibre GL" src="https://img.shields.io/badge/MapLibre-GL-396CB2?logo=maplibre&logoColor=white">
<img alt="Idiomas ES/EN" src="https://img.shields.io/badge/i18n-ES%20%7C%20EN-c8ff00">

**Hack Maya 2026** · líneas turismo y economía · pilotos **Cancún** (principal) y **Ciudad de México** (prueba multicidad)

<img src="docs/assets/readme/hero.webp" alt="Tres capturas reales de KinHop en un móvil: Inicio con eventos, la ficha de un Starbucks con «Alternativa local cerca» y el mapa de Ciudad de México con la línea 1 del Metrobús" width="100%">

[Guía para el jurado](#guía-rápida-para-el-jurado-5-minutos) · [Funciones](#recorrido-por-la-app) · [Datos: REAL vs DEMO](#honestidad-de-datos-real-vs-demo) · [Arquitectura](#arquitectura) · [Correrlo en local](#cómo-correrlo-en-local) · [English summary](#english-summary)

</div>

---

## Índice

1. [El problema y la propuesta](#el-problema-y-la-propuesta)
2. [Guía rápida para el jurado (5 minutos)](#guía-rápida-para-el-jurado-5-minutos)
3. [Recorrido por la app](#recorrido-por-la-app)
4. [Honestidad de datos: REAL vs DEMO](#honestidad-de-datos-real-vs-demo)
5. [Modelo de negocio](#modelo-de-negocio)
6. [Arquitectura](#arquitectura)
7. [Cómo correrlo en local](#cómo-correrlo-en-local)
8. [Tests y CI](#tests-y-ci)
9. [Despliegue (resumen)](#despliegue-resumen)
10. [Rendimiento, accesibilidad e idiomas](#rendimiento-accesibilidad-e-idiomas)
11. [Limitaciones y roadmap](#limitaciones-y-roadmap)
12. [Para quien desarrolla: mapa del repo](#para-quien-desarrolla-mapa-del-repo)
13. [Equipo, licencia y créditos](#equipo-licencia-y-créditos)
14. [English summary](#english-summary)

---

## El problema y la propuesta

**El problema.** Un turista independiente que decide en el momento dónde comer o comprar suele elegir lo que reconoce. En nuestra importación de OpenStreetMap del 21/11/2026, **207 de los 656 comercios** de turista en Cancún (restaurantes, cafés, bares y tiendas) tienen marca de cadena registrada (Oxxo, Starbucks, Walmart y otras). La hipótesis del equipo es que mostrar alternativas cercanas *en el momento de elegir* puede hacer visibles más negocios del destino.

> Esa cifra sale de nuestra propia consulta ([`scripts/fetch-osm-pois.mjs`](scripts/fetch-osm-pois.mjs)). No demuestra fuga económica, propiedad local ni hábitos del turista: son hipótesis que hay que validar ([HACKATHON.md](HACKATHON.md)).

**La propuesta.** Una app mobile-first que reúne lugares, eventos, mapa, transporte y presupuesto de viaje, con una acción central:

| | |
|---|---|
| 🔎 **Descubrir** | Buscas un lugar. Si OpenStreetMap lo registra como **cadena**, KinHop lo dice. |
| 🧭 **Decidir** | Te propone negocios **sin marca de cadena** registrada, de la misma categoría y cercanos, cada uno con su **«por qué»**: fuente, distancia y confianza (siempre *media*, nunca *alta*: «sin marca en OSM» no prueba que sea local). |
| 💸 **Registrar** | En la **Billetera** marcas qué gastos hiciste en negocios locales y un medidor muestra qué parte de tu gasto se quedó en la ciudad. Es un registro personal, no una medición bancaria. |

**Para quién.** Primer usuario: el turista independiente (sin «todo incluido») que se mueve con el teléfono por el centro de Cancún. Segundo beneficiado: el pequeño comercio que aparece en la decisión sin pagar publicidad (la alternativa local explicada **no se vende**).

**Por qué importa.** Une las dos líneas del reto en una sola acción, *dónde gasta el turista*, con temas transversales: **inclusión** (comercios sin presupuesto de anuncios) y **medio ambiente** (en el ejemplo de la demo, las alternativas están a 186–312 m, a pie, y el mapa muestra transporte público). Visión completa: [`docs/00-product/vision.md`](docs/00-product/vision.md).

---

## Guía rápida para el jurado (5 minutos)

| Material | Dónde |
|---|---|
| 🎬 Video de apoyo del pitch (5:00, 1920×1080, sin narración) | [`docs/05-delivery/kinhop-demo-jurado.mp4`](docs/05-delivery/kinhop-demo-jurado.mp4) |
| 🗣️ Discurso de 5 minutos y preguntas probables | [`PITCH.md`](PITCH.md) · [`docs/05-delivery/kinhop-speech-5min.md`](docs/05-delivery/kinhop-speech-5min.md) |
| 🧪 Guion de demo en vivo con fallbacks honestos | [`docs/05-delivery/demo.md`](docs/05-delivery/demo.md) |
| 🎯 Ángulo, rúbrica y plan del hackatón | [`HACKATHON.md`](HACKATHON.md) |
| 🌐 Demo en línea (cuenta demo incluida) | https://kinhop.campusconnet.com.mx |

<a href="docs/05-delivery/kinhop-demo-jurado.mp4"><img src="docs/05-delivery/kinhop-demo-jurado-portada.jpg" alt="Portada del video de 5 minutos para el jurado" width="560"></a>

**Recorrido de 5 pasos** (con la app en local, ver [cómo correrla](#cómo-correrlo-en-local)):

1. **Entrar con la cuenta demo** → Inicio en Cancún (cuenta *Pro simulada*).
2. **Explorar → escribir «Starbucks» → abrir un resultado.** Verás «Cadena según OpenStreetMap» y negocios REAL sin marca de cadena a 186–312 m, cada uno con su «por qué».
3. **Leer un «por qué»:** fuente (OpenStreetMap vía Overpass), distancia y **confianza media**, y por qué no es alta.
4. **Billetera → «Añadir gasto»** → Comida, 120, marcar «Lo pagué en un negocio local» → el medidor sube (los datos DEMO arrancan en 22 %).
5. **Cambiar a Ciudad de México:** Metrobús línea 1 (GTFS oficial, REAL) y alcaldías en el mapa, con el mismo motor.

**Qué mirar:** cada dato lleva su etiqueta `Real` / `Demo` y su fuente; lo pagado lleva «Patrocinado» o «Anuncio»; la app cabe en 320–430 px y funciona en español e inglés.

---

## Recorrido por la app

Capturas reales tomadas el 21/11/2026 de esta versión del repositorio, en un viewport móvil de 390 px, con PostgreSQL 17 local, lugares REAL de OpenStreetMap importados (`npm run db:import-osm`), Metrobús L1 (`npm run db:import:cdmx`) y datos DEMO (`npm run db:seed`).

### 1 · Acceso, Inicio y Explorar

<table>
  <tr>
    <td align="center" width="33%"><img src="docs/assets/readme/01-login.webp" alt="Pantalla de acceso: Continuar con Google o Entrar con la cuenta demo, selector ES/EN" width="260"></td>
    <td align="center" width="33%"><img src="docs/assets/readme/02-inicio.webp" alt="Inicio: categorías y eventos recomendados en mosaico, los tres primeros con Patrocinado #1, #2 y #3 y etiqueta Demo" width="260"></td>
    <td align="center" width="33%"><img src="docs/assets/readme/03-explorar.webp" alt="Explorar: búsqueda Starbucks con resultados de OpenStreetMap marcados Real" width="260"></td>
  </tr>
  <tr>
    <td><b>Acceso.</b> Google OAuth o, en desarrollo, la cuenta demo. Toda la API exige sesión (<a href="docs/adr/0009-autenticacion-google-sesiones.md">ADR-0009</a>).</td>
    <td><b>Inicio.</b> Categorías, eventos recomendados (los 3 primeros puestos son pagados y lo dicen) y accesos a comercios y puntos turísticos.</td>
    <td><b>Explorar.</b> Buscador de eventos y de lugares de OpenStreetMap con filtros por categoría y fecha.</td>
  </tr>
</table>

### 2 · La tesis: «Alternativa local cerca»

<table>
  <tr>
    <td align="center" width="33%"><img src="docs/assets/readme/04-alternativa-local.webp" alt="Ficha de un Starbucks: Real, fuente OpenStreetMap, y bloque Alternativa local cerca con Tokio Sushi & Bol a 186 m y El Portón a 226 m, confianza media" width="260"></td>
    <td align="center" width="33%"><img src="docs/assets/readme/05-evento.webp" alt="Detalle de evento: Jazz al atardecer, Patrocinado #1, Demo, aviso de evento de ejemplo y crédito de la foto" width="260"></td>
    <td align="center" width="33%"><img src="docs/assets/readme/demo-tarjeta-detalle.webp" alt="Animación: la tarjeta del evento se expande hasta el detalle y vuelve a su sitio" width="240"></td>
  </tr>
  <tr>
    <td><b>Ficha de lugar.</b> «Cadena según OpenStreetMap: Starbucks» y alternativas sin marca de cadena, con distancia, fuente y <b>confianza media</b>. Motor determinista con tests, sin IA (<a href="docs/02-modules/decisions.md">decisions</a>).</td>
    <td><b>Detalle de evento.</b> Etiquetas <code>Patrocinado</code> y <code>Demo</code>, aviso de que es un evento de ejemplo y crédito de la foto (Wikimedia Commons).</td>
    <td><b>Motion design.</b> La tarjeta se convierte en el detalle (elemento compartido) y vuelve; respeta <code>prefers-reduced-motion</code> (<a href="docs/03-design/motion.md">motion</a>).</td>
  </tr>
</table>

### 3 · Mapa multicidad

<table>
  <tr>
    <td align="center" width="33%"><img src="docs/assets/readme/06-mapa-cancun.webp" alt="Mapa oscuro de Cancún con lugares, eventos y rutas de transporte simuladas en morado" width="260"></td>
    <td align="center" width="33%"><img src="docs/assets/readme/07-mapa-cdmx.webp" alt="Mapa de Ciudad de México con la línea 1 del Metrobús en rojo y los límites de alcaldías" width="260"></td>
    <td align="center" width="33%"><img src="docs/assets/readme/07b-capas-cdmx.webp" alt="Panel de capas de Ciudad de México: Eventos, Lugares sin datos, Transporte Real GTFS SEMOVI CC BY 4.0 y Zonas Real alcaldías INEGI" width="260"></td>
  </tr>
  <tr>
    <td><b>Cancún.</b> Lugares REAL de OSM, eventos DEMO y 4 rutas de transporte <b>simuladas</b> (DEMO, <a href="docs/adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md">ADR-0008</a>).</td>
    <td><b>Ciudad de México.</b> Metrobús L1 (GTFS de SEMOVI) y 16 alcaldías (INEGI), ambos REAL. Misma app, otro adaptador.</td>
    <td><b>Capas con procedencia.</b> Cada capa dice si es <code>Real</code>, su fuente, licencia y fecha, o «Sin datos» cuando no hay fuente.</td>
  </tr>
</table>

### 4 · Billetera y monetización (simulada)

<table>
  <tr>
    <td align="center" width="25%"><img src="docs/assets/readme/08-billetera.webp" alt="Billetera: gasto por categoría y medidor Tu gasto que se quedó en la ciudad 22 %, historial con exportación CSV" width="200"></td>
    <td align="center" width="25%"><img src="docs/assets/readme/09-cuenta-pro.webp" alt="Ajustes: KinHop Pro activo simulado en la demo, cupones, negocios y organizadores, ver la app como usuario gratis, idioma" width="200"></td>
    <td align="center" width="25%"><img src="docs/assets/readme/10-cupon-qr.webp" alt="Cupón DEMO con código QR KH-CAFE15 y locales donde usarlo" width="200"></td>
    <td align="center" width="25%"><img src="docs/assets/readme/11-negocios.webp" alt="Negocios y organizadores: publicar evento gratis o en los puestos 1 a 3, aviso de simulación" width="200"></td>
  </tr>
  <tr>
    <td><b>Billetera.</b> Presupuesto, gastos manuales, gráfico, historial, CSV y el <b>medidor de gasto local</b>. Se queda en el navegador; nunca pide datos bancarios.</td>
    <td><b>Cuenta.</b> La cuenta demo es <b>Pro simulado</b> (30 días, sin cobro). Interruptor para ver la app como usuario gratis.</td>
    <td><b>Cupones Pro.</b> Negocios y convenios <b>ficticios</b>, marcados <code>Demo</code>. El servidor exige Pro (403 si no).</td>
    <td><b>Negocios y organizadores.</b> Publicar un evento o destacarse. Simulación: no se guarda ni se cobra.</td>
  </tr>
</table>

### 5 · Escritorio e inglés

<table>
  <tr>
    <td align="center" width="68%"><img src="docs/assets/readme/12-escritorio-mapa.webp" alt="Mapa de Cancún en escritorio a 1440 por 900" width="100%"></td>
    <td align="center" width="32%"><img src="docs/assets/readme/13-ingles-alternativa.webp" alt="La ficha del Starbucks en inglés: Local alternative nearby, confidence medium" width="220"></td>
  </tr>
  <tr>
    <td><b>Escritorio</b> (1440×900): mismo diseño, el mapa ocupa la pantalla.</td>
    <td><b>Inglés:</b> todos los textos salen de <code>es.json</code>/<code>en.json</code>.</td>
  </tr>
</table>

---

## Honestidad de datos: REAL vs DEMO

Regla del proyecto: **todo dato lleva `REAL` / `DEMO` / `USER_REPORTED` / `UNVERIFIED`, fuente y fecha, y nada se presenta como «en vivo» si no lo es** ([data-policy](docs/06-data/data-policy.md)). Registro completo de fuentes: [`docs/06-data/sources.md`](docs/06-data/sources.md).

| Módulo | Cancún | Ciudad de México | Fuente y licencia |
|---|---|---|---|
| Mapa base | REAL | REAL | [OpenFreeMap](https://openfreemap.org) (teselas OpenMapTiles) · datos © OpenStreetMap, ODbL |
| Lugares y comercios | **REAL**: 774 (656 comercios, 207 con marca de cadena) + 10 DEMO | Sin datos (vacío honesto) | [OpenStreetMap vía Overpass](https://overpass-api.de) · ODbL 1.0, «© OpenStreetMap contributors» · consultado 21/11/2026 |
| Alternativa local | REAL (sobre los lugares OSM) | — | Motor propio: misma categoría, sin `brand` en OSM, por distancia; confianza `MEDIUM` |
| Transporte | **DEMO**: 4 rutas simuladas con paradas aproximadas, sin tarifa ni horario | **REAL**: Metrobús línea 1 (un viaje, 46 paradas), no es tiempo real | Cancún: rutas creadas por el equipo ([ADR-0008](docs/adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md)). CDMX: [GTFS de SEMOVI](https://datos.cdmx.gob.mx/dataset/gtfs), CC BY 4.0 |
| Zonas | Sin datos (supermanzanas sin GeoJSON con licencia clara) | **REAL**: 16 alcaldías | [Límite de Alcaldías](https://www.datos.cdmx.gob.mx/dataset/alcaldias) (INEGI, Marco Geoestadístico 2020) · CC BY 4.0 |
| Eventos | DEMO (con fechas relativas a hoy) | DEMO | Seeds del equipo; aún no hay fuente real de eventos |
| Fotos de eventos | DEMO, con crédito visible | DEMO | Wikimedia Commons: CC0, CC BY 2.0 y CC BY-SA 4.0 (autor en cada ficha) |
| Fotos de lugares | DEMO, «Foto ilustrativa, no de este lugar» | — | Origen y licencia **pendientes de confirmar** ([OPEN-QUESTIONS #13](docs/OPEN-QUESTIONS.md)) |
| Cupones y convenios | DEMO, negocios ficticios | DEMO | Catálogo en código (`apps/api/src/modules/coupons/catalog.ts`) |
| Eventos patrocinados, anuncios, Pro | Simulación etiquetada | Simulación etiquetada | Sin cobros: Stripe y AdMob pendientes |
| Gastos de la Billetera | Del usuario, solo en su navegador | Ídem | Sin conexión bancaria ni datos de tarjeta |

**¿Por qué las rutas de Cancún son simuladas?** Las reglas del hackatón no permiten consumir APIs creadas por integrantes del equipo antes del evento, y el catálogo público de rutas de Cancún es de un integrante. Por eso se desactivó y se usan rutas DEMO, dichas en voz alta y marcadas en pantalla ([ADR-0008](docs/adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md), [OPEN-QUESTIONS #1](docs/OPEN-QUESTIONS.md)).

---

## Modelo de negocio

Decidido por el equipo el 21/11/2026 ([monetization](docs/02-modules/monetization.md)). **Todo es simulado en la demo**: no se cobra, no hay anuncios reales y los convenios no existen todavía. Precios propuestos en [`pricing.js`](apps/web/src/features/monetization/pricing.js), una sola fuente para la app y el pitch.

| Fuente de ingresos | Quién paga | Precio propuesto |
|---|---|---|
| Anuncios de red (AdMob) para usuarios gratis | anunciantes | por impresión o clic |
| Eventos destacados: puestos 1, 2 y 3 de los recomendados | organizadores | $599 / $399 / $249 MXN por semana |
| Negocio local destacado (búsqueda, recomendación y mapa) | negocios locales | $299 MXN / mes |
| Anuncio personalizado propio en app y web | negocios locales | desde $1,500 MXN / mes |
| **KinHop Pro**: sin anuncios + cupones en negocios con convenio | turistas | $59 MXN / mes |

Reglas: todo lo pagado lleva «Patrocinado» o «Anuncio»; **pagar no cambia el «por qué» de una sugerencia**; el plan lo decide el servidor; KinHop nunca ve ni guarda datos de tarjeta (Stripe Checkout, pendiente).

---

## Arquitectura

Monolito modular con features por dominio y **adaptadores por ciudad**: añadir una ciudad es registrar sus fuentes, no reescribir la app ([ADR-0003](docs/adr/0003-monolito-modular-features-adaptadores.md), [overview](docs/01-architecture/overview.md)).

```mermaid
flowchart LR
  subgraph Cliente["Navegador (mobile-first)"]
    WEB["apps/web<br/>React 19 · Vite · Tailwind 4<br/>motion · MapLibre GL<br/>i18n ES/EN"]
  end

  subgraph Servidor["apps/api · Node + Express 5 + TypeScript"]
    AUTH["auth<br/>Google OAuth + PKCE<br/>express-session"]
    MODS["módulos por dominio<br/>cities · discovery · events<br/>transit · decisions · reports · coupons<br/>validación zod"]
    ADP["adaptadores por ciudad<br/>cancun · cdmx"]
  end

  DB[("PostgreSQL 17<br/>migraciones SQL versionadas<br/>sesiones · usuarios · lugares · eventos · transporte")]
  GOOGLE["Google Identity<br/>(OAuth 2.0)"]
  TILES["OpenFreeMap<br/>teselas · © OpenStreetMap"]

  subgraph Fuentes["Importadores (scripts/)"]
    OSM["OpenStreetMap · Overpass<br/>lugares de Cancún (ODbL)"]
    GTFS["GTFS SEMOVI CDMX<br/>Metrobús L1 (CC BY 4.0)"]
    ALC["Alcaldías INEGI<br/>(CC BY 4.0)"]
  end

  WEB -- "/api JSON · cookie de sesión" --> AUTH
  AUTH --> MODS
  MODS --> ADP
  MODS --> DB
  AUTH --> DB
  AUTH -- "canje servidor a servidor" --> GOOGLE
  WEB --> TILES
  OSM --> DB
  GTFS --> DB
  ALC --> DB
```

**Estructura del monorepo** (npm workspaces):

```text
apps/
├─ web/                 React 19 + Vite + Tailwind 4 (JSX)
│  └─ src/
│     ├─ app/           composición: App, cabecera, barra inferior, pantallas por pestaña
│     ├─ features/      un dominio por carpeta: auth, budget, cities, discovery, events, map, monetization, transit…
│     └─ shared/        cliente HTTP único, i18n (es.json / en.json), motion, componentes genéricos
└─ api/                 Express 5 + TypeScript
   └─ src/
      ├─ modules/       un router por dominio (routes.ts con zod) + adapters/<ciudad>.ts
      └─ shared/        errores tipados, db, migraciones, seeds, adaptadores por ciudad
db/
├─ migrations/          SQL versionado (0001–0009), nunca se edita uno aplicado
└─ seeds/               catálogo de fuentes y datos DEMO (repetibles)
scripts/                importadores OSM y GTFS, validadores de enlaces e i18n
e2e/                    test de desborde horizontal (Playwright)
docs/                   producto, arquitectura, módulos, diseño, API, entrega, datos y ADRs
video/demo-jurado/      composición HyperFrames del video del pitch
```

**Decisiones clave (ADRs):**

| ADR | Decisión |
|---|---|
| [0001](docs/adr/0001-monorepo.md) | Monorepo ligero con npm workspaces, sin microservicios |
| [0003](docs/adr/0003-monolito-modular-features-adaptadores.md) | Monolito modular + feature-first + adaptadores por ciudad |
| [0004](docs/adr/0004-idiomas-json.md) | Todo el texto de la app en un JSON por idioma |
| [0005](docs/adr/0005-tarjeta-de-visita-y-motion.md) | Estética «tarjeta de visita» y vocabulario de motion design |
| [0006](docs/adr/0006-base-de-datos-mvp.md) | Esquema del MVP en PostgreSQL (sin PostGIS mientras no haga falta) |
| [0007](docs/adr/0007-tema-oscuro-acento-lima.md) | Tema oscuro con acento lima, contraste medido |
| [0008](docs/adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md) | Rutas de Cancún simuladas, fotos genéricas DEMO y nombre KinHop |
| [0009](docs/adr/0009-autenticacion-google-sesiones.md) | Login con Google y sesiones de servidor en PostgreSQL |

Más: contrato de la API en [`docs/04-api/contract.md`](docs/04-api/contract.md) · base de datos en [`docs/06-data/database.md`](docs/06-data/database.md) · [ADR-0002](docs/adr/0002-reglas-larpatron-y-tooling.md) (reglas heredadas y herramientas).

**Seguridad, en corto:** la sesión vive en el servidor (cookie `kh.sid` `HttpOnly`, `SameSite=Lax`, `Secure` con HTTPS); el código de Google se canjea servidor a servidor con PKCE; hay límite de intentos por IP; CORS limitado al origen de la web; SQL parametrizado; ningún secreto en variables `VITE_*`. El login de desarrollo se ignora siempre con `NODE_ENV=production` ([auth](docs/02-modules/auth.md)).

---

## Cómo correrlo en local

**Requisitos:** Node ≥ 22.12, npm y Docker (o un PostgreSQL 16+ propio).

```bash
# 1. Dependencias (con package-lock.json)
npm ci

# 2. Variables de la API
cp apps/api/.env.example apps/api/.env
#   Edita apps/api/.env:
#   DATABASE_URL=postgresql://kindhop:kindhop@localhost:5432/kindhop
#   SESSION_SECRET=<≥ 32 caracteres aleatorios>   →  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
#   PUBLIC_URL=http://localhost:5173  y  WEB_ORIGIN=http://localhost:5173
#   AUTH_DEV_LOGIN=true                            →  botón «Entrar con la cuenta demo» (solo desarrollo)
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET        →  opcional, login real con Google

# 3. Base de datos y datos
docker compose up -d db          # PostgreSQL 17 en localhost:5432
npm run db:migrate               # aplica db/migrations (idempotente)
npm run db:seed                  # catálogo + datos DEMO con fechas de hoy (repetible)
npm run db:import-osm            # lugares y comercios REAL de Cancún desde Overpass (repetible; necesita red)
npm run db:import:cdmx           # Metrobús L1 desde el fixture local (repetible; sin red)

# 4. Arrancar
npm run dev                      # API en :3001 + web en :5173 (Vite redirige /api)
```

Abre `http://localhost:5173` → **Entrar con la cuenta demo** → Explorar → «Starbucks».

<details>
<summary><b>Variables de entorno de la API</b> (todas en <code>apps/api/.env</code>, nunca en Git)</summary>

| Variable | Obligatoria | Para qué |
|---|---|---|
| `SESSION_SECRET` | sí | Firma la cookie de sesión. Sin ella la API responde 503 a todo |
| `PUBLIC_URL`, `WEB_ORIGIN` | sí | Origen exacto de la web (redirect de Google y CORS) |
| `DATABASE_URL` | sí, salvo ciudades | Usuarios, sesiones, lugares, eventos, transporte. Sin ella esas rutas responden 503 `DATABASE_UNAVAILABLE` |
| `AUTH_DEV_LOGIN` | no | Cuenta demo. Con `NODE_ENV=production` se ignora salvo que también esté `AUTH_DEMO_IN_PRODUCTION=true` |
| `AUTH_DEMO_IN_PRODUCTION` | no | Solo para la demo pública del jurado: habilita la cuenta demo en producción |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | no | Login con Google ([pasos](docs/02-modules/auth.md#configurar-google-una-vez-por-entorno)) |
| `DATABASE_SSL`, `DATABASE_POOL_MAX`… | no | TLS y pool para PostgreSQL gestionado |
| `TRUST_PROXY` | no | Solo si hay un proxy inverso delante |
| `REPORTS_ADMIN_TOKEN` | no | Moderación de incidencias (`PATCH`) |

Detalle comentado en [`apps/api/.env.example`](apps/api/.env.example).
</details>

<details>
<summary><b>Problemas comunes</b></summary>

- **503 `AUTH_NOT_CONFIGURED`:** falta `SESSION_SECRET` en `apps/api/.env`.
- **Te devuelve al login o redirige a otro origen:** `PUBLIC_URL` debe coincidir exactamente con la URL de la web (`http://localhost:5173`).
- **Overpass responde 504:** usa un espejo: `OVERPASS_URL=https://overpass.openstreetmap.fr/api/interpreter npm run db:import-osm`.
- **Antes de una demo:** repite `npm run db:seed` para que los eventos DEMO tengan fechas futuras, y vuelve a entrar con la cuenta demo (el Pro simulado dura 30 días).
</details>

---

## Tests y CI

```bash
npm run check          # typecheck API + lint web + tests + enlaces de docs + claves i18n ES/EN iguales
npm run build          # compila API (dist/) y web (dist/)
npm test               # tests de API, web y scripts
npm run test:overflow  # Playwright: sin scroll horizontal de 320 a 430 px (con `npm run dev` en marcha)
```

- **Tests:** 117 de la API contra PostgreSQL (auth, sesiones y límite por IP, motor de decisiones, eventos, transporte, incidencias, cupones, esquema), 42 de la web y 18 de los importadores.
- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), en cada push y PR a `developers` y `main`: `npm ci` → `npm run check` → `npm run build` → migraciones **dos veces** (deben ser idempotentes) → seeds dos veces → tests de la API contra un servicio PostgreSQL 17.
- **Flujo de trabajo:** Kanban con WIP de una tarjeta ([backlog](docs/05-delivery/backlog.md)), una entrega funcional por PR hacia `developers`, revisión y squash; `main` recibe versiones ya probadas ([FLUJO_GIT](docs/agent/FLUJO_GIT.md), [WORKFLOW](docs/agent/WORKFLOW.md)).

---

## Despliegue (resumen)

**Demo pública:** https://kinhop.campusconnet.com.mx · entra con **«Entrar con la cuenta demo»** (Pro simulado) o con Google.

Cada push a `main` pasa la CI completa y GitHub Actions despliega en un VPS propio con Docker: API, web y PostgreSQL aislados, detrás de Cloudflare. Si la nueva versión no pasa la comprobación de salud, vuelve sola a la anterior. Además:
- un cron revisa la salud cada 5 minutos y se recupera solo;
- las fechas DEMO se refrescan cada día;
- se hace un respaldo diario de la base.

Detalle, operación y mantenimiento: [`docs/05-delivery/despliegue.md`](docs/05-delivery/despliegue.md).

---

## Rendimiento, accesibilidad e idiomas

Medido el 21/11/2026 y documentado en el [backlog](docs/05-delivery/backlog.md) (KH-022 a KH-024):

| Qué | Antes → después | Cómo se midió |
|---|---|---|
| Inicio: LCP / FCP | 4.8 s → 3.2 s / 3.8 s → 1.8 s | Lighthouse móvil, CPU 4×, 4G lenta simulada |
| Inicio: CLS / transferencia | 0.243 → 0.006 / 940 KB → 327 KB | ídem |
| Explorar: LCP | 6.8 s → 2.8 s | ídem |
| Billetera: LCP | 4.4 s → 2.6 s | ídem |
| Explorar: scroll | 20 fps y 16 long tasks (895 ms) → 60 fps y 0 | Chrome 390×844, CPU 6×, build de producción, 774 lugares |
| Explorar: tras escribir | 43 fps → 59 fps, sin long tasks | ídem |

Cómo: cada pestaña es su propio chunk (MapLibre solo viaja con el Mapa), fotos DEMO en AVIF/WebP según el hueco, fuente precargada, peticiones en paralelo, el mapa no se recrea al cambiar de pestaña y la lista de lugares se pagina de 24 en 24. **Pendiente:** el Mapa aún carga MapLibre completo (TBT ~1.5 s) y su primera apertura va a ~8 fps mientras carga el estilo.

**Accesibilidad y responsive:**

- Sin scroll horizontal de **320 a 430 px**, en ES y EN y con texto al 130 %, comprobado por un test de Playwright ([`e2e/overflow.spec.js`](e2e/overflow.spec.js)).
- Contraste **WCAG 2.2 AA medido** por token: todo texto ≥ 4.5:1 ([ux-rules](docs/03-design/ux-rules.md)).
- Objetivos táctiles ≥ 44 px, foco visible y navegación con teclado.
- `prefers-reduced-motion` reduce las animaciones a fundidos.

**Idiomas:** español e inglés en todas las pantallas; ningún texto fijo en el código. `npm run check` falla si las claves de `es.json` y `en.json` no coinciden ([i18n](docs/03-design/i18n.md)).

---

## Limitaciones y roadmap

Límites que hoy decimos en voz alta:

- **Despliegue estable** con dominio fijo y Google OAuth de producción: pendiente ([issue #10](https://github.com/MoggerSir/KindHop/issues/10), KH-016).
- **Zonas de Cancún (supermanzanas):** no hay GeoJSON con licencia verificada ([issue #7](https://github.com/MoggerSir/KindHop/issues/7), KH-009, [OPEN-QUESTIONS #3](docs/OPEN-QUESTIONS.md)).
- **Rutas de Cancún:** simuladas (DEMO) por reglas del hackatón; sin horarios ni tiempo real en ninguna ciudad.
- **Lugares de CDMX:** sin fuente POI todavía (la app muestra un vacío honesto).
- **Eventos:** todos DEMO; falta una fuente real.
- **Fotos genéricas de lugares:** origen y licencia por confirmar ([OPEN-QUESTIONS #13](docs/OPEN-QUESTIONS.md)).
- **Monetización:** Stripe Checkout + webhook, AdMob, tabla de cupones con canje firmado y moderación de patrocinios, todo por hacer ([monetization](docs/02-modules/monetization.md#para-pasar-a-producción)).
- **«Local» no está certificado:** se infiere de la ausencia de marca de cadena en OSM, por eso la confianza es media.
- **Impacto:** el medidor es un registro personal; validar el valor comercial requiere un piloto con turistas y comercios.

**Siguiente paso propuesto** ([PITCH.md](PITCH.md)): un piloto en Cancún que observe si los turistas abren y visitan las alternativas y si un negocio pagaría por esa exposición. Lo que queda está en el [backlog](docs/05-delivery/backlog.md) y en [OPEN-QUESTIONS](docs/OPEN-QUESTIONS.md).

---

## Para quien desarrolla: mapa del repo

**No recorras `src/` entero.** Busca tu tarea en la tabla, abre la ruta y su documento. Nada más. ¿No aparece? → [`docs/FILEMAP.md`](docs/FILEMAP.md) → [`docs/agent/ROUTER.md`](docs/agent/ROUTER.md). Reglas para agentes: [`AGENTS.md`](AGENTS.md).

<details>
<summary><b>Router: tarea → archivo</b></summary>

| Tarea | Ruta exacta | Contexto (leer) | Prueba |
|---|---|---|---|
| Pitch 5 min + apoyo visual (HyperFrames) | `video/demo-jurado/`, `docs/05-delivery/kinhop-demo-jurado.mp4` | [guion](PITCH.md), [especificación](video/demo-jurado/SPEC.md), [revisión](video/demo-jurado/REVIEW.md) | `cd video/demo-jurado && npm run check`; reproducir MP4 |
| Pantallas, pestañas, layout | `apps/web/src/app/{App.jsx,layout/,navigation/,screens/}` | [screens](docs/03-design/screens.md), [ux-rules](docs/03-design/ux-rules.md) | `npm run check` + navegador 390px |
| Arquitectura, carpetas, recetas (módulo / feature / ciudad nueva) | — | [overview](docs/01-architecture/overview.md), [ADR-0003](docs/adr/0003-monolito-modular-features-adaptadores.md) | — |
| Mapa (MapLibre, estilo, capas) | `apps/web/src/features/map/CityMap.jsx` | [map](docs/02-modules/map.md) | navegador: mapa visible + atribución |
| Selector y datos de ciudad (web) | `apps/web/src/features/cities/` | [cities-and-transit](docs/02-modules/cities-and-transit.md) | cambiar Cancún ↔ CDMX |
| Catálogo de ciudades (API) | `apps/api/src/modules/cities/catalog.ts` | [cities-and-transit](docs/02-modules/cities-and-transit.md) | `npm test` |
| Transporte Cancún (DEMO) / CDMX (GTFS) | `apps/api/src/modules/transit/` (Cancún: `adapters/cancun-demo.ts`; CDMX: `adapters/cdmx.ts`, `transit.db.ts`), `scripts/import-cdmx-gtfs.mjs`, `apps/web/src/features/transit/` | [cities-and-transit](docs/02-modules/cities-and-transit.md), [sources](docs/06-data/sources.md) | `npm test`; mapa en CDMX tras `db:import:cdmx` |
| POI Cancún y zonas | `apps/api/src/modules/discovery/` (POI KH-004; zonas KH-009), `scripts/fetch-osm-pois.mjs`, capas `DataLayers` en web | [discovery](docs/02-modules/discovery.md) | test del filtro; alcaldías CDMX REAL, Cancún sin datos (`districts.test.ts`) |
| Eventos | `apps/web/src/features/events/`, `apps/api/src/modules/events/` | [discovery](docs/02-modules/discovery.md), [contract](docs/04-api/contract.md) | test: solo eventos futuros |
| Explorar (búsqueda de eventos y lugares) | `apps/web/src/features/events/EventSearch.jsx`, `apps/web/src/features/discovery/PlaceResults.jsx` | [discovery](docs/02-modules/discovery.md) | navegador: Explorar → «Starbucks» |
| Adaptador por ciudad / ciudad nueva | `apps/api/src/shared/city-adapters.ts`, `modules/cities/catalog.ts` | [overview → recetas](docs/01-architecture/overview.md) | `npm test` |
| Incidencias / inundaciones (API) | `apps/api/src/modules/reports/` (KH-011; la capa web es KH-012) | [reports](docs/02-modules/reports.md), [contract](docs/04-api/contract.md) | `npm test` con `DATABASE_URL`: caducidad, 400, `UNVERIFIED` |
| Presupuesto y gastos | `apps/web/src/features/budget/` (KH-010) | [budget](docs/02-modules/budget.md) | test de cálculo en centavos |
| Motor de decisiones y gasto local (KH-020) | `apps/api/src/modules/decisions/`, web `features/discovery/LocalAlternative.jsx`, `features/budget/LocalSpendMeter.jsx` | [decisions](docs/02-modules/decisions.md), [contract](docs/04-api/contract.md) | `npm test` con `DATABASE_URL`; navegador: Explorar → «Starbucks» |
| Monetización (Pro, cupones, anuncios, patrocinios) | `apps/web/src/features/monetization/` (precios en `pricing.js`), `apps/api/src/modules/coupons/` | [monetization](docs/02-modules/monetization.md) | `npm test`; navegador: avatar → Cupones |
| Carga de datos en la web (hook común) | `apps/web/src/shared/hooks/useResource.js` | [overview](docs/01-architecture/overview.md) | `npm run check` |
| Cliente HTTP web | `apps/web/src/shared/lib/http.js` | [contract](docs/04-api/contract.md) | estado de error con "Reintentar" |
| Montaje de rutas API | `apps/api/src/app.ts` | [contract](docs/04-api/contract.md) | `npm test` |
| Login con Google y sesiones | `apps/api/src/modules/auth/`, `apps/web/src/features/auth/` | [auth](docs/02-modules/auth.md), [ADR-0009](docs/adr/0009-autenticacion-google-sesiones.md) | `npm test` (auth.test.ts, rate-limit.test.ts y proxy.test.js) |
| Errores API | `apps/api/src/shared/errors.ts` | [contract](docs/04-api/contract.md) | `npm test` |
| PostgreSQL / migraciones / seeds | `db/migrations/`, `db/seeds/`, `apps/api/src/shared/db.ts` | [database](docs/06-data/database.md), [db/README](db/README.md) | `npm run db:migrate` y `npm run db:seed` (2 veces) |
| Textos e idiomas (ES/EN) | `apps/web/src/shared/i18n/locales/{es,en}.json` | [i18n](docs/03-design/i18n.md) | `npm run check` (claves iguales en ambos) |
| Movimiento (motion design) | `apps/web/src/shared/motion/` | [motion](docs/03-design/motion.md) | navegador + movimiento reducido |
| Estilos y tokens | `apps/web/src/index.css` (`@theme`) | [ux-rules](docs/03-design/ux-rules.md) | `npm run check` |
| Responsive (sin desborde 320–430 px) | `e2e/overflow.spec.js`, `playwright.config.js` | [ux-rules](docs/03-design/ux-rules.md) | `npm run test:overflow` |
| Imágenes del README | `docs/assets/readme/` | este README | se ven en GitHub |
| CI | `.github/workflows/ci.yml` | [WORKFLOW](docs/agent/WORKFLOW.md) | PR en GitHub |
| Demo para jueces | — | [demo](docs/05-delivery/demo.md), [checklist](docs/05-delivery/checklist.md) | guion 3 veces seguidas |
| Tareas disponibles | — | [backlog](docs/05-delivery/backlog.md) | — |

</details>

<details>
<summary><b>Reglas de oro</b></summary>

0. **Git: solo PRs hacia `developers`.** Nadie (persona ni agente) hace push a `developers` ni a `main`; los agentes no integran PRs. Ver [FLUJO_GIT](docs/agent/FLUJO_GIT.md).
1. **Repo nuevo:** no copiar código ni historial de Larpatron ni de Rutas Cancún ([LICENSE-NOTICE](LICENSE-NOTICE.md), [OPEN-QUESTIONS](docs/OPEN-QUESTIONS.md)).
2. **Datos honestos:** todo dato lleva `REAL` / `DEMO` / `USER_REPORTED` / `UNVERIFIED`, fuente y fecha. Nada se presenta como "en vivo" si no lo es.
3. **Finanzas honestas:** gasto manual/CSV; nunca tarjeta, CVV ni credenciales; no Google Wallet/Pay.
4. **Idiomas:** ningún texto fijo en la web; todo en `shared/i18n/locales/{es,en}.json` con `t()` ([i18n](docs/03-design/i18n.md)).
5. **Vertical slice:** UI + API + datos + error + prueba, uno a la vez. `main` siempre demostrable.
6. **Si cambias una ruta,** actualiza esta tabla y `docs/FILEMAP.md` en el mismo commit.

</details>

Nombre: **KinHop** es el nombre de la app; el repositorio conserva el nombre técnico `KindHop` y los paquetes `@kindhop/*` ([ADR-0008](docs/adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md)).

---

## Equipo, licencia y créditos

**Equipo** (según el historial del repositorio): **[MoggerSir](https://github.com/MoggerSir)** (dueño del repositorio) y **Enrique García Santiago** (colaborador del frontend). La lista completa de integrantes y roles del pitch está por completar en [HACKATHON.md](HACKATHON.md#team).

**Licencia:** **pendiente de decisión del equipo; no asumas que es open source** ([LICENSE-NOTICE](LICENSE-NOTICE.md)). El repositorio se creó desde cero el 20/11/2026 y no incorpora código de Larpatron ni de Rutas Cancún.

**Créditos de datos y contenido:**

- Datos de mapa y lugares: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), [ODbL 1.0](https://opendatacommons.org/licenses/odbl/). Teselas de [OpenFreeMap](https://openfreemap.org) / OpenMapTiles.
- Metrobús línea 1: GTFS de la Secretaría de Movilidad (SEMOVI), [Portal de Datos Abiertos de la CDMX](https://datos.cdmx.gob.mx/dataset/gtfs), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es). Se usa un subconjunto: una línea y un viaje.
- Límite de alcaldías: INEGI, Marco Geoestadístico 2020, vía el [Portal de Datos Abiertos de la CDMX](https://www.datos.cdmx.gob.mx/dataset/alcaldias), CC BY 4.0.
- Fotos de eventos DEMO: Wikimedia Commons, Samantha RV (CC0), Czardelarua (CC BY-SA 4.0), Tahirceylan (CC BY-SA 4.0) y City Foodsters (CC BY 2.0). Detalle por archivo en [sources](docs/06-data/sources.md).
- Las capturas de este README son de la propia app (21/11/2026) y muestran los mismos datos y créditos.

---

## English summary

**KinHop brings tourist spending to local businesses.** It is a mobile-first web app built for **Hack Maya 2026** (tourism and economy tracks), piloted in **Cancún** and **Mexico City**. When a visitor opens a place that OpenStreetMap tags as a chain (for example, a Starbucks), KinHop suggests nearby businesses of the same category with no chain brand on record, explains *why* (source, distance and a deliberately **medium** confidence, because a missing brand tag does not prove a business is local), and lets the visitor log which expenses went to local businesses in a personal spending meter.

- **Real data:** 774 Cancún places from OpenStreetMap (ODbL), Mexico City Metrobús Line 1 from the official SEMOVI GTFS (CC BY 4.0) and 16 borough boundaries from INEGI (CC BY 4.0). **Demo data**, always labelled: events, Cancún transit routes (simulated under hackathon rules, see [ADR-0008](docs/adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md)), generic place photos and Pro coupons. No payments are processed.
- **Stack:** React 19, Vite, Tailwind 4, motion and MapLibre GL on the web; Node, Express 5, TypeScript and zod for the API; PostgreSQL 17; Google sign-in with server-side sessions.
- **Run it:** Node ≥ 22.12 and Docker → `npm ci`, copy `apps/api/.env.example` to `apps/api/.env` (set `SESSION_SECRET`, `DATABASE_URL`, `AUTH_DEV_LOGIN=true`), `docker compose up -d db`, `npm run db:migrate && npm run db:seed && npm run db:import-osm && npm run db:import:cdmx`, then `npm run dev` and open `http://localhost:5173`.
- **For judges:** [5-minute guide](#guía-rápida-para-el-jurado-5-minutos), [pitch video](docs/05-delivery/kinhop-demo-jurado.mp4), [pitch script](PITCH.md) and [demo script](docs/05-delivery/demo.md). The whole UI is available in English (settings → EN).
