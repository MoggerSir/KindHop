import { CalendarRange } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { spring } from '@/shared/motion/motion.js';
import { nextDays } from './dates.js';

// Próximos 7 días (en la zona de la ciudad) como pista hundida; la ficha lima se desliza al día elegido
// (layoutId, resorte sin rebote). Radios nativos: teclado y lector de pantalla gratis.
// `allLabel`: añade delante la opción "todos los días" (valor null), para que el filtro no esconda eventos por defecto.
// `counts`: { 'YYYY-MM-DD': n } marca con un punto los días que tienen eventos y lo dice en el nombre accesible.
// Cabe sin scroll desde 375 px (8 × 44 px); más estrecho, se desplaza dentro de la pista, nunca la página.
export function WeekStrip({ timeZone, value, onChange, allLabel, counts, days = 12, name = 'event-day', className = '-mx-4 px-4' }) {
  const { t, locale } = useI18n();
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const dayNumber = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' });
  const fullDate = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const options = [
    ...(allLabel ? [{ key: null, label: allLabel }] : []),
    ...nextDays(days, timeZone).map(({ key, date }) => ({ key, date })),
  ];

  return (
    <fieldset className={`min-w-0 overflow-x-auto overscroll-x-contain snap-x [scrollbar-width:none] ${className}`}>
      <legend className="sr-only">{t('home.daysLabel')}</legend>
      <div className="flex w-max min-w-full gap-0.5 rounded-sheet bg-sunk p-0.5 shadow-sunk">
        {options.map(({ key, date, label }) => {
          const selected = value === key;
          const count = key && counts ? counts[key] ?? 0 : null;
          const name_ = label ?? fullDate.format(date);
          return (
            <label
              key={key ?? 'all'}
              className={`relative flex min-h-12 min-w-13 shrink-0 snap-start short:min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-sheet px-2 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-solid ${selected ? 'text-on-accent' : 'text-ink-2 hover:text-ink'}`}
            >
              {selected && <motion.span layoutId={`${name}-thumb`} transition={spring.snappy} aria-hidden="true" className="absolute inset-0 rounded-sheet bg-accent shadow-solid" />}
              <input
                type="radio"
                name={name}
                checked={selected}
                onChange={() => onChange(key)}
                className="sr-only"
                aria-label={count === null ? name_ : t('events.dayCount', { date: name_, count })}
              />
              {label ? (
                <>
                  <span aria-hidden="true" className="label relative">
                    {label}
                  </span>
                  <CalendarRange aria-hidden="true" size={15} strokeWidth={1.5} className="relative" />
                </>
              ) : (
                <>
                  <span aria-hidden="true" className="label relative">
                    {weekday.format(date).replace('.', '')}
                  </span>
                  <span aria-hidden="true" className="relative font-mono text-[0.9375rem] leading-none tabular-nums">
                    {dayNumber.format(date)}
                  </span>
                </>
              )}
              {count > 0 && (
                <span aria-hidden="true" className={`absolute bottom-1 size-1 rounded-full ${selected ? 'bg-on-accent' : 'bg-ink-2'}`} />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
