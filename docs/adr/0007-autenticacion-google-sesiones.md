# ADR-0007 — Autenticación con Google y sesiones de servidor (express-session)

**Fecha:** 2026-11-21 · **Estado:** Aceptado · **Cambia:** "autenticación completa" estaba en P2 (backlog); el equipo la adelanta.

## Contexto
El equipo pidió login con Google obligatorio para usar la app, creación de usuarios, sesión recordada en una cookie, que la API no acepte peticiones sin firmar y que el login no se pueda saltar desde las DevTools, todo en Express y sin secretos en el front. Precisó: express-session montado una vez, que cree el id de sesión y que Express lo use para decidir qué pantallas se muestran; nada sensible en la URL.

## Decisión
1. **OAuth 2.0 / OpenID Connect "authorization code" con PKCE, entero en Express.** Verificación del `id_token` con `jose` contra las claves públicas de Google. Sin librería de Google ni Passport (menos superficie).
2. **Sesiones de servidor con `express-session`** (una sola vez para `/api`), almacenadas en PostgreSQL con `connect-pg-simple` (`user_sessions`). Cookie `kh.sid` firmada (HMAC con `SESSION_SECRET`), `HttpOnly`, `SameSite=Lax`, `Secure` con HTTPS, 7 días renovables. Se prefirió a un JWT en cookie porque una sesión de servidor se revoca al instante (cerrar sesión la invalida) y el navegador solo guarda un id opaco.
3. **Toda `/api` exige sesión** (salvo `/api/auth/*` y `/health`). `createApp({ requireAuth: false })` existe solo para los tests de cada módulo; no hay variable de entorno ni petición que lo desactive, y `auth.test.ts` comprueba que todas las rutas dan 401 sin sesión.
4. **CSRF:** cookie `SameSite=Lax` + exigir cabecera `Origin` igual a la web en toda escritura.
5. **Tabla `users`** mínima (sub de Google, email, nombre, foto); no se guardan tokens de Google ni contraseñas.
6. **Front:** `SessionProvider` consulta `GET /api/auth/me`; sin sesión solo se monta `LoginScreen`. Un 401 en cualquier petición devuelve al login.
7. Dependencias nuevas aceptadas: `express-session`, `connect-pg-simple`, `jose`.

## Consecuencias
- Desarrollo y tests necesitan `SESSION_SECRET`; sin él la API responde 503 (falla cerrada).
- Para el día de la demo hacen falta credenciales OAuth de Google con el dominio público en los redirect URI, o usar la entrada demo (que no existe en producción).
- Pendiente: límite de intentos por IP en `/api/auth` y probar el flujo con credenciales reales de Google.
