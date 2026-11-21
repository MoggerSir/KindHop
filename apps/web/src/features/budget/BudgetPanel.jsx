import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Info, Pencil, Plus, ReceiptText, Smartphone, TriangleAlert, Wallet } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { expand, fadeOnly, fadeRise, press, stagger } from '@/shared/motion/motion.js';
import { AnimatedAmount } from './AnimatedAmount.jsx';
import { available, formatMoney, localDay, spentByCategory, toCsv, totalSpent } from './budget.js';
import { BudgetForm } from './BudgetForm.jsx';
import { ExpenseHistory } from './ExpenseHistory.jsx';
import { ExpenseSheet } from './ExpenseSheet.jsx';
import { SpendingChart } from './SpendingChart.jsx';
import { useBudget } from './useBudget.js';

const UNDO_MS = 6000;

// Billetera: presupuesto del viaje local-first (solo este navegador, sin cuenta, sin servidor, sin datos bancarios).
// Sin presupuesto: tarjeta que guía el primer uso. Con presupuesto: disponible (o exceso, nunca oculto), gráfico por
// categoría, historial por día editable y borrable con "Deshacer", y exportación CSV. Especificación: docs/02-modules/budget.md
export function BudgetPanel() {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const budget = useBudget();
  const { budgetCents, expenses } = budget;
  const [draft, setDraft] = useState(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [undo, setUndo] = useState(null);
  const [announce, setAnnounce] = useState('');
  const draftKey = useRef(0);

  const format = useCallback((cents) => formatMoney(Math.abs(cents), locale), [locale]);
  const spent = totalSpent(expenses);
  const left = available(budgetCents, expenses);
  const over = left < 0;

  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undo]);

  const openNew = () => setDraft({ mode: 'new', key: ++draftKey.current });

  const save = (data) => {
    if (draft?.mode === 'edit') budget.updateExpense(draft.expense.id, data);
    else budget.addExpense(data);
    const nextLeft = left + (draft?.mode === 'edit' ? draft.expense.amountCents : 0) - data.amountCents;
    setAnnounce(t(nextLeft < 0 ? 'budget.announce.savedOver' : 'budget.announce.saved', { amount: format(nextLeft) }));
    setDraft(null);
  };

  const remove = (expense) => {
    budget.removeExpense(expense.id);
    setDraft(null);
    setUndo(expense);
  };

  const exportCsv = () => {
    // BOM para que Excel abra el UTF-8 (acentos de las notas) sin pedir codificación.
    const blob = new Blob(['﻿', toCsv(expenses)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: `kindhop-gastos-${localDay(new Date().toISOString())}.csv` });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-4 pt-4 [&>*]:min-w-0">
      <motion.header variants={fadeRise} className="grid gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-ink">{t('screens.budget.title')}</h2>
        <p className="flex items-center gap-1.5 text-sm text-ink-2">
          <Smartphone aria-hidden="true" size={14} strokeWidth={1.5} className="shrink-0 text-ink-3" />
          {t('budget.localOnly')}
        </p>
      </motion.header>

      {budget.isDemo && (
        <motion.div variants={fadeRise} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-sunk px-3 py-2 shadow-sunk">
          <div className="flex min-w-0 items-center gap-2 text-xs text-ink-2">
            <DataStatusBadge status="DEMO" />
            <span>{t('budget.demoNotice')}</span>
          </div>
          <motion.button
            type="button"
            onClick={() => {
              budget.clearBudget();
              setEditingBudget(false);
              setUndo(null);
            }}
            whileTap={press}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-surface px-3.5 text-xs font-medium text-ink transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover"
          >
            {t('budget.clearDemo')}
          </motion.button>
        </motion.div>
      )}

      {!budget.persistent && (
        <motion.p variants={fadeRise} role="status" className="flex items-start gap-2.5 rounded-control border border-line bg-sunk p-3 text-sm text-ink shadow-sunk">
          <Info aria-hidden="true" size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
          {t('budget.notPersistent')}
        </motion.p>
      )}

      {budgetCents === null ? (
        <motion.section variants={fadeRise} aria-labelledby="budget-setup-title" className="grid gap-5 rounded-card border border-line bg-surface p-5 shadow-raised">
          <div className="grid gap-2">
            <span className="grid size-11 place-items-center rounded-control bg-sunk shadow-sunk">
              <Wallet aria-hidden="true" size={20} strokeWidth={1.5} className="text-accent" />
            </span>
            <h3 id="budget-setup-title" className="title mt-1 text-lg font-semibold text-balance text-ink">
              {t('budget.setup.title')}
            </h3>
            <p className="max-w-[48ch] text-sm text-pretty text-ink-2">{t('budget.setup.body')}</p>
          </div>
          <BudgetForm submitLabel={t('budget.setup.submit')} onSave={budget.setBudget} />
        </motion.section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <motion.section variants={fadeRise} aria-labelledby="budget-left-title" className="grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-raised">
              <div className="flex items-start justify-between gap-3">
                <div className="grid min-w-0 gap-1">
                  <h3 id="budget-left-title" className={`flex items-center gap-1.5 text-sm font-medium ${over ? 'text-danger' : 'text-ink-2'}`}>
                    {over && <TriangleAlert aria-hidden="true" size={15} strokeWidth={1.5} className="shrink-0" />}
                    {t(over ? 'budget.summary.over' : 'budget.summary.available')}
                  </h3>
                  <p className={`font-mono text-3xl break-words font-medium tracking-tight tabular-nums ${over ? 'text-danger' : 'text-ink'}`}>
                    <AnimatedAmount cents={left} format={format} />
                  </p>
                  <p className="text-sm text-ink-2">
                    {t('budget.summary.spentOf', { spent: format(spent), budget: format(budgetCents) })}
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setEditingBudget((v) => !v)}
                  aria-expanded={editingBudget}
                  aria-label={t('budget.summary.editBudget')}
                  whileTap={press}
                  className={`-mt-1.5 -mr-1.5 grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-150 ${editingBudget ? 'bg-tint text-ink' : 'text-ink-2 hover:bg-tint hover:text-ink'}`}
                >
                  <Pencil aria-hidden="true" size={17} strokeWidth={1.5} />
                </motion.button>
              </div>

              <AnimatePresence initial={false}>
                {editingBudget && (
                  <motion.div key="edit" variants={reduce ? fadeOnly : expand} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
                    <div className="border-t border-line pt-4">
                      <BudgetForm
                        initialCents={budgetCents}
                        submitLabel={t('budget.summary.saveBudget')}
                        focusOnMount
                        onSave={(cents) => {
                          budget.setBudget(cents);
                          setEditingBudget(false);
                        }}
                        onCancel={() => setEditingBudget(false)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={openNew}
                whileTap={press}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-solid transition-colors duration-150 hover:bg-accent-hover"
              >
                <Plus aria-hidden="true" size={18} strokeWidth={1.5} />
                {t('budget.addExpense')}
              </motion.button>
            </motion.section>

            <motion.section variants={fadeRise} aria-labelledby="budget-chart-title" className="grid content-start gap-4 rounded-card border border-line bg-surface p-5 shadow-raised">
              <h3 id="budget-chart-title" className="title text-base font-semibold text-ink">
                {t('budget.chart.title')}
              </h3>
              {expenses.length > 0 ? (
                <SpendingChart byCategory={spentByCategory(expenses)} budgetCents={budgetCents} spentCents={spent} format={format} />
              ) : (
                <p className="text-sm text-pretty text-ink-2">{t('budget.chart.empty')}</p>
              )}
            </motion.section>
          </div>

          <motion.section variants={fadeRise} aria-labelledby="budget-history-title" className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 id="budget-history-title" className="title text-base font-semibold text-ink">
                {t('budget.history.title')}
              </h3>
              {expenses.length > 0 && (
                <motion.button
                  type="button"
                  onClick={exportCsv}
                  whileTap={press}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover"
                >
                  <Download aria-hidden="true" size={16} strokeWidth={1.5} />
                  {t('budget.history.export')}
                </motion.button>
              )}
            </div>
            {expenses.length > 0 ? (
              <ExpenseHistory expenses={expenses} format={format} onEdit={(expense) => setDraft({ mode: 'edit', expense })} />
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface/40 px-6 py-8 text-center shadow-sunk">
                <ReceiptText aria-hidden="true" size={24} strokeWidth={1.5} className="text-ink-3" />
                <p className="max-w-[36ch] text-sm text-pretty text-ink-2">{t('budget.history.empty')}</p>
              </div>
            )}
          </motion.section>
        </>
      )}

      <ExpenseSheet draft={draft} onClose={() => setDraft(null)} onSave={save} onDelete={remove} />

      <p role="status" className="sr-only">
        {announce}
      </p>

      <div role="status" className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
        <AnimatePresence>
          {undo && (
            <motion.div
              key={undo.id}
              variants={fadeRise}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-card border border-line-strong bg-surface py-1.5 pr-1.5 pl-4 shadow-floating"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{t('budget.undo.deleted', { amount: format(undo.amountCents) })}</span>
              <motion.button
                type="button"
                onClick={() => {
                  budget.restoreExpense(undo);
                  setUndo(null);
                }}
                whileTap={press}
                className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-accent transition-colors duration-150 hover:bg-tint"
              >
                {t('budget.undo.action')}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
