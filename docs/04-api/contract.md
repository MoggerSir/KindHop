# Contrato API REST

JSON · fechas ISO 8601 UTC · dinero en centavos enteros · coordenadas `[lon, lat]` · geometrías GeoJSON. Error siempre: `{ "error": { "code": "UPPER_SNAKE", "message": "texto legible" } }`. **Actualiza este archivo antes de implementar un endpoint** y marca el estado real.

## Implementado (tests en `apps/api/src/**/*.test.ts`)

| Método | Ruta | Respuesta | Errores |
|---|---|---|---|
| GET | `/health` | `{ status: "ok", service: "kindhop-api" }` | — |
| GET | `/api/cities` | `{ cities: City[] }` | — |
| GET | `/api/cities/:cityId` | `{ city: City }` | 400 `INVALID_CITY_ID`, 404 `CITY_NOT_FOUND` |
| GET | `/api/cities/:cityId/suggestions?placeId=&budget=low` | `{ suggestions: Suggestion[] }` · `budget` es opcional y solo acepta `low` (presupuesto local-first; no hay tabla) | 400 `VALIDATION`, 404 `PLACE_NOT_FOUND`, 503 `DATABASE_UNAVAILABLE` |
| * | cualquier otra | — | 404 `NOT_FOUND`, 400 `INVALID_JSON`, 500 `INTERNAL` |

La web **no muestra** `error.message`: traduce `error.code` con `errors.<CODE>` de `apps/web/src/shared/i18n/locales/*.json`. Todo código nuevo necesita su clave en ambos JSON (ver [i18n](../03-design/i18n.md)).

Toda ruta `/api/cities/:cityId/<módulo>` valida la ciudad con `requireCity()` (mismos 400/404 de arriba) y, si la ciudad no tiene adaptador para ese módulo, responde **404 `MODULE_UNAVAILABLE`** (`pickAdapter()`, tests en `apps/api/src/shared/city-adapters.test.ts`).

Sugerencias (KH-013, tests en `apps/api/src/modules/decisions/`): misma categoría y ciudad, a ≤ 40 km, ordenadas por distancia haversine. Si hay una incidencia activa (`UNVERIFIED` o `CONFIRMED`, no caducada) a menos de 300 m del `placeId`, se proponen alternativas que no tengan otra incidencia activa a menos de 300 m. `budget=low` pone primero `is_free = true`; `false` y `NULL` van después (`NULL` no es gratis). Sin incidencia cercana y sin `budget=low` la lista va vacía. Cada ítem trae `why`, `source` (`data_sources.name`), `asOf` (ISO 8601 UTC) y `confidence`.

```ts
type Suggestion = {
  title: string;
  placeId: string;
  why: string;                 // español, generado por la regla
  source: string;              // data_sources.name
  asOf: string;                // places.retrieved_at, si no data_sources.retrieved_at, si no places.created_at
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'; // por regla: gratis confirmado HIGH; incidencia MEDIUM; precio desconocido, de pago o sin fuente LOW (si aplican varias, la más baja)
  dataStatus: 'REAL' | 'DEMO' | 'USER_REPORTED' | 'UNVERIFIED';
};
```

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
type Source = { name: string; url: string; license: string; retrievedAt: string; dataStatus: 'REAL'|'DEMO'|'USER_REPORTED'|'UNVERIFIED' };
```

| Método | Ruta | Respuesta | Tarjeta |
|---|---|---|---|
| GET | `/api/cities/:cityId/transit` | `{ routes: TransitRoute[], source: Source }` · 502 `TRANSIT_UNAVAILABLE` | KH-003, KH-007 |
| GET | `/api/cities/:cityId/pois?category=` | `{ pois: Poi[], source: Source }` | KH-004 |
| GET | `/api/cities/:cityId/districts` | GeoJSON `FeatureCollection` + `source` | KH-009 |
| GET | `/api/cities/:cityId/events` | `{ events: Event[] }` (solo no terminados) · la web usa hoy el fixture DEMO `apps/web/src/features/events/events.demo.js` con esta misma forma | KH-014 |
| GET | `/api/cities/:cityId/reports` | `{ reports: UrbanReport[] }` (solo no caducados) | KH-011 |
| POST | `/api/cities/:cityId/reports` | `201 { report }` · 400 `VALIDATION`, 429 `RATE_LIMITED` | KH-011 |

```ts
type TransitRoute = { id: string; name: string; mode: 'bus'|'brt'|'metro'|'other'; geometry: GeoJSON.LineString | GeoJSON.MultiLineString; stops: { id: string; name: string; coordinates: [number, number] }[]; fareCents?: number /* solo si la fuente lo da */ };
type Poi = { id: string; name: string; category: 'beach'|'museum'|'park'|'plaza'|'other'; coordinates: [number, number]; url?: string };
type Event = { id: string; title: string; venue?: string; category: 'music'|'art'|'food'|'culture'|'other'; startsAt: string; endsAt?: string; sourceUrl: string | null /* null solo en DEMO */; dataStatus: 'REAL'|'DEMO'|'UNVERIFIED'; image?: { src: string; alt: string; author: string; license: string; licenseUrl: string; sourceUrl: string; position?: string } };
type UrbanReport = { id: string; kind: 'FLOOD'|'PUDDLE'; coordinates: [number, number]; description?: string; status: 'UNVERIFIED'|'CONFIRMED'|'RESOLVED'|'REJECTED'; dataStatus: 'DEMO'|'USER_REPORTED'; createdAt: string; expiresAt: string };
```

Presupuesto: **sin endpoint en el MVP** (local-first, OPEN-QUESTIONS #5). Escritura pública siempre con validación zod, límites y moderación.
