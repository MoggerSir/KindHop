import { AppError } from '../../shared/errors.js';
import { getPool } from '../../shared/db.js';

export type ReportKind = 'FLOOD' | 'PUDDLE';
export type ReportStatus = 'UNVERIFIED' | 'CONFIRMED' | 'RESOLVED' | 'REJECTED';
export type ReportDataStatus = 'DEMO' | 'USER_REPORTED';

export type UrbanReport = {
  id: string;
  kind: ReportKind;
  coordinates: [number, number];
  description?: string;
  status: ReportStatus;
  dataStatus: ReportDataStatus;
  confirmCount: number;
  createdAt: string;
  expiresAt: string;
  moderatedAt?: string;
  moderationNote?: string;
};

type ReportRow = {
  id: string;
  kind: ReportKind;
  lat: number;
  lon: number;
  description: string | null;
  status: ReportStatus;
  data_status: ReportDataStatus;
  confirm_count: number;
  created_at: Date;
  expires_at: Date;
  moderated_at: Date | null;
  moderation_note: string | null;
};

const COLUMNS = `id::text AS id, kind, lat, lon, description, status, data_status, confirm_count,
  created_at, expires_at, moderated_at, moderation_note`;

function toUrbanReport(row: ReportRow): UrbanReport {
  const report: UrbanReport = {
    id: row.id,
    kind: row.kind,
    coordinates: [Number(row.lon), Number(row.lat)],
    status: row.status,
    dataStatus: row.data_status,
    confirmCount: Number(row.confirm_count),
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
  };
  if (row.description) report.description = row.description;
  if (row.moderated_at) report.moderatedAt = new Date(row.moderated_at).toISOString();
  if (row.moderation_note) report.moderationNote = row.moderation_note;
  return report;
}

async function query(sql: string, params: unknown[]): Promise<ReportRow[]> {
  try {
    const { rows } = await getPool().query<ReportRow>(sql, params);
    return rows;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === '23514' || code === '22003' || code === '22P02') {
      throw new AppError(400, 'VALIDATION', 'Datos de incidencia inválidos');
    }
    if (code === '23503') throw new AppError(404, 'CITY_NOT_FOUND', 'Ciudad no disponible');
    throw err;
  }
}

export async function listActiveReports(cityId: string): Promise<UrbanReport[]> {
  const rows = await query(
    `SELECT ${COLUMNS} FROM urban_reports
     WHERE city_id = $1 AND expires_at > now()
     ORDER BY created_at DESC, id DESC`,
    [cityId],
  );
  return rows.map(toUrbanReport);
}

export async function createReport(input: {
  cityId: string;
  lat: number;
  lon: number;
  kind: ReportKind;
  description: string | null;
}): Promise<UrbanReport> {
  const rows = await query(
    `INSERT INTO urban_reports (city_id, lat, lon, kind, description, status, data_status, expires_at)
     VALUES ($1, $2, $3, $4, $5, 'UNVERIFIED', 'USER_REPORTED', now() + interval '6 hours')
     RETURNING ${COLUMNS}`,
    [input.cityId, input.lat, input.lon, input.kind, input.description],
  );
  return toUrbanReport(rows[0]!);
}

// Solo incidencias aún vigentes. Caducada o de otra ciudad: no incrementa y no revela si existió.
export async function confirmReport(cityId: string, id: string): Promise<UrbanReport | undefined> {
  const rows = await query(
    `UPDATE urban_reports
     SET confirm_count = confirm_count + 1
     WHERE id = $1::bigint AND city_id = $2 AND expires_at > now()
     RETURNING ${COLUMNS}`,
    [id, cityId],
  );
  return rows[0] ? toUrbanReport(rows[0]) : undefined;
}

// La moderación también alcanza incidencias ya caducadas: el listado público sigue ocultándolas.
export async function moderateReport(
  cityId: string,
  id: string,
  status: ReportStatus,
  moderationNote: string | null,
): Promise<UrbanReport | undefined> {
  const rows = await query(
    `UPDATE urban_reports
     SET status = $3, moderated_at = now(), moderation_note = $4
     WHERE id = $1::bigint AND city_id = $2
     RETURNING ${COLUMNS}`,
    [id, cityId, status, moderationNote],
  );
  return rows[0] ? toUrbanReport(rows[0]) : undefined;
}
