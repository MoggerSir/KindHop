# Contrato API REST

JSON · fechas ISO 8601 UTC · dinero en centavos enteros · coordenadas `[lon, lat]` · geometrías GeoJSON. Error siempre: `{ "error": { "code": "UPPER_SNAKE", "message": "texto legible" } }`. **Actualiza este archivo antes de implementar un endpoint** y marca el estado real.

## Implementado (tests en `apps/api/src/**/*.test.ts`)

| Método | Ruta | Respuesta | Errores |
|---|---|---|---|
| GET | `/health` | `{ status: "ok", service: "kindhop-api", database: { configured: boolean, connected: boolean } }` · `connected` solo es `true` si `DATABASE_URL` está definida y `SELECT 1` responde | — |
| GET | `/api/cities` | `{ cities: City[] }` | — |
| GET | `/api/cities/:cityId` | `{ city: City }` | 400 `INVALID_CITY_ID`, 404 `CITY_NOT_FOUND` |
| GET | `/api/cities/:cityId/events?lang=` | `{ events: Event[] }` (solo no terminados, orden `startsAt`; `image` y `place` opcionales) | 400 `INVALID_CITY_ID`, 404 `CITY_NOT_FOUND`, 503 `DATABASE_UNAVAILABLE` |
| GET | `/api/cities/:cityId/reports` | `{ reports: UrbanReport[] }` solo con `expiresAt` futuro, más recientes primero | 503 `DATABASE_UNAVAILABLE` |
| POST | `/api/cities/:cityId/reports` | `201 { report }` | 400 `VALIDATION`, 429 `RATE_LIMITED`, 503 `DATABASE_UNAVAILABLE` |
| POST | `/api/cities/:cityId/reports/:id/confirm` | `{ report }` con `confirmCount + 1` (no cambia `status`) | 400 `VALIDATION`, 404 `REPORT_NOT_FOUND`, 429 `RATE_LIMITED`, 503 `DATABASE_UNAVAILABLE` |
| PATCH | `/api/cities/:cityId/reports/:id` | `{ report }` moderado | 401 `UNAUTHORIZED`, 400 `VALIDATION`, 404 `REPORT_NOT_FOUND`, 503 `DATABASE_UNAVAILABLE` |
| GET | `/api/cities/:cityId/suggestions?placeId=&lang=&budget=low` | `{ suggestions: Suggestion[] }` · `budget` es opcional y solo acepta `low` (presupuesto local-first; no hay tabla); `lang` opcional `es` (defecto) o `en` para el texto `why` | 400 `VALIDATION`, 404 `PLACE_NOT_FOUND`, 503 `DATABASE_UNAVAILABLE` |
| GET | `/api/cities/:cityId/pois?category=` | `{ pois: Poi[], source: Source }` | 400 `VALIDATION` (categoría malformada), 404 `MODULE_UNAVAILABLE` (ciudad sin adaptador; hoy CDMX), 503 `DATABASE_UNAVAILABLE` |
| GET | `/api/cities/:cityId/transit` | `{ routes: TransitRoute[], source: Source }` · **Cancún** lee en vivo el catálogo público (caché 60 s); `retrievedAt` es el `generado` del volcado; `stops` va vacío; no usa la base. **CDMX** lee el snapshot GTFS importado (`npm run db:import:cdmx`): `licenseUrl` si la licencia trae URL; sin `fareCents` si la fuente no publica tarifa; sin importar → `routes: []` con `retrievedAt: null` | 400 `INVALID_CITY_ID`, 404 `CITY_NOT_FOUND`, 404 `MODULE_UNAVAILABLE`, 502 `TRANSIT_UNAVAILABLE` (Cancún: fuente caída; CDMX: falta la fila `cdmx-gtfs`), 503 `DATABASE_UNAVAILABLE` (solo CDMX) |
| GET | `/api/cities/:cityId/districts` | GeoJSON `FeatureCollection` + `source` (solo ciudades con fixture importado). Sin filas importadas: `features: []` y `source` del fixture CDMX (no 500) | 400 `INVALID_CITY_ID`, 404 `CITY_NOT_FOUND`, 404 `MODULE_UNAVAILABLE`, 503 `DATABASE_UNAVAILABLE` |
| * | cualquier otra | — | 404 `NOT_FOUND`, 400 `INVALID_JSON`, 500 `INTERNAL` |

La web **no muestra** `error.message`: traduce `error.code` con `errors.<CODE>` de `apps/web/src/shared/i18n/locales/*.json`. Todo código nuevo necesita su clave en ambos JSON (ver [i18n](../03-design/i18n.md)).

Toda ruta `/api/cities/:cityId/<módulo>` valida la ciudad con `requireCity()` (mismos 400/404 de arriba) y, si la ciudad no tiene adaptador para ese módulo, responde **404 `MODULE_UNAVAILABLE`** (`pickAdapter()`, tests en `apps/api/src/shared/city-adapters.test.ts`).

Sugerencias (KH-013, tests en `apps/api/src/modules/decisions/`): misma categoría y ciudad, a ≤ 40 km, ordenadas por distancia haversine. Si hay una incidencia activa (`UNVERIFIED` o `CONFIRMED`, no caducada) a menos de 300 m del `placeId`, se proponen alternativas que no tengan otra incidencia activa a menos de 300 m. `budget=low` pone primero `is_free = true`; `false` y `NULL` van después (`NULL` no es gratis). Sin incidencia cercana y sin `budget=low` la lista va vacía. Cada ítem trae `why`, `source` (`data_sources.name`), `asOf` (ISO 8601 UTC) y `confidence`.

```ts
type Suggestion = {
  title: string;
  placeId: string;
  why: string;                 // `lang` del query (es/en), generado por la regla
  source: string;              // data_sources.name
  asOf: string;                // places.retrieved_at, si no data_sources.retrieved_at, si no places.created_at
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'; // por regla: gratis confirmado HIGH; incidencia MEDIUM; precio desconocido, de pago o sin fuente LOW (si aplican varias, la más baja)
  dataStatus: 'REAL' | 'DEMO' | 'USER_REPORTED' | 'UNVERIFIED';
};
```

`GET /pois` devuelve solo lugares `REAL` con `source_id = osm` (las filas `DEMO` no se mezclan con esa fuente). `category` vacío lista todos; un valor que no cumple el id de `categories` responde 400. Forma de `Poi` y `Source`: bloque de tipos de abajo.

```ts
type City = {
  id: string;                 // 'cancun' | 'cdmx'
  name: string; countryCode: string; timezone: string;
  center: [lon: number, lat: number]; zoom: number;
  modules: Record<'transit'|'pois'|'districts'|'events'|'reports'|'budget', 'IMPLEMENTED'|'PLANNED'|'UNAVAILABLE'>;
};
```

## Planificado (forma acordada; cambiarla = avisar a frontend)

Tipo común de procedencia en toda respuesta de datos:
```ts
type Source = {
  name: string; url: string; license: string;
  licenseUrl?: string | null; // transporte: URL de la licencia, si va en el texto (`Nombre | https://…`)
  attribution: string | null;
  retrievedAt: string | null; // null si esa fuente todavía no se ha importado
  dataStatus: 'REAL'|'DEMO'|'USER_REPORTED'|'UNVERIFIED';
};
type TransitRoute = {
  id: string; // route_id del GTFS (external_id), no el serial
  name: string;
  shortName?: string;
  mode: 'bus'|'brt'|'metro'|'other';
  color?: string; // #RRGGBB solo si la fuente lo publica
  geometry: GeoJSON.LineString | GeoJSON.MultiLineString;
  stops: { id: string; name: string; coordinates: [number, number] }[]; // orden del viaje representativo
  fareCents?: number; // solo si la fuente publica una tarifa de ruta
};
type Poi = {
  id: string;
  name: string; // español
  category: 'music'|'art'|'food'|'culture'|'beaches'|'nightlife'|'markets'|'parks'|'museums'|'shopping'|'sports'|'family';
  coordinates: [number, number]; // [lon, lat]
  dataStatus: 'REAL'|'DEMO'|'UNVERIFIED';
  url?: string; // objeto en OpenStreetMap
  i18n?: { en?: { name?: string } }; // solo si la fuente trae name:en
  rating?: number; // 0.0–5.0 si existe en BD
  ratingCount?: number; // total de reseñas si existe en BD
  imageUrl?: string; // foto genérica local en BD
};
```

| Método | Ruta | Respuesta | Tarjeta |
|---|---|---|---|

```ts
type Event = {
  place?: { id: string; name: string; coordinates: [number, number]; dataStatus: 'REAL'|'DEMO'|'USER_REPORTED'|'UNVERIFIED' }; // lugar enlazado de la misma ciudad; sin enlace, no hay pin
  id: string; title: string; venue?: string; category: 'music'|'art'|'food'|'culture'|'other'; startsAt: string; endsAt?: string; sourceUrl: string | null /* null solo en DEMO */; dataStatus: 'REAL'|'DEMO'|'UNVERIFIED'; rating?: number; ratingCount?: number; image?: { src: string; alt: string; author: string; license: string; licenseUrl: string; sourceUrl: string; position?: string } };
```

Presupuesto: **sin endpoint en el MVP** (local-first, OPEN-QUESTIONS #5). Escritura pública siempre con validación zod, límites y moderación.

### Incidencias (KH-011)

```ts
type UrbanReport = {
  id: string;
  kind: 'FLOOD'|'PUDDLE';
  coordinates: [number, number]; // [lon, lat]; al crear, la API redondea lat y lon a 3 decimales (≈ 100 m)
  description?: string;          // ≤ 500; se recorta el espacio de los extremos
  status: 'UNVERIFIED'|'CONFIRMED'|'RESOLVED'|'REJECTED'; // el POST siempre guarda UNVERIFIED
  dataStatus: 'DEMO'|'USER_REPORTED'; // DEMO solo en el seed; lo que crea la API es USER_REPORTED
  confirmCount: number;
  createdAt: string;
  expiresAt: string;             // en un POST: createdAt + 6 h
  moderatedAt?: string;
  moderationNote?: string;       // ≤ 280
};
type CreateReport = { kind: 'FLOOD'|'PUDDLE'; lat: number; lon: number; description?: string };
type ModerateReport = { status: UrbanReport['status']; moderationNote?: string };
```

`POST` valida `CreateReport` con zod. `lat`/`lon` se redondean a 3 decimales **antes** de guardar. `expiresAt = now() + 6 h`, `status = UNVERIFIED`, `dataStatus = USER_REPORTED`. El listado solo devuelve filas con `expires_at > now()`.

`POST …/:id/confirm` suma 1 a `confirmCount` si la incidencia es de esa ciudad y no caducó. No pasa el estado a `CONFIRMED`: eso es moderación. Sin cuentas, la misma persona puede confirmar más de una vez hasta el límite; no es un voto único.

Límite en memoria del proceso: **10** escrituras (crear + confirmar) por IP cada **10 minutos**. La IP sale de `req.ip` (con `TRUST_PROXY` en `apps/api/.env.example` si hay reverse proxy). La IP no se escribe en la base ni en el log de la petición. Al pasarse: `429 RATE_LIMITED`. Reiniciar la API olvida el contador; varias instancias no lo comparten.

`PATCH` exige `Authorization: Bearer <REPORTS_ADMIN_TOKEN>` (`apps/api/.env.example`; sin valor, o con un valor distinto, `401 UNAUTHORIZED`). Cuerpo `ModerateReport`. Guarda `status`, `moderatedAt = now()` y `moderationNote` (si se omite, borra la nota anterior). También puede moderar una incidencia ya caducada; el `GET` sigue sin listarla.

## Autenticación (KH-019, [auth](../02-modules/auth.md))

**Toda `/api` exige sesión** salvo `/api/auth/*`: sin cookie `kh.sid` firmada y válida → `401 UNAUTHENTICATED`. Escrituras (POST/PATCH/DELETE) solo con cabecera `Origin` de la web → si no, `403 FORBIDDEN_ORIGIN`. Sin `SESSION_SECRET` en el servidor → `503 AUTH_NOT_CONFIGURED`.

| Método | Ruta | Respuesta | Errores |
|---|---|---|---|
| GET | `/api/auth/config` | `{ google: boolean, devLogin: boolean }` (sin secretos) | — |
| GET | `/api/auth/me` | `{ user: { id, email, name, pictureUrl } }` | 401 `UNAUTHENTICATED` |
| GET | `/api/auth/google` | 303 a Google (PKCE, state, nonce) | 503 `AUTH_PROVIDER_UNAVAILABLE` |
| GET | `/api/auth/google/callback` | 303 a `PUBLIC_URL/` con sesión abierta, o a `/?auth_error=cancelled\|failed` | — (los errores nunca se detallan al cliente) |
| POST | `/api/auth/logout` | 204, destruye la sesión y borra la cookie | 403 `FORBIDDEN_ORIGIN` |
| POST | `/api/auth/dev-login` | 204 (solo con `AUTH_DEV_LOGIN=true` y fuera de producción) | 404 si está apagada |
