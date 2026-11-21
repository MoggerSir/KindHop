import { House, Map, Search, Wallet } from 'lucide-react';

// Pestañas de la barra inferior, en orden. Texto en nav.<id> de los JSON de idiomas.
// Añadir pestaña = una entrada aquí + su pantalla en app/screens/ + la clave nav.<id> en es.json y en.json.
export const TABS = [
  { id: 'home', Icon: House },
  { id: 'explore', Icon: Search },
  { id: 'map', Icon: Map },
  { id: 'budget', Icon: Wallet },
];

export const DEFAULT_TAB = 'home';
