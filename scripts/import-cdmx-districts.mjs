#!/usr/bin/env node
/**
 * Regenera el fixture apps/api/src/modules/discovery/data/cdmx.alcaldias.geojson
 * desde el servicio vectorial del Marco Geoestadístico (INEGI) para la entidad 09 (CDMX).
 * Licencia verificada: CC-BY-4.0-ESP en datos.cdmx.gob.mx/dataset/alcaldias
 *
 * Uso: node scripts/import-cdmx-districts.mjs
 * Requiere red. El repo versiona el JSON resultante; CI y tests no llaman a la red.
 */
import { writeFile } from 'node:fs/promises';

const SOURCE_URL = 'https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgem/09';
const OUT = new URL('../apps/api/src/modules/discovery/data/cdmx.alcaldias.geojson', import.meta.url);

function bboxOfCoords(coords, acc = [Infinity, Infinity, -Infinity, -Infinity]) {
  for (const c of coords) {
    if (typeof c[0] === 'number') {
      acc[0] = Math.min(acc[0], c[0]);
      acc[1] = Math.min(acc[1], c[1]);
      acc[2] = Math.max(acc[2], c[0]);
      acc[3] = Math.max(acc[3], c[1]);
    } else bboxOfCoords(c, acc);
  }
  return acc;
}

function roundGeom(g, d = 5) {
  const round = (n) => Math.round(n * 10 ** d) / 10 ** d;
  const walk = (coords) => (typeof coords[0] === 'number' ? [round(coords[0]), round(coords[1])] : coords.map(walk));
  return { type: g.type, coordinates: walk(g.coordinates) };
}

const raw = await fetch(SOURCE_URL).then((r) => {
  if (!r.ok) throw new Error(`INEGI ${r.status}`);
  return r.json();
});

const features = raw.features.map((f) => {
  const geometry = roundGeom(f.geometry, 5);
  return {
    type: 'Feature',
    properties: {
      externalId: f.properties.cvegeo,
      name: f.properties.nomgeo,
      kind: 'ALCALDIA',
      bbox: bboxOfCoords(f.geometry.coordinates),
    },
    geometry,
  };
});

const fc = {
  type: 'FeatureCollection',
  attribution: {
    sourceId: 'cdmx-inegi-alcaldias',
    name: 'Portal de Datos Abiertos CDMX — Límite de Alcaldías (INEGI Marco Geoestadístico 2020)',
    url: 'https://www.datos.cdmx.gob.mx/dataset/alcaldias',
    license: 'CC-BY-4.0-ESP',
    attribution: 'Instituto Nacional de Estadística y Geografía (INEGI)',
    dataStatus: 'REAL',
    retrievedAt: new Date().toISOString(),
    notes: 'Exportado desde gaia.inegi.org.mx/wscatgeo/v2/geo/mgem/09; equivalente al GeoJSON del portal CDMX.',
  },
  features,
};

const json = `${JSON.stringify(fc)}\n`;
if (json.length > 500_000) {
  console.error(`Fixture demasiado grande: ${json.length} bytes (límite 500 kB)`);
  process.exitCode = 1;
}
await writeFile(OUT, json);
console.log(`Escrito ${OUT.pathname} (${json.length} bytes, ${features.length} alcaldías)`);