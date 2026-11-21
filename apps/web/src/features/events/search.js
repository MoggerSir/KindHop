import { dayKey, nextDays } from './dates.js';

// Búsqueda de eventos en el cliente (la API ya devuelve la lista de la ciudad): texto + categoría + cuándo.
// Sin acentos ni mayúsculas ("palapas" encuentra "Palapas", "musica" encuentra "Música").

export const WHEN = ['all', 'today', 'week'];

// Pasa cada carácter a minúsculas sin acentos, carácter a carácter, para que los índices sigan valiendo para resaltar.
function fold(text) {
  return Array.from(String(text ?? ''), (c) => {
    const f = c.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    return f.length === 1 ? f : c;
  }).join('');
}

const terms = (query) => fold(query).split(/\s+/).filter(Boolean);

// `categoryLabel(id)` da el nombre visible de la categoría en el idioma actual (también se busca por él).
// Orden: coincidencia al inicio del título, luego en el título, luego en lugar o categoría; a igualdad, por fecha.
export function searchEvents(events, { query = '', category = null, when = 'all', timeZone, categoryLabel = () => '', now = new Date() }) {
  const today = dayKey(now, timeZone);
  const weekEnd = nextDays(7, timeZone, now)[6].key;
  const words = terms(query);

  return events
    .filter((e) => Date.parse(e.endsAt ?? e.startsAt) > now.getTime())
    .filter((e) => !category || e.category === category)
    .filter((e) => {
      if (when === 'all') return true;
      const day = dayKey(new Date(e.startsAt), timeZone);
      return when === 'today' ? day === today : day <= weekEnd;
    })
    .map((e) => {
      const title = fold(e.title);
      const rest = fold(`${e.venue ?? ''} ${categoryLabel(e.category)}`);
      let score = 0;
      for (const w of words) {
        if (title.startsWith(w) || title.includes(` ${w}`)) score += 3;
        else if (title.includes(w)) score += 2;
        else if (rest.includes(w)) score += 1;
        else return null;
      }
      return { event: e, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || Date.parse(a.event.startsAt) - Date.parse(b.event.startsAt))
    .map((r) => r.event);
}

// Trozos de `text` marcando lo que coincide con la búsqueda: [{ text, match }].
export function highlight(text, query) {
  const source = String(text ?? '');
  const folded = fold(source);
  const marks = new Array(source.length).fill(false);
  for (const w of terms(query)) {
    for (let i = folded.indexOf(w); i !== -1; i = folded.indexOf(w, i + 1)) marks.fill(true, i, i + w.length);
  }
  const parts = [];
  for (let i = 0; i < source.length; i++) {
    const last = parts.at(-1);
    if (last && last.match === marks[i]) last.text += source[i];
    else parts.push({ text: source[i], match: marks[i] });
  }
  return parts;
}

// Sugerencias para "Prueba con…": lugares distintos de los próximos eventos (dato real de la lista, nada inventado).
export function suggestions(events, limit = 3) {
  return [...new Set(events.map((e) => e.venue).filter(Boolean))].slice(0, limit);
}
