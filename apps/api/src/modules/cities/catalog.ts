// Configuración pública por ciudad. Cambiar de ciudad cambia fuentes y capas, no la app.
// Estados de módulo: IMPLEMENTED | DEMO | PLANNED | UNAVAILABLE. IMPLEMENTED solo con datos reales; DEMO = el módulo
// funciona pero con datos simulados e identificados como tales (p. ej. rutas de Cancún, ADR-0008).
export type ModuleStatus = 'IMPLEMENTED' | 'DEMO' | 'PLANNED' | 'UNAVAILABLE';

export type City = {
  id: string;
  name: string;
  countryCode: string;
  timezone: string;
  center: [lon: number, lat: number];
  zoom: number;
  modules: Record<'transit' | 'pois' | 'districts' | 'events' | 'reports' | 'budget', ModuleStatus>;
};

export const cities: readonly City[] = [
  {
    id: 'cancun',
    name: 'Cancún',
    countryCode: 'MX',
    timezone: 'America/Cancun',
    center: [-86.8515, 21.1619],
    zoom: 12,
    modules: {
      transit: 'DEMO', // rutas simuladas (ADR-0008); el adaptador en vivo de Rutas Cancún está desactivado
      pois: 'IMPLEMENTED',
      districts: 'UNAVAILABLE',
      events: 'IMPLEMENTED',
      reports: 'PLANNED',
      budget: 'PLANNED',
    },
  },
  {
    id: 'cdmx',
    name: 'Ciudad de México',
    countryCode: 'MX',
    timezone: 'America/Mexico_City',
    center: [-99.1332, 19.4326],
    zoom: 11,
    modules: { transit: 'IMPLEMENTED', pois: 'PLANNED', districts: 'IMPLEMENTED', events: 'IMPLEMENTED', reports: 'PLANNED', budget: 'PLANNED' },
  },
];

const byId = new Map(cities.map((c) => [c.id, c]));

export function findCity(id: string): City | undefined {
  return byId.get(id);
}
