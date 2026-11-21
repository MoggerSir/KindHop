import es from './locales/es.json';
import en from './locales/en.json';

// Catálogo de idiomas. Añadir uno = crear locales/<código>.json con las mismas claves que es.json
// (npm run check lo verifica) y registrarlo aquí. El primero es el idioma por defecto y la referencia.
export const MESSAGES = { es, en };
export const LOCALES = Object.keys(MESSAGES);
export const DEFAULT_LOCALE = 'es';

const STORAGE_KEY = 'kindhop.locale';

function lookup(messages, key) {
  return key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), messages);
}

// Texto de `key` ('cities.layersTitle') en `locale`, sustituyendo {variables}.
// Si falta en ese idioma usa el idioma por defecto; si falta en todos devuelve la clave (visible para detectarlo).
export function translate(locale, key, vars) {
  const text = lookup(MESSAGES[locale], key) ?? lookup(MESSAGES[DEFAULT_LOCALE], key);
  if (typeof text !== 'string') {
    if (import.meta.env?.DEV) console.warn(`[i18n] falta la clave "${key}"`);
    return key;
  }
  return vars ? text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match)) : text;
}

export function hasKey(locale, key) {
  return typeof lookup(MESSAGES[locale], key) === 'string';
}

// Idioma inicial: el elegido antes por el usuario, si no el del navegador, si no el por defecto.
export function detectLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LOCALES.includes(saved)) return saved;
  } catch {
    // Almacenamiento bloqueado (modo privado): seguimos sin recordar el idioma.
  }
  const browser = (navigator.language ?? '').slice(0, 2).toLowerCase();
  return LOCALES.includes(browser) ? browser : DEFAULT_LOCALE;
}

export function saveLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Igual que arriba: no recordar no rompe nada.
  }
}
