import { listOsmPois } from '../discovery.db.js';

// Cancún lee el snapshot OSM ya importado. No llama a Overpass en cada request.
export function fetchCancunPois(category?: string) {
  return listOsmPois('cancun', category);
}
