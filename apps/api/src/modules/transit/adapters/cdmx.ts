import { listCdmxTransit } from '../transit.db.js';

// La fuente de CDMX es el snapshot en PostgreSQL, no una consulta en vivo al portal.
export function fetchCdmxRoutes() {
  return listCdmxTransit();
}
