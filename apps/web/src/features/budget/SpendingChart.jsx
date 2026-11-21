import { motion, useReducedMotion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { fadeOnly } from '@/shared/motion/motion.js';
import { sharePercents } from './budget.js';
import { CATEGORY_STYLE } from './categories.js';

const R = 52;
const STROKE = 12;
const C = 2 * Math.PI * R;
const GAP = 2; // separación de superficie entre segmentos (dataviz)

// Anillo del presupuesto: la vuelta completa es el presupuesto; cada categoría ocupa lo que gastó y el resto
// (pista tenue) es lo disponible. Si hay exceso, la vuelta pasa a ser el total gastado y el centro lo dice.
// El SVG es decorativo para lectores: la leyenda (lista con montos y %) es la alternativa textual completa.
// Se dibuja al entrar (el momento focal de la pantalla) y se reacomoda al cambiar un gasto; sin trazo con movimiento reducido.
export function SpendingChart({ byCategory, budgetCents, spentCents, format }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const over = spentCents > budgetCents;
  const ring = Math.max(budgetCents, spentCents) || 1;
  const usedPercent = budgetCents > 0 ? Math.round((spentCents * 100) / budgetCents) : 0;
  const present = byCategory.filter((c) => c.cents > 0);
  const percents = sharePercents(present.map((c) => c.cents));
  const transition = fadeOnly.visible.transition;

  const gap = present.length > 1 || !over ? GAP : 0; // un único segmento que cierra la vuelta no lleva hueco
  const segments = present.reduce((list, { category, cents }) => {
    const start = list.length ? list.at(-1).start + list.at(-1).full : 0;
    const full = (cents / ring) * C;
    return [...list, { category, start, full, offset: -start, length: Math.max(0, full - gap) }];
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 128 128" aria-hidden="true" className="size-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" strokeWidth={STROKE} className="stroke-line-strong" />
          {segments.map(({ category, offset, length }) => (
            <motion.circle
              key={category}
              cx="64"
              cy="64"
              r={R}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="butt"
              className={CATEGORY_STYLE[category].stroke}
              strokeDasharray={`${length} ${C}`}
              strokeDashoffset={offset}
              initial={{ opacity: reduce ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={transition}
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className={`max-w-28 break-words font-mono text-lg font-medium tabular-nums ${over ? 'text-danger' : 'text-ink'}`}>{t('budget.chart.percent', { value: usedPercent })}</span>
          <span className="text-xs text-ink-2">{t(over ? 'budget.chart.over' : 'budget.chart.used')}</span>
        </div>
      </div>

      <ul className="grid min-w-[11rem] flex-1 gap-2.5" aria-label={t('budget.chart.legend')}>
        {present.map(({ category, cents }, i) => {
          const { Icon, text } = CATEGORY_STYLE[category];
          return (
            <li key={category} className="flex items-center gap-2.5">
              <Icon aria-hidden="true" size={16} strokeWidth={1.5} className={`shrink-0 ${text}`} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{t(`budget.categories.${category}`)}</span>
              <span className="font-mono text-sm tabular-nums text-ink">{format(cents)}</span>
              <span className="w-10 text-right font-mono text-xs tabular-nums text-ink-2">{t('budget.chart.percent', { value: percents[i] })}</span>
            </li>
          );
        })}
        {!over && (
          <li className="flex items-center gap-2.5 border-t border-line pt-2.5">
            <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center">
              <span className="size-2 rounded-full bg-line-strong" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{t('budget.chart.left')}</span>
            <span className="font-mono text-sm tabular-nums text-ink-2">{format(budgetCents - spentCents)}</span>
            <span className="w-10" />
          </li>
        )}
      </ul>
    </div>
  );
}
