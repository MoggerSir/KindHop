# Módulo: autenticación (Google + express-session)

**Qué hace:** la app solo se usa con sesión iniciada. El usuario entra con Google; la primera vez se crea su cuenta. Decisión: [ADR-0007](../adr/0007-autenticacion-google-sesiones.md).

**Dónde:** API `apps/api/src/modules/auth/` (`config.ts`, `google.ts`, `session.ts`, `users.db.ts`, `routes.ts`, `auth.test.ts`, `rate-limit.ts`, `rate-limit.test.ts`), cabeceras y control de origen en `apps/api/src/shared/security.ts`, montaje en `apps/api/src/app.ts`; tablas `users` y `user_sessions` en `db/migrations/0007_users_sessions.sql`; web `apps/web/src/features/auth/` (`SessionProvider`, `LoginScreen`, `auth.api.js`).

## Cómo funciona

1. La web pregunta a Express `GET /api/auth/me`. Con sesión → muestra la app; sin sesión → solo monta `LoginScreen` (el resto de pantallas ni existen en la página).
2. "Continuar con Google" navega a `GET /api/auth/google`. Express guarda en la sesión del servidor un `state`, un verificador **PKCE** y un `nonce`, y redirige a Google.
3. Google vuelve a `GET /api/auth/google/callback?code&state`. Express comprueba el `state` (tiempo constante, un solo uso, 10 min), canjea el código **servidor a servidor** con el client secret y el verificador PKCE, verifica el `id_token` (firma con las claves públicas de Google, emisor, audiencia, caducidad, `nonce`, email verificado), crea o actualiza el usuario, **regenera el id de sesión** y redirige a `/` (la URL con el código no queda en la barra).
4. express-session (montado **una sola vez** para `/api`) guarda la sesión en PostgreSQL (`user_sessions`) y envía al navegador solo el id firmado en la cookie `kh.sid`: `HttpOnly`, `SameSite=Lax`, `Secure` cuando la web va por HTTPS, 7 días renovables con el uso.
5. Toda ruta de datos pasa por `requireSession`: sin cookie firmada válida y usuario existente → **401 `UNAUTHENTICATED`**. Cerrar sesión (`POST /api/auth/logout`) destruye la sesión en el servidor: la cookie vieja deja de servir.

## Por qué es seguro (y qué no protege el front)

- El front decide qué **mostrar**, nunca qué **permitir**: aunque alguien fuerce el estado desde las DevTools, la API no entrega datos sin sesión firmada.
- El token de sesión es `HttpOnly`: el JavaScript de la página no puede leerlo (`document.cookie` no lo muestra), Esto impide leer directamente la cookie; un XSS aún podría ejecutar acciones con la sesión abierta. El estado de sesión del front vive encapsulado en `SessionProvider` (ámbito de módulo: el mismo aislamiento que da una IIFE), sin nada en `window` ni en `localStorage`.
- Secretos (`SESSION_SECRET`, `GOOGLE_CLIENT_SECRET`) solo en `apps/api/.env`. La web no recibe ni el client id (la redirección la arma Express).
- Escrituras (POST/PATCH/DELETE) solo desde el origen de la web (`requireSameOrigin`, cabecera `Origin` exacta) + cookie `SameSite=Lax` → protección CSRF.
- Nada sensible por URL: cerrar sesión y la entrada demo van por POST; la sesión va en cookie. Lo único que viaja en una URL es el código de un solo uso que Google pone en la vuelta (imposición de OAuth), que caduca en segundos, está atado a PKCE y desaparece con la redirección.
- Falla cerrada: sin `SESSION_SECRET` (≥ 32 caracteres) la API responde 503 a todo; en producción sin base de datos no hay sesiones.
- Cabeceras: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, COOP/CORP same-origin.

## Configurar Google (una vez por entorno)

1. Google Cloud Console → *APIs y servicios* → *Credenciales* → *Crear ID de cliente de OAuth* → tipo **Aplicación web**.
2. *URI de redireccionamiento autorizados*: `http://localhost:5173/api/auth/google/callback` (desarrollo, a través del proxy de Vite) y `https://<dominio-de-la-demo>/api/auth/google/callback`.
3. Copia el client id y el secret a `apps/api/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), con `PUBLIC_URL` = origen de la web y un `SESSION_SECRET` largo: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
4. `npm run db:migrate` (crea `users` y `user_sessions`).

Sin credenciales de Google, el botón aparece deshabilitado con un aviso. Para desarrollo y la demo existe `AUTH_DEV_LOGIN=true` ("Entrar con la cuenta demo", usuario `demo@kindhop.local`), que **nunca** funciona con `NODE_ENV=production`.

| Pieza | Estado |
|---|---|
| Login con Google (PKCE, state, nonce, verificación del id_token) | IMPLEMENTADO (probado con Google real por el túnel HTTPS el 21/11/2026: login, recarga y logout) |
| Sesiones express-session en PostgreSQL, cookie firmada HttpOnly | IMPLEMENTADO |
| Toda `/api` exige sesión; CSRF por origen; cabeceras | IMPLEMENTADO |
| Entrada demo (solo fuera de producción) | IMPLEMENTADO |
| Límite de intentos por IP en `/api/auth` | IMPLEMENTADO: 20 intentos/10 min por IP, antes de crear sesiones |

**Prueba:** `npm test -w @kindhop/api` (`modules/auth/auth.test.ts`: 401 en todas las rutas, cookie falsificada, CSRF, PKCE, `state` inválido, falla cerrada y ciclo completo con PostgreSQL).

## Límite de intentos

Google, su callback y la entrada demo comparten 20 solicitudes por IP cada 10 minutos. Al agotarlas: 429 `RATE_LIMITED` con `Retry-After`; consultar la sesión/configuración y cerrar sesión siguen disponibles. Los contadores son locales al proceso, con un máximo de 10 000 IP activas y sin expulsar contadores bloqueados. Antes de desplegar varias instancias se necesita un almacén compartido.

`TRUST_PROXY` debe coincidir con los proxies reales del despliegue; por defecto no se confía en `X-Forwarded-For`. Nunca activarlo indiscriminadamente para corregir una IP.

Si falla el almacén al cerrar sesión, la API devuelve error y la web conserva la sesión con un aviso y reintento.

## Prueba por túnel HTTPS

El 21/11/2026 se creó el proyecto Google Cloud **KindHop** (`nodal-spot-515408-d8`), con cliente web en modo de prueba y callbacks de localhost:5173 y `https://currencies-art-day-selection.trycloudflare.com/api/auth/google/callback`. Las credenciales reales quedan únicamente en el `.env` local, fuera de Git.

Para probar en teléfono, `PUBLIC_URL` y `WEB_ORIGIN` deben ser el origen HTTPS exacto del túnel. `TRUST_PROXY=loopback` corresponde a esta cadena local: Cloudflare → cloudflared → Vite → API. Vite conserva la IP de Cloudflare solo desde loopback y sustituye cabeceras reenviadas por clientes LAN. No trasladar esta confianza a otro despliegue sin revisar su cadena.

El túnel actual apunta a `http://localhost:5181`: mantener Vite en ese puerto con `npm exec -w @kindhop/web -- vite --host localhost --port 5181 --strictPort`. No reiniciar cloudflared para cambiar de puerto: los túneles rápidos cambian de dominio al reiniciarse. Si cambia el dominio, actualizar ambos orígenes del `.env` y el callback autorizado en Google.

Con `PUBLIC_URL` HTTPS, la cookie es `Secure`: probar el login desde el enlace HTTPS. Si se abre localhost HTTP, la web redirige al origen canónico antes de consultar o crear la sesión. Para volver al desarrollo local, restaurar ambos orígenes a `http://localhost:5173` y reiniciar la API.
