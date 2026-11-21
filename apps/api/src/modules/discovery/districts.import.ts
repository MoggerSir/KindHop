import { readFile } from 'node:fs/promises';
import type pg from 'pg';
import { bboxFromGeometry, pointInDistrictGeometry, type DistrictGeometry } from './geo.js';

type FixtureAttribution = {
  sourceId: string;
  name: string;
  url: string;
  license: string;
  attribution: string;
  dataStatus: 'REAL' | 'DEMO' | 'USER_REPORTED' | 'UNVERIFIED';
  retrievedAt: string;
  notes?: string;
};

type FixtureFeature = {
  type: 'Feature';
  properties: {
    externalId: string;
    name: string;
    kind: 'ALCALDIA' | 'SUPERMANZANA' | 'COLONIA' | 'OTHER';
    bbox: number[];
  };
  geometry: DistrictGeometry;
};

type DistrictFixture = {
  type: 'FeatureCollection';
  attribution: FixtureAttribution;
  features: FixtureFeature[];
};

const CDMX_FIXTURE = new URL('./data/cdmx.alcaldias.geojson', import.meta.url);

async function readFixture(path: URL): Promise<DistrictFixture> {
  const raw = JSON.parse(await readFile(path, 'utf8')) as DistrictFixture;
  if (raw.type !== 'FeatureCollection' || !raw.attribution?.sourceId || !Array.isArray(raw.features)) {
    throw new Error(`Fixture de distritos inválido: ${path.pathname}`);
  }
  return raw;
}

async function upsertSource(client: pg.PoolClient, attr: FixtureAttribution): Promise<void> {
  await client.query(
    `INSERT INTO data_sources (id, name, url, license, attribution, data_status, retrieved_at, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, url = EXCLUDED.url, license = EXCLUDED.license,
       attribution = EXCLUDED.attribution, data_status = EXCLUDED.data_status,
       retrieved_at = EXCLUDED.retrieved_at, notes = EXCLUDED.notes`,
    [
      attr.sourceId,
      attr.name,
      attr.url,
      attr.license,
      attr.attribution,
      attr.dataStatus,
      attr.retrievedAt,
      attr.notes ?? null,
    ],
  );
}

async function upsertDistricts(
  client: pg.PoolClient,
  cityId: string,
  sourceId: string,
  features: FixtureFeature[],
): Promise<void> {
  for (const feature of features) {
    const { externalId, name, kind } = feature.properties;
    const geometry = feature.geometry;
    const bbox = feature.properties.bbox?.length === 4 ? feature.properties.bbox : bboxFromGeometry(geometry);
    await client.query(
      `INSERT INTO districts (city_id, source_id, external_id, name, kind, geometry, bbox)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::double precision[])
       ON CONFLICT (source_id, external_id) DO UPDATE SET
         city_id = EXCLUDED.city_id,
         name = EXCLUDED.name,
         kind = EXCLUDED.kind,
         geometry = EXCLUDED.geometry,
         bbox = EXCLUDED.bbox`,
      [cityId, sourceId, externalId, name, kind, JSON.stringify(geometry), bbox],
    );
  }
}

export async function assignPlaceDistrictsForCity(client: pg.PoolClient, cityId: string): Promise<number> {
  const { rows: places } = await client.query<{ id: number; lon: number; lat: number }>(
    `SELECT id, lon, lat FROM places WHERE city_id = $1`,
    [cityId],
  );
  const { rows: districts } = await client.query<{
    id: number;
    bbox: number[] | null;
    geometry: DistrictGeometry;
  }>(`SELECT id, bbox, geometry FROM districts WHERE city_id = $1`, [cityId]);

  let updated = 0;
  for (const place of places) {
    const lon = place.lon;
    const lat = place.lat;
    let match: number | null = null;
    for (const district of districts) {
      if (district.bbox && district.bbox.length === 4) {
        const [minLon, minLat, maxLon, maxLat] = district.bbox;
        if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) continue;
      }
      if (pointInDistrictGeometry(lon, lat, district.geometry)) {
        match = district.id;
        break;
      }
    }
    if (match !== null) {
      await client.query(`UPDATE places SET district_id = $2 WHERE id = $1 AND (district_id IS DISTINCT FROM $2)`, [
        place.id,
        match,
      ]);
      updated += 1;
    }
  }
  return updated;
}

/** Idempotente: fuente CDMX verificada (CC-BY) y polígonos desde fixture versionado (<500 kB). */
export async function importDistrictFixtures(client: pg.PoolClient): Promise<void> {
  const cdmx = await readFixture(CDMX_FIXTURE);
  await upsertSource(client, cdmx.attribution);
  await upsertDistricts(client, 'cdmx', cdmx.attribution.sourceId, cdmx.features);
  await assignPlaceDistrictsForCity(client, 'cdmx');
}