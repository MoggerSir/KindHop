import { Bike, Drama, Landmark, Moon, Music, Palette, ShoppingBag, Store, Trees, Users, UtensilsCrossed, Waves } from 'lucide-react';

// Categorías de exploración. Texto en discovery.categories.<id> de los JSON de idiomas.
// PRIMARY: siempre visibles en Inicio. MORE: aparecen al expandir "Ver todo". Añadir una = entrada aquí + clave en es.json y en.json.
export const PRIMARY_CATEGORIES = [
  { id: 'music', Icon: Music },
  { id: 'art', Icon: Palette },
  { id: 'food', Icon: UtensilsCrossed },
  { id: 'culture', Icon: Drama },
];

export const MORE_CATEGORIES = [
  { id: 'beaches', Icon: Waves },
  { id: 'nightlife', Icon: Moon },
  { id: 'markets', Icon: Store },
  { id: 'parks', Icon: Trees },
  { id: 'museums', Icon: Landmark },
  { id: 'shopping', Icon: ShoppingBag },
  { id: 'sports', Icon: Bike },
  { id: 'family', Icon: Users },
];

export const CATEGORIES = [...PRIMARY_CATEGORIES, ...MORE_CATEGORIES];
