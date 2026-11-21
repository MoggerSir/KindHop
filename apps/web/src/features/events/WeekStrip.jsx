import { useI18n } from '@/shared/i18n';
import { nextDays } from './dates.js';

// Tira de los próximos 7 días (en la zona de la ciudad), centrada; si no cabe (≤ 360 px) se desplaza en horizontal.
// Radios nativos: flechas del teclado y lector de pantalla gratis.
export function WeekStrip({ timeZone, value, onChange }) {
  const { t, locale } = useI18n();
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const dayNumber = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' });
  const fullDate = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

  return (
    <fieldset className="-mx-4 min-w-0 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none]">
      <legend className="sr-only">{t('home.daysLabel')}</legend>
      <div className="mx-auto flex w-max gap-1.5">
        {nextDays(7, timeZone).map(({ key, date }) => (
          <label
            key={key}
            className="flex min-h-13 w-11 cursor-pointer flex-col items-center justify-center rounded-2xl bg-surface text-ink-2 shadow-[0_1px_2px_oklch(0.25_0.03_200/0.08)] ring-1 ring-line transition-colors duration-150 has-[:checked]:bg-accent has-[:checked]:text-accent-ink has-[:checked]:ring-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
          >
            <input type="radio" name="event-day" value={key} checked={value === key} onChange={() => onChange(key)} className="sr-only" aria-label={fullDate.format(date)} />
            <span aria-hidden="true" className="text-[11px] leading-none font-medium capitalize">
              {weekday.format(date).replace('.', '')}
            </span>
            <span aria-hidden="true" className="mt-1 text-base leading-none font-bold tabular-nums">
              {dayNumber.format(date)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
