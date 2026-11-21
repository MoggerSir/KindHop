# Módulo: presupuesto de viaje

**Qué hace:** el usuario fija presupuesto, registra gastos manuales por categoría y ve disponible, historial y gráfico.
**Dónde:** `apps/web/src/features/budget/` — `budget.js` (lógica pura), `budget.test.js` (`node --test`), `useBudget.js` (estado + `localStorage`), `BudgetPanel.jsx`.
**Datos:** `{ budgetCents, currency: 'MXN', expenses: [{ id, category: 'transport'|'food'|'activities'|'lodging'|'other', amountCents, occurredAt, note?, local? }] }` (`local: true` = el usuario lo marcó como pagado en un negocio local, KH-020). Solo en el navegador (OPEN-QUESTIONS #5). CSV opcional (P1 tardío).

| Pieza | Estado |
|---|---|
| Presupuesto, gastos manuales, edición, borrado/deshacer, historial, gráfico SVG accesible y CSV | IMPLEMENTADO (KH-010, en revisión) |
| Medidor de gasto local (`localShare()`, `LocalSpendMeter.jsx`): % de lo gastado marcado como local, redondeado hacia abajo | IMPLEMENTADO (KH-020) |
| Integración con el motor de decisiones (`budget=low` en `GET /suggestions`) | API IMPLEMENTADO (KH-013); la pantalla sigue PLANIFICADO (KH-010) |

**Prohibido:** leer Google Wallet/Google Pay (no exponen historial de transacciones), pedir número de tarjeta, CVV, PIN o credenciales bancarias; usar `float` para dinero.
**Prueba:** `"12.50" → 1250`; suma y disponible; montos negativos/no numéricos rechazados; disponible negativo se muestra como exceso, no se oculta.
**Terminado cuando:** añadir un gasto actualiza disponible y gráfico al instante y sobrevive a recargar la página.

En pantallas de 320–430 px el formulario, el gráfico, el medidor y la hoja de gasto se quedan dentro del viewport (también en inglés y con el texto al 130 %). Lo cubre KH-022.

## Persistencia y límites

Clave `kindhop.budget.v1`: solo navegador y dispositivo actuales, independiente de la ciudad. Si no hay datos guardados aún, precarga un presupuesto y 6 gastos de ejemplo identificados con etiqueta `DEMO` y botón «Empezar en cero» para borrar y empezar vacío. Importes positivos hasta 99 999 999.99 MXN; nota opcional de 80 caracteres. Se descartan registros inválidos e ids duplicados al leer. El historial usa el día de la zona del dispositivo, guardado como ISO UTC. Si localStorage falla, se conserva estado en memoria y se avisa; cerrar la pestaña pierde esos cambios. No hay sincronización bancaria ni integración automática con sugerencias.

## Evidencia KH-010

- `npm run check`: API 50, web 14 y scripts 6 tests en verde; los bloques que requieren PostgreSQL/red real se omiten sin sus variables.
- `npm run build`: correcto; aviso conocido del bundle web de 1528.54 kB (> 1400 kB).
- Chromium 1243 con Playwright: vacío, validaciones, presupuesto sin gastos, alta de cinco categorías, recarga, exceso, edición/borrado/deshacer, 375/390/1440 px, inglés y movimiento reducido. Sin scroll horizontal, contenido invisible ni errores de consola en los 13 estados capturados.
- Teclado: abrir con Enter, monto decimal con coma, categoría con flechas y guardar; foco del cambio de presupuesto; exportación CSV y creación de gasto con localStorage bloqueado.
- Capturas y guiones de esta sesión: `/tmp/kindhop-resume/wallet/`, `wallet-qa.mjs`, `wallet-extra.mjs` en el directorio padre. No forman parte del producto ni contienen datos reales.
- Regresión compartida de `Sheet`: reapertura a 30 ms del cierre mantiene `open=true`; Escape y botón cerrar funcionan tras el arreglo de cancelación. Lint y 14 tests web siguen en verde.
- No verificado: Safari/Firefox, lector de pantalla real y panel de animaciones al 10 %.
