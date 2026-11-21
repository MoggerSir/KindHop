import { useId, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { CATEGORIES, centsToInput, dayToIso, isValidDay, localDay, parseAmount } from './budget.js';
import { CATEGORY_STYLE } from './categories.js';
import { MoneyField } from './MoneyField.jsx';

const NOTE_MAX = 80;

// Hoja para añadir o editar un gasto: monto, categoría (radios nativos), fecha y nota opcional.
// `draft` es { mode: 'new' } o { mode: 'edit', expense }; null la cierra. Conserva el último borrador mientras sale.
export function ExpenseSheet({ draft: requested, onClose, onSave, onDelete }) {
  const { t } = useI18n();
  const [last, setLast] = useState(requested);
  if (requested && requested !== last) setLast(requested);
  const draft = requested ?? last;
  const editing = draft?.mode === 'edit';

  return (
    <Sheet open={Boolean(requested)} onClose={onClose} title={t(editing ? 'budget.form.editTitle' : 'budget.form.newTitle')}>
      {draft && <ExpenseForm key={editing ? draft.expense.id : draft.key} expense={editing ? draft.expense : null} onSave={onSave} onDelete={onDelete} />}
    </Sheet>
  );
}

function ExpenseForm({ expense, onSave, onDelete }) {
  const { t } = useI18n();
  const id = useId();
  const [amount, setAmount] = useState(centsToInput(expense?.amountCents ?? null));
  const [category, setCategory] = useState(expense?.category ?? null);
  const [day, setDay] = useState(localDay(expense?.occurredAt ?? new Date().toISOString()));
  const [note, setNote] = useState(expense?.note ?? '');
  const [local, setLocal] = useState(expense?.local === true);
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const amountCents = parseAmount(amount);
    const next = {
      amount: amountCents === null ? t('budget.errors.amount') : null,
      category: category ? null : t('budget.errors.category'),
      day: isValidDay(day) ? null : t('budget.errors.date'),
    };
    setErrors(next);
    if (next.amount || next.category || next.day) return;
    // Al editar sin cambiar el día se conserva la hora original; si cambia, se recalcula.
    const occurredAt = expense && localDay(expense.occurredAt) === day ? expense.occurredAt : dayToIso(day);
    const trimmed = note.trim();
    onSave({ amountCents, category, occurredAt, ...(trimmed ? { note: trimmed } : {}), ...(local ? { local: true } : {}) });
  };

  return (
    <form onSubmit={submit} noValidate className="grid min-w-0 gap-5">
      <MoneyField
        id={`${id}-amount`}
        label={t('budget.form.amount')}
        value={amount}
        onChange={(v) => {
          setAmount(v);
          if (errors.amount) setErrors((s) => ({ ...s, amount: null }));
        }}
        error={errors.amount}
      />

      <fieldset className="grid gap-2" aria-describedby={errors.category ? `${id}-category-error` : undefined}>
        <legend className="mb-1.5 text-sm font-medium text-ink">{t('budget.form.category')}</legend>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const { Icon, text } = CATEGORY_STYLE[c];
            const checked = category === c;
            return (
              <label
                key={c}
                className={`flex min-h-11 min-w-0 cursor-pointer items-center gap-2.5 rounded-card border px-3.5 text-sm font-medium transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                  checked ? 'border-accent bg-accent text-on-accent shadow-solid' : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-hover'
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-category`}
                  value={c}
                  checked={checked}
                  onChange={() => {
                    setCategory(c);
                    if (errors.category) setErrors((s) => ({ ...s, category: null }));
                  }}
                  className="sr-only"
                />
                <Icon aria-hidden="true" size={16} strokeWidth={1.5} className={`shrink-0 ${checked ? '' : text}`} />
                <span className="min-w-0 break-words">{t(`budget.categories.${c}`)}</span>
              </label>
            );
          })}
        </div>
        {errors.category && (
          <p id={`${id}-category-error`} role="alert" className="text-sm text-danger">
            {errors.category}
          </p>
        )}
      </fieldset>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-day`} className="text-sm font-medium text-ink">
            {t('budget.form.date')}
          </label>
          <input
            id={`${id}-day`}
            type="date"
            required
            value={day}
            onChange={(e) => setDay(e.target.value)}
            aria-invalid={errors.day ? 'true' : undefined}
            aria-describedby={errors.day ? `${id}-day-error` : undefined}
            className="min-h-12 w-full min-w-0 max-w-full rounded-card border border-line bg-sunk px-4 font-mono text-sm text-ink shadow-sunk transition-colors duration-150 focus:border-accent focus:outline-none"
          />
          {errors.day && (
            <p id={`${id}-day-error`} role="alert" className="text-sm text-danger">
              {errors.day}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-note`} className="text-sm font-medium text-ink">
            {t('budget.form.note')} <span className="font-normal text-ink-2">{t('budget.form.optional')}</span>
          </label>
          <input
            id={`${id}-note`}
            type="text"
            maxLength={NOTE_MAX}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('budget.form.notePlaceholder')}
            className="min-h-12 w-full min-w-0 max-w-full rounded-card border border-line bg-sunk px-4 text-sm text-ink shadow-sunk transition-colors duration-150 placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="flex min-h-12 min-w-0 items-start gap-3 rounded-card border border-line bg-sunk px-4 py-3 shadow-sunk">
        <input
          id={`${id}-local`}
          type="checkbox"
          checked={local}
          onChange={(ev) => setLocal(ev.target.checked)}
          aria-describedby={`${id}-local-hint`}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-accent)]"
        />
        <div className="grid min-w-0 gap-0.5">
          <label htmlFor={`${id}-local`} className="cursor-pointer text-sm font-medium text-ink">
            {t('budget.form.local')}
          </label>
          <p id={`${id}-local-hint`} className="break-words text-xs text-pretty text-ink-2">{t('budget.form.localHint')}</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap gap-2 pt-1">
        <motion.button
          type="submit"
          whileTap={press}
          className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-solid transition-colors duration-150 hover:bg-accent-hover"
        >
          {t(expense ? 'budget.form.saveChanges' : 'budget.form.save')}
        </motion.button>
        {expense && (
          <motion.button
            type="button"
            onClick={() => onDelete(expense)}
            whileTap={press}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium text-danger transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover"
          >
            <Trash2 aria-hidden="true" size={16} strokeWidth={1.5} />
            {t('budget.form.delete')}
          </motion.button>
        )}
      </div>
    </form>
  );
}
