# ADR-0003 — Monolito modular + feature-first + adaptadores por ciudad

**Fecha:** 2026-11-20 · **Estado:** Aceptado (revisable: el equipo espera muchos cambios; cada decisión dice cómo deshacerla)

## Contexto
La propuesta del equipo: *Modular Monolith + Feature-First + City Adapters*, con un frontend React + Vite + Tailwind (PWA mobile-first), un backend Node + Express + TypeScript con los módulos City Engine, Mobility, Urban Data, Events, Budget y Decisions, PostgreSQL y APIs externas (OSM, transporte, datos públicos). Objetivo declarado: que dos agentes trabajen en módulos distintos sin pisar los mismos archivos.

El bootstrap ([ADR-0001](0001-monorepo.md)) ya seguía casi todo eso. Este ADR fija lo que faltaba y adapta lo que chocaba con [`AGENTS.md`](../../AGENTS.md) (KISS, sin abstracciones "para escalar luego", datos honestos).

## Decisión

### 1. Tres niveles, un solo despliegue por app
| Nivel | Dónde | Regla |
|---|---|---|
| Frontend feature-first | `apps/web/src/features/<dominio>/` | Componentes, hook, `*.api.js` y lógica de la feature juntos; se consume solo por su `index.js` (ESLint lo impone). |
| Backend monolito modular | `apps/api/src/modules/<dominio>/` | Un router Express por módulo, montado con una línea en `app.ts`. Otros módulos importan solo su `index.ts`. |
| Integraciones por adaptador | `apps/api/src/modules/<dominio>/adapters/<cityId>.ts` | Una función por fuente y ciudad que normaliza al tipo del contrato. Se elige con `pickAdapter()` (`shared/city-adapters.ts`). |

### 2. Módulos propuestos → módulos reales
| Propuesta | Módulo real | Por qué |
|---|---|---|
| City Engine | `modules/cities` (catálogo + `requireCity()`) + `shared/city-adapters.ts` | No hace falta un "motor": el catálogo dice qué capas tiene cada ciudad y `pickAdapter` elige la fuente. Son ~20 líneas, sin clases. |
| Mobility | `modules/transit` | Nombre ya usado en contrato, backlog y docs. |
| Urban Data | `modules/discovery` (POI, zonas) + `modules/reports` (incidencias) | "Urban Data" mezcla datos abiertos de solo lectura con reportes comunitarios que se escriben, caducan y se moderan. Separarlos evita que dos tarjetas (KH-004 y KH-011) choquen en la misma carpeta. |
| Events | `modules/events` (módulo propio) | Antes iba dentro de discovery. Lo separamos como en la propuesta: tiene tabla, caducidad y tarjeta propias (KH-014). |
| Budget | `apps/web/src/features/budget` (solo web) | Finanzas honestas: local-first en el navegador, sin servidor ni cuenta en el MVP (OPEN-QUESTIONS #5). Si el equipo lo cambia, se crea `modules/budget` siguiendo la receta de [overview](../01-architecture/overview.md). |
| Decisions | `modules/decisions` | Igual que en la propuesta: función pura `suggest()` que consume los `index.ts` de otros módulos. |
| PWA | Tarjeta KH-015 | Manifest e instalable cuando haya pantallas que lo merezcan; no se añade un service worker vacío ahora. |

### 3. Piezas compartidas que sí se añaden ahora (porque ya tienen uso)
- **Web `shared/hooks/useResource.js`:** el patrón `{status, data, error, reload}` de `AGENTS.md` en un solo sitio. Cada hook de feature queda en 3 líneas (ver `useCities.js`). Al cambiar los parámetros (p. ej. `cityId`) cancela la petición anterior y nunca muestra datos de otra ciudad.
- **Web `shared/components/{LoadingState,ErrorState}.jsx`:** los estados obligatorios de `ux-rules`.
- **Web `features/cities/useSelectedCity.js`:** ciudad activa en `?city=` (recargar o compartir enlace conserva la ciudad).
- **Web `app/layout/` y `app/screens/`:** `App.jsx` solo compone; la cabecera y la pantalla de ciudad son componentes propios.
- **API `modules/cities/require-city.ts`:** valida `:cityId` para toda ruta `/api/cities/:cityId/...`.
- **API `shared/city-adapters.ts`:** `pickAdapter(adapters, cityId, nombre)` → adaptador o `404 MODULE_UNAVAILABLE`.

### 4. Lo que **no** se hace (y cuándo reconsiderarlo)
- Carpetas vacías para módulos futuros: cada tarjeta crea la suya con la receta. Reconsiderar: nunca; git no guarda carpetas vacías y confunden a los agentes.
- Capa repository/service genérica, inyección de dependencias, clases de adaptador: prohibido por `AGENTS.md`. Reconsiderar si un módulo tiene 3+ fuentes con lógica compartida real.
- Carpeta `cities/<cityId>/` que agrupe todo lo de una ciudad: se descartó porque haría que transporte y POI de la misma ciudad compartan carpeta (colisiones). Reconsiderar si se pasa de 5 ciudades.

## Cómo cambiar esta decisión
Cada pieza es local y se puede mover sin tocar las demás: renombrar un módulo = carpeta + línea en `app.ts` + filas en `FILEMAP.md` y `README.md`. Para cambios de stack o de nivel (p. ej. budget con servidor, PWA offline real) se escribe un ADR nuevo que sustituya la fila correspondiente de esta tabla.

## Consecuencias
- Dos agentes pueden trabajar en `transit` y `discovery` (o en dos ciudades del mismo módulo) sin tocar los mismos archivos; los únicos compartidos son `app.ts` (una línea), `App.jsx`/`CityScreen.jsx` (una línea) y los docs de índice.
- Añadir una ciudad = entrada en `catalog.ts` + un archivo de adaptador por módulo que la soporte. Sin adaptador, el módulo responde `MODULE_UNAVAILABLE` (vacío honesto).
