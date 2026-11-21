# Módulo: monetización (KH-021)

**Qué hace:** las 5 fuentes de ingresos del modelo de negocio, visibles en la app. En la demo **todo es simulado**: no se cobra, no se cargan anuncios reales y los convenios con negocios no existen todavía.
**Dónde:** web `apps/web/src/features/monetization/` (precios en `pricing.js`, única fuente); API `apps/api/src/modules/coupons/`, plan del usuario en `modules/auth/users.db.ts`, puestos de eventos en `modules/events/events.db.ts`; migración `db/migrations/0009_monetizacion.sql`, seed `db/seeds/0003_patrocinios_demo.sql`.

## Fuentes de ingresos

| # | Fuente | Quién paga | Precio propuesto (`pricing.js`) | En la app | Estado |
|---|---|---|---|---|---|
| 1 | Anuncios de red (**AdMob**) | el anunciante, vía Google | por impresión / clic | `AdSlot kind="network"` en Explorar (hueco reservado) | Hueco simulado; SDK de AdMob al compilar la app móvil |
| 2 | **Eventos destacados**: puestos 1, 2 y 3 entre los recomendados | organizadores | $599 / $399 / $249 MXN por semana | los 3 primeros mosaicos de «Eventos recomendados por nosotros» en Inicio (el #1 es el grande), con «Patrocinado · #n» (`events/sponsored.js`); «Publica tu evento» en el menú de cuenta | Puestos DEMO en la API (`sponsoredRank`); formulario simulado |
| 3 | **Negocio local destacado**: prioridad en búsqueda, recomendación y mapa | negocio local | $299 MXN / mes | Oferta en «Negocios y organizadores» | Oferta simulada. PLANIFICADO: pintar el negocio destacado en búsqueda y mapa con «Patrocinado» |
| 4 | **Anuncio personalizado** propio (banner en app y web) | negocio local | desde $1,500 MXN / mes | `AdSlot kind="direct"` en Inicio + oferta | Banner de ejemplo simulado |
| 5 | **KinHop Pro** con Stripe: sin anuncios un mes + cupones en negocios con convenio | turista | $59 MXN / mes | Menú de cuenta: tarjeta del plan, «KinHop Pro», «Cupones de descuento» con QR | Cuenta demo = Pro simulado; Stripe Checkout PENDIENTE |

## Reglas

- **Todo lo pagado lleva etiqueta** («Patrocinado», «Patrocinado · #n», «Anuncio») y va **aparte** de las recomendaciones explicadas. Pagar no cambia el `why` de una sugerencia. Excepción explícita: los 3 primeros mosaicos de «Eventos recomendados por nosotros» son los puestos pagados, siempre con su etiqueta.
- **El plan lo decide el servidor.** `GET /api/auth/me` devuelve `user.plan = { tier, until, simulated }`. `GET /api/cities/:cityId/coupons` responde 403 `PLAN_REQUIRED` sin Pro. El interruptor «Ver la app como usuario gratis» (solo cuenta demo) solo muestra anuncios: no da acceso a nada.
- **Cuenta demo = Pro simulado:** `POST /api/auth/dev-login` concede 30 días de Pro con `plan_simulated = true`. Solo existe con `AUTH_DEV_LOGIN=true` fuera de producción.
- **Cupones DEMO:** negocios y convenios ficticios (`coupons/catalog.ts`), marcados `DEMO` y con aviso. El QR codifica `KINHOP|DEMO|<código>`; en producción llevaría un token firmado de un solo uso que el negocio valida.
- Nunca se guardan datos de tarjeta: Stripe Checkout los maneja.

## Para pasar a producción

1. Stripe: `POST /api/billing/checkout` (crea la sesión de Checkout) y `POST /api/billing/webhook` (verifica la firma y pone `plan = 'PRO'`, `plan_until`). Claves solo en `.env`.
2. Tabla `coupons` + canje con token firmado y registro de usos por negocio.
3. Tabla de patrocinios (evento o negocio, puesto, fechas, pago) con moderación antes de publicar.
4. AdMob en la app móvil (y su política de consentimiento); en web, su equivalente.

**Prueba:** `npm test -w @kindhop/api` (`coupons.test.ts`: Pro recibe cupones, gratis 403, Pro caducado vuelve a gratis). Navegador: cuenta demo → avatar → Cupones → QR.
