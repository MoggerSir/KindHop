import { AppError } from './errors.js';

// Un módulo con fuentes distintas por ciudad declara sus adaptadores en un objeto literal:
//   const adapters: CityAdapters<FetchRoutes> = { cancun: fetchCancunRoutes, cdmx: fetchCdmxRoutes };
// Una ciudad sin adaptador responde 404 MODULE_UNAVAILABLE (dato ausente honesto), nunca datos inventados.
export type CityAdapters<T> = Readonly<Partial<Record<string, T>>>;

export function pickAdapter<T>(adapters: CityAdapters<T>, cityId: string, moduleName: string): T {
  const adapter = Object.hasOwn(adapters, cityId) ? adapters[cityId] : undefined;
  if (!adapter) throw new AppError(404, 'MODULE_UNAVAILABLE', `${moduleName} no está disponible en esta ciudad`);
  return adapter;
}
