const fold = (value) => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function poiName(poi, locale) {
  return poi.i18n?.[locale]?.name || poi.name;
}

// El filtro temporal solo pertenece a eventos: un lugar no tiene fecha de inicio.
export function searchPois(pois, { query = '', category = null, locale = 'es', categoryLabel = () => '' } = {}) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  return pois.filter((poi) => {
    if (category && poi.category !== category) return false;
    const text = fold(`${poi.name} ${poiName(poi, locale)} ${categoryLabel(poi.category)}`);
    return words.every((word) => text.includes(word));
  });
}
