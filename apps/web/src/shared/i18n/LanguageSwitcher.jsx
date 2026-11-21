import { useI18n } from './I18nContext.js';

// Selector segmentado de idioma (radios nativos, como CitySwitcher). Muestra el código corto y anuncia el nombre completo.
export function LanguageSwitcher() {
  const { t, locale, locales, setLocale } = useI18n();
  return (
    <fieldset className="flex rounded-lg bg-paper p-1 ring-1 ring-line">
      <legend className="sr-only">{t('language.label')}</legend>
      {locales.map((code) => (
        <label
          key={code}
          lang={code}
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md px-2.5 text-xs font-semibold text-ink-2 transition-colors duration-150 has-[:checked]:bg-surface has-[:checked]:text-ink has-[:checked]:shadow-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
        >
          <input type="radio" name="locale" value={code} checked={locale === code} onChange={() => setLocale(code)} className="sr-only" aria-label={t(`language.names.${code}`)} />
          <span aria-hidden="true">{t(`language.short.${code}`)}</span>
        </label>
      ))}
    </fieldset>
  );
}
