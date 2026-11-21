const fold = (value) => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// Nombre plegado por idioma, una vez por lugar: el buscador no re-normaliza cientos de fichas en cada tecla.
const foldedNames = new WeakMap();
function foldedPlace(poi, locale) {
  let byLocale = foldedNames.get(poi);
  if (!byLocale) {
    byLocale = new Map();
    foldedNames.set(poi, byLocale);
  }
  let text = byLocale.get(locale);
  if (text === undefined) {
    text = fold(`${poi.name} ${poiName(poi, locale)}`);
    byLocale.set(locale, text);
  }
  return text;
}

export function poiName(poi, locale) {
  return poi.i18n?.[locale]?.name || poi.name;
}

// El filtro temporal solo pertenece a eventos: un lugar no tiene fecha de inicio.
export function searchPois(pois, { query = '', category = null, locale = 'es', categoryLabel = () => '' } = {}) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!category && words.length === 0) return pois;
  return pois.filter((poi) => {
    if (category && poi.category !== category) return false;
    if (words.length === 0) return true;
    const text = `${foldedPlace(poi, locale)} ${fold(categoryLabel(poi.category))}`;
    return words.every((word) => text.includes(word));
  });
}
