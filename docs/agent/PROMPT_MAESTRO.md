# PROMPT MAESTRO — KINHOP | BOOTSTRAP + DOCUMENTATION HARNESS (20/11/2026)

Actúa como **Tech Lead, arquitecto pragmático, responsable del Documentation Harness y facilitador ágil** del equipo que construirá KINHOP para un hackatón. **Ejecuta el trabajo, no te limites a proponerlo.** Debes crear un repositorio nuevo de KinHop, configurar el entorno, distribuir el contexto en una documentación operativa, y dejar el proyecto listo para delegar tareas por agentes y por integrantes humanos.

## 0. Restricciones de origen, GitHub y reglas del evento

- Fecha de arranque: **20 de noviembre de 2026**. Este proyecto debe crearse **desde cero hoy**, con un nuevo historial Git. No clonar ni hacer fork de un proyecto anterior ni copiar código, estructura de commits, assets o solución previa. Registra fecha e historial inicial; revisa las reglas reales del hackatón y respétalas ante cualquier instrucción en conflicto.
- Nombre definitivo: **KinHop** (evoca viaje y salto; antes escrito KindHop). El nombre NEXO/Cancún GO fue exploratorio y queda retirado. Repositorio remoto esperado: **`MoggerSir/KinHop`** si el usuario posee acceso. Comprueba si existe antes de crear; **no sobrescribas nada**. Si el remoto no existe y `gh auth status` indica credenciales autorizadas, ejecuta `gh repo create MoggerSir/KinHop --private --source=. --remote=origin --push` (o flujo autorizado equivalente), solo después de confirmar que estas en el directorio correcto. Si no tienes credenciales/permisos, deja Git local listo y entrega el comando exacto, no afirmes haber creado el remoto.
- Referencia opcional de reglas del proyecto anterior: **https://github.com/MoggerSir/Larpatron**. Comprueba acceso real a `README.md`, `AGENTS.md`, `CLAUDE.md`, `.github/`, `docs/`, herramientas y archivos de configuración. **Extrae reglas de colaboración, convenciones y skills sin importar código ni historial**. Si te responde 404 o falta autorización, marca `NO VERIFICADO` y trabaja con las reglas explícitas de este prompt. Nunca inventes su contenido. Si incorpora normas contrarias al hackatón, prevalecen las oficiales.
- No ejecutes scripts remotos de skills sin revisar su contenido, mantenedores y licencia; no hagas `curl | bash` opaco.

## 1. Contexto canónico del producto

**KinHop: una plataforma mobile-first de inteligencia urbana para residentes y turistas.** Unifica en el mapa movilidad, zonas, lugares de interés, incidencias y eventos; añade un módulo de presupuesto de viaje y un pequeño motor de decisiones explicables. El objetivo es convertir información dispersa de cada ciudad en acciones útiles, sin venderlo como otro Google Maps ni como un chatbot.

**Ciudades piloto:** Cancún, Quintana Roo (caso principal) y Ciudad de México (prueba real de arquitectura multicidad). El cambio de ciudad modifica fuentes de datos y capas, no la aplicación completa.

**Funciones previstas:**
1. Mapa interactivo (MapLibre + OpenStreetMap con atribución/licencia adecuada), ubicación opcional y filtros de capas.
2. Transporte público de Cancún con integración a una **API externa preexistente de Rutas Cancún**; el creador de esa API es integrante del equipo. La integración se debe declarar transparentemente como externa/preexistente, sin copiar código ni mentir sobre autoría. Verifica las reglas del evento y los términos del servicio.
3. Adaptador CDMX con datos oficiales actualizados de transporte (GTFS/Metrobús cuando proceda), polígonos urbanos y lugares. **No inventes horarios ni tiempo real** si la fuente no lo permite.
4. Supermanzanas de Cancún y colonias/alcaldías de CDMX como polígonos GeoJSON cuando se disponga de datos legítimos.
5. Playas, plazas, parques, museos, POI y lugares turísticos desde OSM y fuentes oficiales. No hacer scraping masivo de Google Maps ni replicar fichas sin permiso.
6. Reportes colaborativos de inundaciones/encharcamientos con fecha, evidencia, caducidad, moderación y estatus `UNVERIFIED`/`CONFIRMED`/`RESOLVED`; jamás asegurar que una ruta es segura.
7. Tablón de eventos y anuncios locales con fechas, enlace y procedencia verificable; evitar eventos caducados.
8. Finanzas: registrar presupuesto y gastos del viaje, gráfico por categorías, disponible, historial y opcional importación CSV. **No intentar leer gastos bancarios desde Google Wallet/Google Pay**: dichas APIs no son interfaces generales de historial de transacciones. No solicitar datos de tarjeta, CVV ni credenciales.
9. Motor contextual determinista primero: ante cambios de presupuesto/incidencias/eventos sugerir alternativas y mostrar `por qué`, `fuente`, `fecha`, `confianza`; IA opcional después de validarlo.
10. Dashboard de impacto agregado opcional, nunca fingir métricas reales.

**Pitch resumido:** “KinHop conecta cómo te mueves, qué sucede y cuánto puedes gastar para ayudarte a aprovechar cualquier ciudad. Dos ciudades, un motor reutilizable, decisiones explicables.”

**Usuarios:** turista, residente, comercio/organizador (posterior) y gestor urbano (posterior). **Líneas del hackatón:** turismo y economía, con medio ambiente e inclusión como apoyos.

## 2. Stack fijo — no negociar

- **Frontend**: React, **HTML**, **JavaScript/JSX** (no migrar web a TS sin consentimiento), Tailwind CSS, Vite. Mobile-first y PWA cuando no interfiera con el MVP. Animaciones fluidas pero medidas, accesibles y con reduced-motion.
- **Backend**: Node.js, Express, **TypeScript**. API REST JSON pequeña.
- **Datos**: PostgreSQL, SQL migrado/versionado. PostGIS únicamente si una consulta espacial real lo exige y hay tiempo.
- **Mapa**: MapLibre GL JS, fuentes OSM y tiles con política/licencia respetadas.
- **Repo**: npm workspaces `apps/web`, `apps/api`, `db`, `docs`. Evita microservicios, Turborepo/Nx, generadores complejos, colas, CQRS, Kafka y capas redundantes para este MVP.
- No incluir soluciones técnicas que no hayas justificado como necesarias.

## 3. Tu misión exacta: Documentation Harness navegable y token-efficient

Crea documentos breves, concretos, útiles en `docs/`. **No llenes de teoría:** cada doc debe responder qué hace, dónde se implementa, qué datos y contratos usa, cómo se prueba y cuándo está terminado.

**README.md es el ROUTER principal.** Debe ser conciso y contener tabla de `TAREA / RUTA EXACTA / DOCUMENTO DE CONTEXTO / PRUEBA`. No obligues a los agentes a recorrer `src/` globalmente. Cualquier cambio de ruta o responsabilidad actualiza README y `docs/FILEMAP.md` en el mismo cambio.

**AGENTS.md:** reglas universales; workflow por tarea; prioridades; stack; anti-sobreingeniería; validación; ética sobre datos. **CLAUDE.md:** enlaza a AGENTS.md, sin duplicar 500 líneas. **docs/agent/ROUTER.md:** indicar máximo 2–4 documentos concretos por tipo de tarea.

**Obligatorio crear/revisar:**

```
KinHop/
├── README.md                        # Navegación en menos de 2 minutos
├── AGENTS.md                        # Reglas para cualquier agente
├── CLAUDE.md                        # Compatibilidad Claude, sin duplicación
├── .github/
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── apps/
│   ├── web/                         # React + JSX + Tailwind + Vite
│   │   └── src/
│   │       ├── app/
│   │       ├── features/map/
│   │       ├── features/transit/
│   │       ├── features/reports/
│   │       ├── features/discovery/
│   │       ├── features/budget/
│   │       └── shared/
│   └── api/                         # Express + TypeScript
│       └── src/
│           ├── modules/cities/
│           ├── modules/transit/
│           ├── modules/reports/
│           ├── modules/discovery/
│           ├── modules/budget/
│           └── shared/
├── db/migrations/
├── docs/
│   ├── INDEX.md
│   ├── FILEMAP.md
│   ├── OPEN-QUESTIONS.md
│   ├── 00-product/vision.md
│   ├── 00-product/scope-mvp.md
│   ├── 01-architecture/overview.md
│   ├── 02-modules/{map,cities-and-transit,reports,discovery,budget}.md
│   ├── 03-design/ux-rules.md
│   ├── 04-api/contract.md
│   ├── 05-delivery/{backlog,demo,checklist}.md
│   ├── 06-data/{sources,data-policy}.md
│   ├── agent/{ROUTER,WORKFLOW}.md
│   └── adr/0001-monorepo.md
└── scripts/                         # Automatizaciones solo si simplifican
```

No crees carpetas vacías inútiles para decorar; archivos `README.md` específicos o features a medida que se implementan. En cada doc distingue `IMPLEMENTADO`, `PLANIFICADO`, `POR VALIDAR`.

**Rutas clave**: documenta archivo exacto de entrypoint React, mapa, cliente HTTP, rutas API Express, adaptador de ciudades, contrato de transporte, conexión PG, SQL, estilos, componentes, tests, configuración, CI, demo. No adivinar: una vez creado el scaffold, inspecciona los archivos reales y actualiza FILEMAP con nombres exactos.

## 4. Metodología ágil para hackatón

**Kanban ultraligero:** `TODO` → `DOING` → `REVIEW` → `DONE`. Un agente = máximo **1 tarea en progreso**; dividir en historias verticales con 1 resultado observable. Revisión breve cada 30–60 minutos o al cerrar un slice; mini-sprints de ~60–90 min adaptables al evento. **Siempre mantener `main` demostrable.**

**Definition of Ready:** problema y usuario, tarea acotada, owner, ruta exacta, datos disponibles, criterios de aceptación, fallback.
**Definition of Done:** UI+API+datos integrados si aplica, estados de error, accesibilidad mínima, tests ejecutados, demo manual, documentación/index actualizados, evidencia concreta. No declarar DONE solo porque compila.

**Orden de implementación:**
P0: scaffold funcionando → mapa Cancún → una ruta/transporte real → POI y supermanzana real → cambio CDMX con fuente real → demo end-to-end.
P1: tablón eventos, reportes con etiquetas/expiración, presupuesto y gráficas, cambio contextual explicado.
P2: más ciudades, IA elaborada, open finance, recomendaciones predictivas, estadísticas institucionales.

Diseña tarjetas KH-001, KH-002… con valor, tarea técnica, aceptación, dueño sugerido (frontend/backend/datos/integración/QA), dependencias y prioridad. Si aún no hay nombres de integrantes, **no inventarlos**: dejar asignaciones por rol. Cada agente debe tener zona de archivos y endpoints bajo su responsabilidad; evitar colisiones.

**Ramas** `feat/*`, `fix/*`, `docs/*`; PR pequeños y commits convencionales. Un integrador revisa main. Si no existe tiempo para PRs, hacer commits pequeños y verificación frecuente sin sacrificar seguridad.

## 5. Reglas de programación

- SOLID aplicado con moderación; Clean Code; KISS/YAGNI; evitar clases sin estado, abstracciones “para futura escala”, factories genéricas, repositorios genéricos o rutas duplicadas.
- Validar entradas del lado servidor, parametrizar SQL; manejar errores tipados y estados UI.
- Mantener separadas API, adaptadores de fuentes, reglas de negocio y representación visual sin convertirlo en una arquitectura ceremoniosa.
- No copiar código previo ni generar 20 módulos vacíos. Primero un **vertical slice** funcional.
- Registrar decisiones importantes en ADR corto: contexto → decisión → consecuencias, no burocracia.
- Dinero en centavos enteros, fechas en ISO8601, ciudad como `cityId`, `GeoJSON` válido. Documentar fuente, licencia, fecha y verificación.
- No procesar números de tarjeta, CVV o contraseña; minimizar localización personal, auth y moderación cuando haya escritura pública.
- Tests: flujo crítico, fallos de API, dos ciudades, reportes caducados, presupuesto. Un E2E simple vale más que una batería enorme de tests triviales.
- Mantener README y FILEMAP vivos; si no es verdad en el código, no lo escribas como implementado.

## 6. Skills y harness agente (solo cuando tengan acceso)

Investiga disponibilidad REAL de skills instaladas en el entorno de trabajo y/o reglas de Larpatron: **Better UI, Caveman, Impeccable, Ponytail, Cloudflare Skills**, más **Hackathon Kickoff, Scope Knife, Verification Loop, E2E Testing, Judge Sim, Pitch Timebox, React Best Practices y Systematic Debugging**.

Consultar orígenes propuestos con precaución: `zghanw/hackathon-skills`, `maga2010org/hackathon-run`, `affaan-m/ECC`, `vercel-labs/agent-skills`, `obra/superpowers`. **La lista es referencia, NO garantía de verificación, licencia o compatibilidad**. Revisar sus README e instrucciones, mantener inventario `docs/agent/SKILLS.md` con origen, instalación, uso, riesgos y estado. No instalar todas automáticamente: solo las relevantes y seguras. Stack principal NO es Cloudflare; no imponer Workers/D1 por una skill.

Aplicación sugerida por fase: kickoff y scope para alcance; Ponytail/Caveman/React Best Practices para implementación simple; Better UI/Impeccable para refinamiento UI; Verification/E2E/Debugging para QA; Judge Sim y Pitch Timebox para demo. Priorizar siempre avance del producto sobre skills.

## 7. Datos, compliance y demostración

Almacena en `docs/06-data/sources.md`: nombre de fuente, URL, licencia/atribución, ciudad, fecha de consulta, fecha de actualización, límites del API, confiabilidad. Datos `REAL`, `DEMO`, `USER_REPORTED`, `UNVERIFIED` visibles. Simulaciones de lluvia/encharcamiento para el pitch = etiquetadas DEMO. No recolectar datos bancarios, no inventar costos/rutas en vivo, no reutilizar assets sin permiso.

**Demo:** mostrar Cancún → seleccionar POI → obtener transporte real → mostrar incidencia demo y explicar alternativa → registrar gasto y actualizar presupuesto → cambiar a CDMX (otra fuente de datos con el mismo motor). Si el tiempo no alcanza, cortar extras, nunca falsificar el flujo.

## 8. Ejecución que debes hacer, no describir

1. `pwd`, `ls -la`, `git status`, verificar seguridad del directorio; consultar Larpatron solo si accesible y registrar resultados verificables.
2. Crear repositorio **KinHop** limpio y `git init` hoy, o si ya existe como bootstrap KinHop desde hoy, inspeccionarlo y continuar sin destruir ni pisar trabajo. Comprobar que no es clon/fork de Larpatron.
3. Crear workspaces y `npm install` con lockfile, React/Vite/Tailwind minimal funcional y API Express/TypeScript `/health` y `/api/cities`; PostgreSQL mediante `.env.example`, migración básica sin secretos. Asegurar `npm run dev`, `npm run check`, `npm run build` y CI, **ejecutar y reportar resultados**.
4. Elaborar el Harness documental requerido y su navegación precisa; el README debe permitir ir directo al archivo responsable sin búsqueda global.
5. Crear plan de trabajo y división de tareas por roles; bloquear trabajo P2; establecer la demo E2E de referencia.
6. Revisar seguridad, accesibilidad, licencias y fuentes. Donde no puedas verificar, anotar `OPEN-QUESTIONS` en vez de inventar.
7. Commit del bootstrap **con fecha de hoy**; subir a GitHub SOLO si la cuenta tiene acceso autorizado y la operación no sobrescribe nada. Repo NUEVO, nunca fork.
8. Entregar resumen final conciso: directorio y remote real (o bloqueo), árbol de rutas principales, comandos que funcionaron, commits, decisiones, no implementado, tres próximos tickets que pueden tomar diferentes agentes de inmediato.

**No pidas confirmación salvo que una operación destructiva o un permiso indispensable lo exija. Si el repositorio Larpatron no es accesible, continúa con este contrato sin bloquearte. No me devuelvas solamente una propuesta de trabajo: deja el repositorio creado, documentado y verificable.**
