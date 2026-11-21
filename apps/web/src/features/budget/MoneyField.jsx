import { useEffect, useRef } from 'react';
import { useI18n } from '@/shared/i18n';
import { CURRENCY } from './budget.js';

// Campo de monto: "$" delante y la moneda fija (MXN) detrás. Texto libre con teclado decimal (no type="number":
// en móvil no deja escribir la coma y en escritorio cambia el valor con la rueda). El error va asociado al campo.
export function MoneyField({ id, label, value, onChange, error, focusOnMount = false }) {
  const { t } = useI18n();
  const input = useRef(null);
  // Al abrir "Cambiar presupuesto" el campo es lo único que hay que hacer: recibe el foco (no al cargar la página).
  useEffect(() => {
    if (focusOnMount) input.current?.focus();
  }, [focusOnMount]);
  const errorId = `${id}-error`;
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={`flex min-h-12 min-w-0 max-w-full items-center gap-2 rounded-card border bg-sunk px-4 shadow-sunk transition-colors duration-150 focus-within:border-accent ${error ? 'border-danger' : 'border-line'}`}
      >
        <span aria-hidden="true" className="shrink-0 font-mono text-lg text-ink-2">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          ref={input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('budget.amountPlaceholder')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-0 min-w-0 flex-1 bg-transparent py-2.5 font-mono text-lg tabular-nums text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <span className="label shrink-0 text-ink-2">{CURRENCY}</span>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
