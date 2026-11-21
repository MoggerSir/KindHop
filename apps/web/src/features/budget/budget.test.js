import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  available,
  CATEGORIES,
  centsToInput,
  createDemoState,
  groupByDay,
  dayToIso,
  isValidDay,
  normalizeState,
  overspend,
  parseAmount,
  sharePercents,
  spentByCategory,
  toCsv,
  totalSpent,
} from './budget.js';

const TZ = 'America/Cancun'; // UTC-5 todo el año
const expense = (id, category, amountCents, occurredAt, note) => ({ id, category, amountCents, occurredAt, ...(note ? { note } : {}) });

describe('parseAmount: texto → centavos enteros', () => {
  it('"12.50" → 1250 y variantes válidas', () => {
    assert.equal(parseAmount('12.50'), 1250);
    assert.equal(parseAmount('12.5'), 1250);
    assert.equal(parseAmount('12'), 1200);
    assert.equal(parseAmount(' $1,500 '), 150000);
    assert.equal(parseAmount('1,500.75'), 150075);
    assert.equal(parseAmount('12,50'), 1250);
    assert.equal(parseAmount('0.01'), 1);
    assert.equal(parseAmount('0.29'), 29); // con float daría 28.999999999999996
  });

  it('rechaza negativos, cero, no numéricos y más de dos decimales', () => {
    for (const bad of ['-5', '0', '0.00', 'abc', '', '12.505', '1e3', '12..5', '1,50,0', null, undefined, 'NaN', 'Infinity', '99999999999']) {
      assert.equal(parseAmount(bad), null, `"${bad}" debería rechazarse`);
    }
  });

  it('centsToInput hace el camino inverso sin float', () => {
    assert.equal(centsToInput(1250), '12.50');
    assert.equal(centsToInput(150000), '1500');
    assert.equal(centsToInput(5), '0.05');
  });
});

describe('sumas, disponible y exceso', () => {
  const expenses = [expense('a', 'food', 1250, '2026-11-20T18:00:00Z'), expense('b', 'transport', 3000, '2026-11-20T19:00:00Z'), expense('c', 'food', 750, '2026-11-21T15:00:00Z')];

  it('suma y disponible', () => {
    assert.equal(totalSpent(expenses), 5000);
    assert.equal(available(10000, expenses), 5000);
    assert.equal(overspend(10000, expenses), 0);
  });

  it('el exceso se calcula, no se oculta', () => {
    assert.equal(available(4000, expenses), -1000);
    assert.equal(overspend(4000, expenses), 1000);
  });

  it('gasto por categoría en orden fijo', () => {
    assert.deepEqual(spentByCategory(expenses), [
      { category: 'transport', cents: 3000 },
      { category: 'food', cents: 2000 },
      { category: 'activities', cents: 0 },
      { category: 'lodging', cents: 0 },
      { category: 'other', cents: 0 },
    ]);
  });

  it('los porcentajes de la leyenda suman 100', () => {
    assert.deepEqual(sharePercents([1, 1, 1, 0]), [34, 33, 33, 0]);
    assert.deepEqual(sharePercents([0, 0]), [0, 0]);
  });
});

describe('estado guardado', () => {
  it('descarta lo inválido de localStorage sin romper', () => {
    const state = normalizeState({
      budgetCents: 12.5,
      expenses: [expense('ok', 'food', 100, '2026-11-20T18:00:00Z'), expense('neg', 'food', -100, '2026-11-20T18:00:00Z'), expense('cat', 'casino', 100, '2026-11-20T18:00:00Z'), { id: 'x' }],
    });
    assert.equal(state.budgetCents, null);
    assert.deepEqual(state.expenses.map((e) => e.id), ['ok']);
    assert.deepEqual(normalizeState('basura'), { budgetCents: null, currency: 'MXN', expenses: [] });
  });
});

describe('historial y CSV', () => {
  const expenses = [expense('a', 'food', 1250, '2026-11-21T02:00:00Z'), expense('b', 'other', 500, '2026-11-21T16:00:00Z', 'Agua, "fría"'), expense('c', 'transport', 1300, '2026-11-20T15:00:00Z', '=HYPERLINK()')];

  it('agrupa por día local de la ciudad, más reciente primero, con subtotal', () => {
    const groups = groupByDay(expenses, TZ);
    assert.deepEqual(groups.map((g) => [g.day, g.totalCents]), [['2026-11-21', 500], ['2026-11-20', 2550]]);
  });

  it('CSV con montos exactos, comillas escapadas y sin fórmulas', () => {
    const lines = toCsv(expenses, TZ).split('\n');
    assert.equal(lines[0], 'date,occurred_at,category,amount,currency,note');
    assert.equal(lines[1], "2026-11-20,2026-11-20T15:00:00Z,transport,13.00,MXN,'=HYPERLINK()");
    assert.equal(lines[3], '2026-11-21,2026-11-21T16:00:00Z,other,5.00,MXN,"Agua, ""fría"""');
  });
});


it('rechaza días imposibles e ids repetidos en datos guardados', () => {
  assert.equal(isValidDay('2026-02-30'), false);
  assert.equal(dayToIso('2026-02-30'), null);
  assert.equal(isValidDay('2028-02-29'), true);
  const valid = expense('same', 'food', 100, '2026-11-20T18:00:00Z');
  assert.equal(normalizeState({ expenses: [valid, valid, { ...valid, id: 'date', occurredAt: 'tomorrow' }] }).expenses.length, 1);
});

it('createDemoState genera presupuesto y gastos DEMO válidos en las cinco categorías', () => {
  const demo = normalizeState(createDemoState(new Date('2026-11-20T23:00:00Z')));
  assert.equal(demo.isDemo, true);
  assert.equal(demo.budgetCents, 600_000);
  assert.equal(demo.expenses.length, 6);
  assert.ok(available(demo.budgetCents, demo.expenses) > 0);
  assert.deepEqual(new Set(demo.expenses.map((e) => e.category)), new Set(CATEGORIES));
});
