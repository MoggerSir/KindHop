// Cálculos del mapa sin dependencias: distancias, agrupación de eventos por lugar y GeoJSON de las capas.
// Coordenadas siempre [lon, lat] (contrato). Nada de aquí inventa una posición: lo que no trae coordenadas no se pinta.

export function validCoordinates(value) {
  return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) && Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 90;
}

export function geometryBounds(geometry) {
  const points = [];
  const visit = (value) => { if (validCoordinates(value)) points.push(value); else if (Array.isArray(value)) value.forEach(visit); };
  visit(geometry?.coordinates);
  if (!points.length) return null;
  return points.reduce((bounds, [lon, lat]) => [[Math.min(bounds[0][0], lon), Math.min(bounds[0][1], lat)], [Math.max(bounds[1][0], lon), Math.max(bounds[1][1], lat)]], [[Infinity, Infinity], [-Infinity, -Infinity]]);
}

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg) => (deg * Math.PI) / 180;

// Distancia en metros entre dos puntos [lon, lat] (haversine).
export function distanceMeters([lon1, lat1], [lon2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(Math.min(1, a)));
}

// "350 m" o "1.2 km" con el formato numérico del idioma (en español de México, punto decimal).
export function formatDistance(meters, locale) {
  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10;
    return new Intl.NumberFormat(locale, { style: 'unit', unit: 'meter', maximumFractionDigits: 0 }).format(rounded);
  }
  const km = meters / 1000;
  return new Intl.NumberFormat(locale, { style: 'unit', unit: 'kilometer', maximumFractionDigits: km < 10 ? 1 : 0 }).format(km);
}

// Eventos con lugar en la BD, agrupados por lugar: un pin por sitio aunque haya varios eventos (Las Palapas).
// Los eventos sin `place` no entran: se listan en la hoja sin pin.
export function groupEventsByPlace(events) {
  const groups = new Map();
  for (const event of events) {
    const place = event.place;
    if (!place || !validCoordinates(place.coordinates)) continue;
    const group = groups.get(place.id) ?? { place, events: [] };
    group.events.push(event);
    groups.set(place.id, group);
  }
  return [...groups.values()];
}

// Eventos que caen el día `key` ('YYYY-MM-DD' en la zona de la ciudad); `null` = todos los próximos.
export function eventsOnDay(events, key, dayKeyOf) {
  if (!key) return events;
  return events.filter((e) => dayKeyOf(e.startsAt) === key);
}

export function poisToGeoJson(pois) {
  return {
    type: 'FeatureCollection',
    features: pois.filter((poi) => validCoordinates(poi.coordinates)).map((poi) => ({
      type: 'Feature',
      properties: { id: poi.id },
      geometry: { type: 'Point', coordinates: poi.coordinates },
    })),
  };
}

export function routesToGeoJson(routes) {
  return {
    type: 'FeatureCollection',
    features: routes.map((route) => ({ type: 'Feature', properties: { id: route.id, color: route.color ?? null }, geometry: route.geometry })),
  };
}

// Conserva las paradas publicadas y su ruta; no crea paradas para catálogos sin ellas.
export function stopsToGeoJson(routes) {
  return {
    type: 'FeatureCollection',
    features: routes.flatMap((route) => (route.stops ?? []).filter((stop) => validCoordinates(stop.coordinates)).map((stop) => ({
      type: 'Feature', properties: { id: stop.id, routeId: route.id, name: stop.name, color: route.color ?? null },
      geometry: { type: 'Point', coordinates: stop.coordinates },
    }))),
  };
}
