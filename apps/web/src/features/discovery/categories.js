import { Ellipsis, Landmark, Music, Palette, UtensilsCrossed } from 'lucide-react';

// Categorías de exploración. Texto en discovery.categories.<id> de los JSON de idiomas.
// 'more' no es una categoría: abre Explorar sin filtro.
export const CATEGORIES = [
  { id: 'music', Icon: Music },
  { id: 'art', Icon: Palette },
  { id: 'food', Icon: UtensilsCrossed },
  { id: 'culture', Icon: Landmark },
  { id: 'more', Icon: Ellipsis },
];
