import { lazy } from 'react';

// Cada pestaña es su propio chunk. MapLibre (y su CSS) solo viajan con Mapa; la Billetera y Explorar no entran en Inicio.
// Las pantallas exportan una función con nombre. lazy() solo acepta `default`, así que se adapta aquí.
const asDefault = (load, name) => () => load().then((mod) => ({ default: mod[name] }));
const loaders = {
  home: asDefault(() => import('./screens/HomeScreen.jsx'), 'HomeScreen'),
  explore: asDefault(() => import('./screens/ExploreScreen.jsx'), 'ExploreScreen'),
  map: asDefault(() => import('./screens/MapScreen.jsx'), 'MapScreen'),
  budget: asDefault(() => import('./screens/BudgetScreen.jsx'), 'BudgetScreen'),
};

export const HomeScreen = lazy(loaders.home);
export const ExploreScreen = lazy(loaders.explore);
export const MapScreen = lazy(loaders.map);
export const BudgetScreen = lazy(loaders.budget);

export function preloadScreen(tab) {
  (loaders[tab] ?? loaders.home)();
}

// En cuanto se evalúa el entry, empieza a bajar la pestaña de la URL (en paralelo con la sesión).
preloadScreen(new URLSearchParams(window.location.search).get('tab'));
