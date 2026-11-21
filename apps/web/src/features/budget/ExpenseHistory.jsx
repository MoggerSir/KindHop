import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { fadeRise, spring } from '@/shared/motion/motion.js';
import { groupByDay, localDay } from './budget.js';
import { CATEGORY_STYLE } from './categories.js';

// Sin hora: un gasto de otro día se guarda a mediodía y mostrar esa hora sería inventarla.
// Historial agrupado por día (subtotal por día del viaje), del más reciente al más antiguo. Tocar un gasto lo edita.
// Al añadir o borrar, la fila entra o sale y las demás se reacomodan (sin escalonar: es una lista que cambia).
export function ExpenseHistory({ expenses, format, onEdit }) {
  const { t, locale } = useI18n();
  const groups = groupByDay(expenses);
  const [{ today, yesterday }] = useState(() => {
    const now = new Date();
    const before = new Date(now);
    before.setDate(now.getDate() - 1);
    return { today: localDay(now.toISOString()), yesterday: localDay(before.toISOString()) };
  });
  const dayFormat = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

  const dayLabel = (day) => (day === today ? t('budget.history.today') : day === yesterday ? t('budget.history.yesterday') : dayFormat.format(new Date(`${day}T00:00:00Z`)));

  return (
    <div className="grid gap-5">
      <AnimatePresence initial={false}>
        {groups.map((group) => (
          <motion.section key={group.day} layout={expenses.length <= 40 ? 'position' : false} transition={spring.layout} aria-label={dayLabel(group.day)} className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3 px-1">
              <h4 className="text-sm font-medium text-ink-2 first-letter:uppercase">
                <time dateTime={group.day}>{dayLabel(group.day)}</time>
              </h4>
              <span className="font-mono text-xs tabular-nums text-ink-2">{t('budget.history.dayTotal', { amount: format(group.totalCents) })}</span>
            </div>
            <ul className="overflow-hidden rounded-card border border-line bg-surface shadow-raised">
              <AnimatePresence initial={false} mode="popLayout">
                {group.expenses.map((e) => {
                  const { Icon, text } = CATEGORY_STYLE[e.category];
                  const category = t(`budget.categories.${e.category}`);
                  return (
                    <motion.li key={e.id} layout={expenses.length <= 40 ? 'position' : false} variants={fadeRise} initial="hidden" animate="visible" exit="exit" className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        onClick={() => onEdit(e)}
                        aria-label={t('budget.history.edit', { name: e.note ?? category, amount: format(e.amountCents) })}
                        className="flex min-h-16 w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-surface-hover focus-visible:-outline-offset-2"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk">
                          <Icon aria-hidden="true" size={18} strokeWidth={1.5} className={text} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{e.note ?? category}</span>
                          {e.note && <span className="block truncate text-xs text-ink-2">{category}</span>}
                        </span>
                        <span className="font-mono text-sm tabular-nums text-ink">{format(e.amountCents)}</span>
                        <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-ink-3" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </motion.section>
        ))}
      </AnimatePresence>
    </div>
  );
}
