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

// Título y lugar plegados una vez por lista: escribir en el buscador no vuelve a normalizar acentos en cada tecla.
const preparedEvents = new WeakMap();
function prepareEvents(events) {
  let rows = preparedEvents.get(events);
  if (rows) return rows;
  rows = events.map((event) => ({
    event,
    title: fold(event.title),
    venue: fold(event.venue ?? ''),
    end: Date.parse(event.endsAt ?? event.startsAt),
    start: Date.parse(event.startsAt),
  }));
  preparedEvents.set(events, rows);
  return rows;
}

// `categoryLabel(id)` da el nombre visible de la categoría en el idioma actual (también se busca por él).
// Orden: coincidencia al inicio del título, luego en el título, luego en lugar o categoría; a igualdad, por fecha.
export function searchEvents(events, { query = '', category = null, when = 'all', timeZone, categoryLabel = () => '', now = new Date() }) {
  const today = dayKey(now, timeZone);
  const weekEnd = nextDays(7, timeZone, now)[6].key;
  const words = terms(query);

  return prepareEvents(events)
    .filter((row) => row.end > now.getTime())
    .filter((row) => !category || row.event.category === category)
    .filter((row) => {
      if (when === 'all') return true;
      const day = dayKey(new Date(row.event.startsAt), timeZone);
      return when === 'today' ? day === today : day <= weekEnd;
    })
    .map((row) => {
      const rest = `${row.venue} ${fold(categoryLabel(row.event.category))}`;
      let score = 0;
      for (const w of words) {
        if (row.title.startsWith(w) || row.title.includes(` ${w}`)) score += 3;
        else if (row.title.includes(w)) score += 2;
        else if (rest.includes(w)) score += 1;
        else return null;
      }
      return { event: row.event, score, start: row.start };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.start - b.start)
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
