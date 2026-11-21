import { House, Map, Search, Wallet } from 'lucide-react';

// Pestañas de la barra inferior, en orden: Inicio, Explorar, Mapa, Billetera (presupuesto del viaje).
// No hay pestaña de perfil: no hay cuentas en el MVP; el idioma está en Ajustes (botón de la cabecera).
export const TABS = [
  { id: 'home', Icon: House },
  { id: 'explore', Icon: Search },
  { id: 'map', Icon: Map },
  { id: 'budget', Icon: Wallet },
];

export const DEFAULT_TAB = 'home';
