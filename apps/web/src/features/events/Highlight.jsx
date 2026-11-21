import { highlight } from './search.js';

// Texto con lo que coincide con la búsqueda resaltado en lima (sin búsqueda, el texto tal cual).
export function Highlight({ text, query }) {
  if (!query) return text;
  return highlight(text, query).map((part, i) =>
    part.match ? (
      <mark key={i} className="rounded-[2px] bg-accent/20 text-accent">
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
}
