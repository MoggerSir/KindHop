import { Router } from 'express';
import type { Request } from 'express';
import { z } from 'zod';
import { requireCity } from '../cities/index.js';
import { AppError } from '../../shared/errors.js';
import { confirmReport, createReport, listActiveReports, moderateReport } from './reports.db.js';
import {
  assertDatabaseConfigured,
  assertReportWriteAllowed,
  assertReportsAdmin,
  parseReportId,
  roundTo3,
} from './reports.js';

const createSchema = z.object({
  kind: z.enum(['FLOOD', 'PUDDLE']),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  description: z.string().trim().max(500).optional(),
});

const moderateSchema = z.object({
  status: z.enum(['UNVERIFIED', 'CONFIRMED', 'RESOLVED', 'REJECTED']),
  moderationNote: z.string().trim().max(280).optional(),
});

function invalid(): never {
  throw new AppError(400, 'VALIDATION', 'Datos de incidencia inválidos');
}

function clientAddress(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

// cityId llega del montaje `/api/cities/:cityId/reports` (mergeParams); el tipo de esta ruta no lo incluye.
function cityParam(req: Request): unknown {
  return (req.params as { cityId?: unknown }).cityId;
}

export const reportsRouter = Router({ mergeParams: true });

reportsRouter.get('/', async (req, res) => {
  const city = requireCity(cityParam(req));
  assertDatabaseConfigured();
  res.json({ reports: await listActiveReports(city.id) });
});

reportsRouter.post('/', async (req, res) => {
  const city = requireCity(cityParam(req));
  assertDatabaseConfigured();
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) invalid();
  const lat = roundTo3(parsed.data.lat);
  const lon = roundTo3(parsed.data.lon);
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) invalid();
  assertReportWriteAllowed(clientAddress(req));
  const report = await createReport({
    cityId: city.id,
    lat,
    lon,
    kind: parsed.data.kind,
    description: parsed.data.description || null,
  });
  res.status(201).json({ report });
});

reportsRouter.post('/:id/confirm', async (req, res) => {
  const city = requireCity(cityParam(req));
  assertDatabaseConfigured();
  const id = parseReportId(req.params.id);
  assertReportWriteAllowed(clientAddress(req));
  const report = await confirmReport(city.id, id);
  if (!report) throw new AppError(404, 'REPORT_NOT_FOUND', 'Incidencia no encontrada o caducada');
  res.json({ report });
});

reportsRouter.patch('/:id', async (req, res) => {
  const city = requireCity(cityParam(req));
  assertDatabaseConfigured();
  assertReportsAdmin(req.get('authorization'));
  const id = parseReportId(req.params.id);
  const parsed = moderateSchema.safeParse(req.body);
  if (!parsed.success) invalid();
  const report = await moderateReport(city.id, id, parsed.data.status, parsed.data.moderationNote || null);
  if (!report) throw new AppError(404, 'REPORT_NOT_FOUND', 'Incidencia no encontrada');
  res.json({ report });
});
