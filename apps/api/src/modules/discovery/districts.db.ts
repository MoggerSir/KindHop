import { getPool } from '../../shared/db.js';
import type { DistrictGeometry } from './geo.js';

export type DistrictSource = {
  name: string;
  url: string;
  license: string;
  attribution?: string;
  retrievedAt: string;
  dataStatus: 'REAL' | 'DEMO' | 'USER_REPORTED' | 'UNVERIFIED';
};

export type DistrictFeatureProperties = {
  id: string;
  name: string;
  kind: 'SUPERMANZANA' | 'ALCALDIA' | 'COLONIA' | 'OTHER';
  externalId?: string;
};

export type DistrictFeatureCollection = {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    properties: DistrictFeatureProperties;
    geometry: DistrictGeometry;
  }[];
  source: DistrictSource;
};

type DistrictRow = {
  id: number;
  external_id: string | null;
  name: string;
  kind: DistrictFeatureProperties['kind'];
  geometry: DistrictGeometry;
  source_name: string;
  source_url: string | null;
  source_license: string;
  source_attribution: string | null;
  source_status: DistrictSource['dataStatus'];
  retrieved_at: Date | null;
};

export async function listDistrictFeatures(cityId: string): Promise<DistrictFeatureCollection> {
  const { rows } = await getPool().query<DistrictRow>(
    `SELECT d.id, d.external_id, d.name, d.kind, d.geometry,
            s.name AS source_name, s.url AS source_url, s.license AS source_license,
            s.attribution AS source_attribution, s.data_status AS source_status, s.retrieved_at
     FROM districts d
     JOIN data_sources s ON s.id = d.source_id
     WHERE d.city_id = $1
     ORDER BY d.name`,
    [cityId],
  );
  if (rows.length === 0) {
    throw new Error(`Sin distritos en BD para ${cityId}`);
  }
  const head = rows[0]!;
  const source: DistrictSource = {
    name: head.source_name,
    url: head.source_url ?? '',
    license: head.source_license,
    ...(head.source_attribution ? { attribution: head.source_attribution } : {}),
    retrievedAt: (head.retrieved_at ?? new Date(0)).toISOString(),
    dataStatus: head.source_status,
  };
  return {
    type: 'FeatureCollection',
    source,
    features: rows.map((row) => ({
      type: 'Feature' as const,
      properties: {
        id: String(row.id),
        name: row.name,
        kind: row.kind,
        ...(row.external_id ? { externalId: row.external_id } : {}),
      },
      geometry: row.geometry,
    })),
  };
}