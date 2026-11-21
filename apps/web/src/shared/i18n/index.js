// Textos de la app: todo texto visible vive en locales/<idioma>.json y se lee con useI18n().t('clave').
// Guía completa: docs/03-design/i18n.md
export { I18nProvider } from './I18nProvider.jsx';
export { LanguageSwitcher } from './LanguageSwitcher.jsx';
export { useI18n } from './I18nContext.js';
export { LOCALES, DEFAULT_LOCALE, translate } from './i18n.js';
