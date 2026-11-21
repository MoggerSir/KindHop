import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { centsToInput, parseAmount } from './budget.js';
import { MoneyField } from './MoneyField.jsx';

// Fijar o cambiar el presupuesto del viaje. Valida al enviar (no a cada tecla) y el error dice cómo corregirlo.
export function BudgetForm({ initialCents = null, submitLabel, onSave, onCancel, focusOnMount = false }) {
  const { t } = useI18n();
  const id = useId();
  const [value, setValue] = useState(centsToInput(initialCents));
  const [error, setError] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const cents = parseAmount(value);
    if (cents === null) return setError(t('budget.errors.amount'));
    onSave(cents);
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-3">
      <MoneyField
        id={`${id}-budget`}
        label={t('budget.budgetLabel')}
        value={value}
        onChange={(v) => {
          setValue(v);
          if (error) setError(null);
        }}
        error={error}
        focusOnMount={focusOnMount}
      />
      <div className="flex flex-wrap gap-2">
        <motion.button
          type="submit"
          whileTap={press}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-solid transition-colors duration-150 hover:bg-accent-hover"
        >
          {submitLabel}
        </motion.button>
        {onCancel && (
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={press}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover"
          >
            {t('budget.cancel')}
          </motion.button>
        )}
      </div>
    </form>
  );
}
