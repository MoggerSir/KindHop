import { motion } from 'motion/react';
import { spring } from '@/shared/motion/motion.js';
import { useI18n } from './I18nContext.js';

// Selector de idioma: pista hundida con una ficha en relieve que se desliza (radios nativos).
// Muestra el código y anuncia el nombre completo.
export function LanguageSwitcher() {
  const { t, locale, locales, setLocale } = useI18n();
  return (
    <fieldset className="flex gap-1 rounded-full border border-line bg-sunk p-1">
      <legend className="sr-only">{t('language.label')}</legend>
      {locales.map((code) => {
        const selected = locale === code;
        return (
          <label
            key={code}
            lang={code}
            className={`relative flex min-h-11 min-w-12 cursor-pointer items-center justify-center rounded-full text-xs font-semibold transition-colors duration-150 has-[:focus-visible]:outline-[1.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-solid ${
              selected ? 'text-on-accent' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {selected && (
              <motion.span
                layoutId="locale-thumb"
                transition={spring.snappy}
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-accent shadow-solid"
              />
            )}
            <input
              type="radio"
              name="locale"
              value={code}
              checked={selected}
              onChange={() => setLocale(code)}
              className="sr-only"
              aria-label={t(`language.names.${code}`)}
            />
            <span aria-hidden="true" className="relative">
              {t(`language.short.${code}`)}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
