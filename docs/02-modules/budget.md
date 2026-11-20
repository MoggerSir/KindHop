# Módulo: presupuesto de viaje

**Problema:** usuario no sabe cuánto del presupuesto consume en transporte, comida y actividades. Solución: ingresar presupuesto y registrar gastos manualmente (CSV importable si alcanza tiempo), ver disponible y gráfica por categoría.

**No hay lectura de transacciones de tarjetas por Google Wallet/Pay.** Open finance requiere integración autorizada fuera del hackatón; nunca pedir número completo, CVV, PIN ni contraseña del banco.

**Modelo:** amounts en centavos MXN enteros, `budgetId`, `category`, `amountCents`, `occurredAt`, `note?`. Sin compartir gastos entre usuarios. Asegurar que el backend filtre por usuario cuando exista autenticación.

**Aceptación:** agregar gasto, actualizar disponible, mostrar desglose, manejar validaciones y montos excesivos sin cálculos flotantes.
