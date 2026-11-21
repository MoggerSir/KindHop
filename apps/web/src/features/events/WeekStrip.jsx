import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { spring } from '@/shared/motion/motion.js';
import { nextDays } from './dates.js';

// Próximos 7 días (en la zona de la ciudad) como pista hundida; la ficha en relieve se desliza al día elegido
// (layoutId, resorte sin rebote). Centrada; si no cabe (≤ 360 px) se desplaza en horizontal.
// Radios nativos: teclado y lector de pantalla gratis.
export function WeekStrip({ timeZone, value, onChange }) {
  const { t, locale } = useI18n();
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const dayNumber = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' });
  const fullDate = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

  return (
    <fieldset className="-mx-4 min-w-0 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none]">
      <legend className="sr-only">{t('home.daysLabel')}</legend>
      <div className="mx-auto flex w-max gap-0.5 rounded-sheet bg-sunk p-1 shadow-sunk">
        {nextDays(7, timeZone).map(({ key, date }) => {
          const selected = value === key;
          return (
            <label
              key={key}
              className={`relative flex min-h-12 w-11 short:min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-control transition-colors duration-150 has-[:focus-visible]:outline-[1.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink has-[:focus-visible]:outline-solid ${selected ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}
            >
              {selected && <motion.span layoutId="week-thumb" transition={spring.snappy} aria-hidden="true" className="absolute inset-0 rounded-control bg-surface shadow-embossed" />}
              <input type="radio" name="event-day" value={key} checked={selected} onChange={() => onChange(key)} className="sr-only" aria-label={fullDate.format(date)} />
              <span aria-hidden="true" className="label relative !tracking-[0.08em]">
                {weekday.format(date).replace('.', '')}
              </span>
              <span aria-hidden="true" className="relative font-mono text-[0.9375rem] leading-none tabular-nums">
                {dayNumber.format(date)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
