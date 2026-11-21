import { BedDouble, Bus, Shapes, Ticket, UtensilsCrossed } from 'lucide-react';

// Icono y color fijos por categoría (el color sigue a la categoría, nunca a su posición). Clases literales para Tailwind.
// Texto: budget.categories.<id> en los JSON de idioma.
export const CATEGORY_STYLE = {
  transport: { Icon: Bus, text: 'text-cat-transport', stroke: 'stroke-cat-transport', bg: 'bg-cat-transport' },
  food: { Icon: UtensilsCrossed, text: 'text-cat-food', stroke: 'stroke-cat-food', bg: 'bg-cat-food' },
  activities: { Icon: Ticket, text: 'text-cat-activities', stroke: 'stroke-cat-activities', bg: 'bg-cat-activities' },
  lodging: { Icon: BedDouble, text: 'text-cat-lodging', stroke: 'stroke-cat-lodging', bg: 'bg-cat-lodging' },
  other: { Icon: Shapes, text: 'text-cat-other', stroke: 'stroke-cat-other', bg: 'bg-cat-other' },
};
