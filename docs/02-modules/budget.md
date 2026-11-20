# Módulo: presupuesto de viaje

**Qué hace:** el usuario fija presupuesto, registra gastos manuales por categoría y ve disponible, historial y gráfico.
**Dónde:** `apps/web/src/features/budget/` — `budget.js` (lógica pura), `budget.test.js` (`node --test`), `useBudget.js` (estado + `localStorage`), `BudgetPanel.jsx`.
**Datos:** `{ budgetCents, currency: 'MXN', expenses: [{ id, category: 'transport'|'food'|'activities'|'lodging'|'other', amountCents, occurredAt, note? }] }`. Solo en el navegador (OPEN-QUESTIONS #5). CSV opcional (P1 tardío).

| Pieza | Estado |
|---|---|
| Todo el módulo | PLANIFICADO (KH-010) |
| Integración con el motor de decisiones (presupuesto bajo → opciones gratuitas) | PLANIFICADO (KH-013) |

**Prohibido:** leer Google Wallet/Google Pay (no exponen historial de transacciones), pedir número de tarjeta, CVV, PIN o credenciales bancarias; usar `float` para dinero.
**Prueba:** `"12.50" → 1250`; suma y disponible; montos negativos/no numéricos rechazados; disponible negativo se muestra como exceso, no se oculta.
**Terminado cuando:** añadir un gasto actualiza disponible y gráfico al instante y sobrevive a recargar la página.
