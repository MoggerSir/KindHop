import { useCallback, useEffect, useMemo, useState } from 'react';
import { I18nContext } from './I18nContext.js';
import { LOCALES, detectLocale, hasKey, saveLocale, translate } from './i18n.js';

// Envuelve la app una vez (main.jsx). Cambiar de idioma re-renderiza todo con el JSON nuevo, sin recargar.
export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale);

  const setLocale = useCallback((next) => {
    if (!LOCALES.includes(next)) return;
    saveLocale(next);
    setLocaleState(next);
  }, []);

  // <html lang>, <title> y meta description también salen del JSON (lectores de pantalla y pestaña del navegador).
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, 'meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate(locale, 'meta.description'));
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      locales: LOCALES,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      has: (key) => hasKey(locale, key),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
