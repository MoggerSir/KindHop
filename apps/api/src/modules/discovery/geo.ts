// Geometría sin PostGIS: bbox y punto-en-polígono (ray casting) para asignar places.district_id.

export type LonLat = readonly [lon: number, lat: number];

export type GeoPolygon = { type: 'Polygon'; coordinates: number[][][] };
export type GeoMultiPolygon = { type: 'MultiPolygon'; coordinates: number[][][][] };
export type DistrictGeometry = GeoPolygon | GeoMultiPolygon;

export function bboxFromGeometry(geometry: DistrictGeometry): [number, number, number, number] {
  const acc: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  const rings =
    geometry.type === 'Polygon'
      ? [geometry.coordinates[0]]
      : geometry.coordinates.map((poly) => poly[0]);
  for (const ring of rings) {
    if (!ring) continue;
    for (const [lon, lat] of ring) {
      acc[0] = Math.min(acc[0], lon);
      acc[1] = Math.min(acc[1], lat);
      acc[2] = Math.max(acc[2], lon);
      acc[3] = Math.max(acc[3], lat);
    }
  }
  return acc;
}

function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0]!;
    const yi = ring[i]![1]!;
    const xj = ring[j]![0]!;
    const yj = ring[j]![1]!;
    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInDistrictGeometry(lon: number, lat: number, geometry: DistrictGeometry): boolean {
  if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0];
    return ring ? pointInRing(lon, lat, ring) : false;
  }
  return geometry.coordinates.some((poly) => {
    const ring = poly[0];
    return ring ? pointInRing(lon, lat, ring) : false;
  });
}

export function pointInBbox(lon: number, lat: number, bbox: number[]): boolean {
  if (bbox.length !== 4) return true;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
}