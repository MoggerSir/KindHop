// Puestos pagados (KH-021): los eventos con `sponsoredRank` 1-3 van primero en "Recomendados por nosotros", en orden de
// puesto (el 1 ocupa el mosaico grande); el resto conserva su orden. Siempre se muestran con "Patrocinado · #n".
export function sponsoredFirst(events) {
  const sponsored = events.filter((e) => e.sponsoredRank).sort((a, b) => a.sponsoredRank - b.sponsoredRank);
  return [...sponsored, ...events.filter((e) => !e.sponsoredRank)];
}
