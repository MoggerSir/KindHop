// Lógica pura del presupuesto de viaje (sin React ni navegador): se prueba con `node --test` en budget.test.js.
// Dinero siempre en centavos enteros; nunca float. Fechas ISO 8601 UTC. Especificación: docs/02-modules/budget.md

export const CATEGORIES = ['transport', 'food', 'activities', 'lodging', 'other'];
export const CURRENCY = 'MXN';
export const MAX_CENTS = 99_999_999_99; // 99 999 999.99 MXN: tope sensato para un viaje, evita números absurdos.

export const EMPTY_STATE = Object.freeze({ budgetCents: null, currency: CURRENCY, expenses: [] });

// Texto del usuario → centavos enteros, o null si no es un monto válido (> 0, hasta 2 decimales).
// Acepta "12.50", "12,50" (coma decimal), "1,500" y "1,500.75" (comas de miles), con "$" y espacios opcionales.
// Se convierte por cadenas, sin pasar por float: "0.1" + "0.2" nunca da 0.30000000000000004.
export function parseAmount(input) {
  if (typeof input !== 'string' && typeof input !== 'number') return null;
  let text = String(input).trim().replace(/^\$/, '').replace(/\s+/g, '');
  if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(text)) text = text.replace(/,/g, '');
  else if (/^\d+,\d{1,2}$/.test(text)) text = text.replace(',', '.');
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_CENTS) return null;
  return cents;
}

// Centavos → texto editable sin símbolo ni miles ("1250" → "12.50"), para rellenar un campo.
export function centsToInput(cents) {
  if (!Number.isInteger(cents)) return '';
  const whole = Math.trunc(cents / 100);
  const rest = String(Math.abs(cents % 100)).padStart(2, '0');
  return rest === '00' ? String(whole) : `${whole}.${rest}`;
}

// Formato de moneda del idioma activo ("es" → $1,500.00 como en México, no 1500,00 $ de España).
// Única conversión a número decimal, y solo para mostrar.
const MONEY_LOCALE = { es: 'es-MX', en: 'en-US' };
export function formatMoney(cents, locale, currency = CURRENCY) {
  return new Intl.NumberFormat(MONEY_LOCALE[locale] ?? locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(cents / 100);
}

export function isValidExpense(e) {
  return (
    Boolean(e) &&
    typeof e.id === 'string' && e.id.length > 0 &&
    CATEGORIES.includes(e.category) &&
    Number.isSafeInteger(e.amountCents) &&
    e.amountCents > 0 &&
    e.amountCents <= MAX_CENTS &&
    typeof e.occurredAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(e.occurredAt) &&
    Number.isFinite(new Date(e.occurredAt).getTime()) &&
    new Date(e.occurredAt).toISOString().slice(0, 10) === e.occurredAt.slice(0, 10) &&
    (e.note === undefined || (typeof e.note === 'string' && e.note.length <= 80))
  );
}

// Lo que venga de localStorage (o de otra versión) → estado válido. Lo inválido se descarta, nunca rompe la pantalla.
export function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_STATE, expenses: [] };
  const budgetCents = Number.isSafeInteger(raw.budgetCents) && raw.budgetCents > 0 && raw.budgetCents <= MAX_CENTS ? raw.budgetCents : null;
  const seen = new Set();
  let total = 0;
  const expenses = Array.isArray(raw.expenses) ? raw.expenses.filter((expense) => {
    if (!isValidExpense(expense) || seen.has(expense.id) || !Number.isSafeInteger(total + expense.amountCents)) return false;
    seen.add(expense.id);
    total += expense.amountCents;
    return true;
  }) : [];
  return { budgetCents, currency: CURRENCY, expenses, ...(raw.isDemo === true ? { isDemo: true } : {}) };
}

// Datos de ejemplo para la demo del hackatón: centavos enteros, fechas relativas a `now` y marca `isDemo` explícita.
export function createDemoState(now = new Date()) {
  const hoursAgo = (h) => new Date(now.getTime() - h * 3_600_000).toISOString();
  return {
    budgetCents: 600_000,
    currency: CURRENCY,
    isDemo: true,
    expenses: [
      { id: 'demo-transport-1', category: 'transport', amountCents: 1_200, occurredAt: hoursAgo(1), note: 'Ruta R-1 a Zona Hotelera' },
      { id: 'demo-food-1', category: 'food', amountCents: 38_500, occurredAt: hoursAgo(3), note: 'Comida en Mercado 28' },
      { id: 'demo-activities-1', category: 'activities', amountCents: 9_500, occurredAt: hoursAgo(5), note: 'Entrada Museo Maya' },
      { id: 'demo-food-2', category: 'food', amountCents: 52_000, occurredAt: hoursAgo(26), note: 'Cena en Parque de las Palapas' },
      { id: 'demo-other-1', category: 'other', amountCents: 22_800, occurredAt: hoursAgo(28), note: 'Bloqueador y agua' },
      { id: 'demo-lodging-1', category: 'lodging', amountCents: 280_000, occurredAt: hoursAgo(30), note: 'Hotel centro (2 noches)' },
    ],
  };
}

export function totalSpent(expenses) {
  return expenses.reduce((sum, e) => sum + e.amountCents, 0);
}

// Disponible = presupuesto − gastado. Puede ser negativo: eso es exceso y se muestra, no se oculta.
export function available(budgetCents, expenses) {
  return (budgetCents ?? 0) - totalSpent(expenses);
}

export function overspend(budgetCents, expenses) {
  return Math.max(0, -available(budgetCents, expenses));
}

// Gasto por categoría en el orden fijo de CATEGORIES (el color sigue a la categoría, nunca a su rango).
export function spentByCategory(expenses) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  for (const e of expenses) totals[e.category] += e.amountCents;
  return CATEGORIES.map((category) => ({ category, cents: totals[category] }));
}

// Porcentaje entero que suma exactamente 100 (método del mayor resto), para la leyenda del gráfico.
export function sharePercents(values) {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return values.map(() => 0);
  const raw = values.map((v) => (v * 100) / total);
  const floors = raw.map(Math.floor);
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => [v - floors[i], i]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    if (values[i] > 0) {
      floors[i] += 1;
      left -= 1;
    }
  }
  return floors;
}

// Día local (AAAA-MM-DD) de una fecha ISO en la zona dada (por defecto la del dispositivo).
export function localDay(iso, timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}

// Día local elegido en el formulario ("2026-11-20") → ISO UTC. Hoy conserva la hora actual; otro día, mediodía local
// (lejos de la medianoche, para que el cambio de zona horaria no lo mueva de día).
export function isValidDay(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(`${day}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day;
}

export function dayToIso(day, now = new Date()) {
  if (!isValidDay(day)) return null;
  const [y, m, d] = day.split('-').map(Number);
  const isToday = now.getFullYear() === y && now.getMonth() + 1 === m && now.getDate() === d;
  const date = isToday ? now : new Date(y, m - 1, d, 12, 0, 0);
  return date.toISOString();
}

// Historial agrupado por día local, del más reciente al más antiguo, con el subtotal de cada día.
export function groupByDay(expenses, timeZone) {
  const sorted = [...expenses].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const groups = [];
  for (const e of sorted) {
    const day = localDay(e.occurredAt, timeZone);
    let group = groups.at(-1);
    if (!group || group.day !== day) {
      group = { day, totalCents: 0, expenses: [] };
      groups.push(group);
    }
    group.expenses.push(e);
    group.totalCents += e.amountCents;
  }
  return groups;
}

// CSV para la hoja de cálculo del usuario. Montos en unidades con punto decimal (sin float: sale de los centavos).
export function toCsv(expenses, timeZone) {
  const cell = (v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const rows = [...expenses]
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .map((e) => {
      const cents = String(e.amountCents).padStart(3, '0');
      const amount = `${cents.slice(0, -2)}.${cents.slice(-2)}`;
      // Una celda que empieza por = + - @ se abriría como fórmula en la hoja de cálculo: se neutraliza con un apóstrofo.
      const note = (e.note ?? '').replace(/^[=+\-@]/, "'$&");
      return [localDay(e.occurredAt, timeZone), e.occurredAt, e.category, amount, CURRENCY, note].map(cell).join(',');
    });
  return ['date,occurred_at,category,amount,currency,note', ...rows].join('\n');
}
