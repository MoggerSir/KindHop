import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import '../../shared/env.js';
import { createApp } from '../../app.js';
import { closePool, getPool } from '../../shared/db.js';
import { AppError } from '../../shared/errors.js';
import {
  REPORT_WRITE_LIMIT,
  REPORT_WRITE_WINDOW_MS,
  assertReportWriteAllowed,
  resetReportRateLimits,
  roundTo3,
} from './reports.js';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const skip = !process.env.DATABASE_URL && 'sin DATABASE_URL';

describe('redondeo y límite en memoria', { concurrency: 1 }, () => {
  beforeEach(() => resetReportRateLimits());

  it('redondea lat/lon a 3 decimales alejándose de cero en el empate', () => {
    assert.equal(roundTo3(21.16194), 21.162);
    assert.equal(roundTo3(-86.82651), -86.827);
    assert.equal(roundTo3(21.1614), 21.161);
    assert.equal(roundTo3(-86.8264), -86.826);
    assert.equal(roundTo3(21.1615), 21.162);
    assert.equal(roundTo3(-86.8265), -86.827);
    assert.equal(roundTo3(10.9995), 11);
    assert.equal(roundTo3(0), 0);
  });

  it('al pasar el cupo responde RATE_LIMITED y otra IP sigue pudiendo escribir', () => {
    const start = 1_700_000_000_000;
    for (let i = 0; i < REPORT_WRITE_LIMIT; i += 1) assertReportWriteAllowed('203.0.113.8', start);
    assert.throws(
      () => assertReportWriteAllowed('203.0.113.8', start + 1_000),
      (err: unknown) => err instanceof AppError && err.status === 429 && err.code === 'RATE_LIMITED',
    );
    assertReportWriteAllowed('203.0.113.9', start);
    assertReportWriteAllowed('203.0.113.8', start + REPORT_WRITE_WINDOW_MS);
  });
});

describe('API de incidencias', { skip, concurrency: 1 }, () => {
  let server: Server;
  let base: string;
  const created: string[] = [];
  const previousToken = process.env.REPORTS_ADMIN_TOKEN;

  before(async () => {
    process.env.REPORTS_ADMIN_TOKEN = 'test-admin-token';
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(() => resetReportRateLimits());

  after(async () => {
    if (previousToken === undefined) delete process.env.REPORTS_ADMIN_TOKEN;
    else process.env.REPORTS_ADMIN_TOKEN = previousToken;
    if (created.length > 0) {
      await getPool().query('DELETE FROM urban_reports WHERE id = ANY($1::bigint[])', [created]);
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    await closePool();
  });

  async function api(path: string, init?: RequestInit): Promise<{ status: number; body: Record<string, unknown> }> {
    const res = await fetch(`${base}${path}`, init);
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
  }

  function post(cityId: string, payload: unknown, headers?: Record<string, string>) {
    return api(`/api/cities/${cityId}/reports`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
  }

  it('los 3 reportes DEMO del seed aparecen con su etiqueta', async () => {
    const cancun = await api('/api/cities/cancun/reports');
    const cdmx = await api('/api/cities/cdmx/reports');
    assert.equal(cancun.status, 200);
    assert.equal(cdmx.status, 200);
    const reports = [
      ...(cancun.body.reports as { city?: string; description?: string; dataStatus: string; kind: string; status: string; confirmCount: number; coordinates: number[] }[]),
      ...(cdmx.body.reports as { description?: string; dataStatus: string; kind: string; status: string; confirmCount: number; coordinates: number[] }[]),
    ].filter((report) => report.dataStatus === 'DEMO');

    const byDescription = new Map(reports.map((report) => [report.description, report]));
    assert.equal(byDescription.size, 3);

    const puddle = byDescription.get('Encharcamiento junto al parque (ejemplo)');
    assert.equal(puddle?.kind, 'PUDDLE');
    assert.equal(puddle?.status, 'UNVERIFIED');
    assert.equal(puddle?.dataStatus, 'DEMO');
    assert.equal(puddle?.confirmCount, 0);
    assert.deepEqual(puddle?.coordinates.map((n) => n.toFixed(3)), ['-86.827', '21.161']);

    const flood = byDescription.get('Calle inundada tras la lluvia (ejemplo)');
    assert.equal(flood?.kind, 'FLOOD');
    assert.equal(flood?.status, 'CONFIRMED');
    assert.equal(flood?.dataStatus, 'DEMO');
    assert.equal(flood?.confirmCount, 3);
    assert.deepEqual(flood?.coordinates.map((n) => n.toFixed(3)), ['-86.840', '21.155']);

    const cdmxPuddle = byDescription.get('Charco grande en el cruce (ejemplo)');
    assert.equal(cdmxPuddle?.kind, 'PUDDLE');
    assert.equal(cdmxPuddle?.status, 'UNVERIFIED');
    assert.equal(cdmxPuddle?.dataStatus, 'DEMO');
    assert.deepEqual(cdmxPuddle?.coordinates.map((n) => n.toFixed(3)), ['-99.133', '19.433']);

    assert.equal((cancun.body.reports as { dataStatus: string }[]).filter((r) => r.dataStatus === 'DEMO').length, 2);
    assert.equal((cdmx.body.reports as { dataStatus: string }[]).filter((r) => r.dataStatus === 'DEMO').length, 1);

    const columns = await getPool().query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'urban_reports'
         AND column_name ~ '(^|_)ip($|_)'`,
    );
    assert.deepEqual(columns.rows, [], 'la tabla no guarda la IP');
  });

  it('una entrada inválida responde 400 VALIDATION y no guarda nada', async () => {
    const beforeCount = await countUserReports();
    const cases = [
      {},
      { kind: 'RAIN', lat: 21.16, lon: -86.82 },
      { kind: 'FLOOD', lat: 91, lon: -86.82 },
      { kind: 'FLOOD', lat: 21.16, lon: -86.82, description: 'x'.repeat(501) },
      { kind: 'puddle', lat: 21.16, lon: -86.82 },
    ];
    for (const payload of cases) {
      const { status, body } = await post('cancun', payload);
      assert.equal(status, 400);
      assert.equal((body.error as { code: string }).code, 'VALIDATION');
    }
    assert.equal(await countUserReports(), beforeCount);
  });

  it('un reporte se crea UNVERIFIED, redondeado, y desaparece al caducar', async () => {
    const { status, body } = await post('cancun', {
      kind: 'PUDDLE',
      lat: 21.16194,
      lon: -86.82651,
      description: '  charco de prueba  ',
    });
    assert.equal(status, 201);
    const report = body.report as {
      id: string;
      status: string;
      dataStatus: string;
      description?: string;
      coordinates: number[];
      confirmCount: number;
      createdAt: string;
      expiresAt: string;
      moderatedAt?: string;
    };
    created.push(report.id);
    assert.equal(typeof report.id, 'string');
    assert.equal(report.status, 'UNVERIFIED');
    assert.equal(report.dataStatus, 'USER_REPORTED');
    assert.equal(report.description, 'charco de prueba');
    assert.equal(report.confirmCount, 0);
    assert.equal(report.moderatedAt, undefined);
    assert.deepEqual(report.coordinates, [-86.827, 21.162]);
    const life = Date.parse(report.expiresAt) - Date.parse(report.createdAt);
    assert.ok(Math.abs(life - SIX_HOURS_MS) < 2_000, `caducidad ${life}`);

    const listed = await api('/api/cities/cancun/reports');
    assert.ok((listed.body.reports as { id: string }[]).some((item) => item.id === report.id));
    const otherCity = await api('/api/cities/cdmx/reports');
    assert.ok((otherCity.body.reports as { id: string }[]).every((item) => item.id !== report.id));

    await getPool().query(
      `UPDATE urban_reports
       SET created_at = now() - interval '2 hours', expires_at = now() - interval '1 minute'
       WHERE id = $1::bigint`,
      [report.id],
    );
    const afterExpiry = await api('/api/cities/cancun/reports');
    assert.ok((afterExpiry.body.reports as { id: string }[]).every((item) => item.id !== report.id));
  });

  it('confirmar suma confirm_count y una caducada o ajena responde 404', async () => {
    const createdReport = await post('cancun', { kind: 'FLOOD', lat: 21.2, lon: -86.85 });
    const id = (createdReport.body.report as { id: string }).id;
    created.push(id);

    const confirmed = await api(`/api/cities/cancun/reports/${id}/confirm`, { method: 'POST' });
    assert.equal(confirmed.status, 200);
    assert.equal((confirmed.body.report as { confirmCount: number; status: string }).confirmCount, 1);
    assert.equal((confirmed.body.report as { status: string }).status, 'UNVERIFIED');

    const missing = await api('/api/cities/cancun/reports/999999999/confirm', { method: 'POST' });
    assert.equal(missing.status, 404);
    assert.equal((missing.body.error as { code: string }).code, 'REPORT_NOT_FOUND');

    const wrongCity = await api(`/api/cities/cdmx/reports/${id}/confirm`, { method: 'POST' });
    assert.equal(wrongCity.status, 404);

    const { rows } = await getPool().query<{ id: string }>(
      `INSERT INTO urban_reports (city_id, lat, lon, kind, status, data_status, created_at, expires_at)
       VALUES ('cancun', 21.101, -86.801, 'FLOOD', 'UNVERIFIED', 'USER_REPORTED', now() - interval '2 hours', now() - interval '1 minute')
       RETURNING id::text AS id`,
    );
    created.push(rows[0]!.id);
    const expired = await api(`/api/cities/cancun/reports/${rows[0]!.id}/confirm`, { method: 'POST' });
    assert.equal(expired.status, 404);
    assert.equal((expired.body.error as { code: string }).code, 'REPORT_NOT_FOUND');
  });

  it('el límite por IP cubre crear y confirmar y responde 429', async () => {
    let lastId = '';
    for (let i = 0; i < REPORT_WRITE_LIMIT; i += 1) {
      const { status, body } = await post('cancun', { kind: 'PUDDLE', lat: 21.11, lon: -86.81 });
      assert.equal(status, 201);
      lastId = (body.report as { id: string }).id;
      created.push(lastId);
    }
    const blockedCreate = await post('cancun', { kind: 'PUDDLE', lat: 21.12, lon: -86.82 });
    assert.equal(blockedCreate.status, 429);
    assert.equal((blockedCreate.body.error as { code: string }).code, 'RATE_LIMITED');

    const blockedConfirm = await api(`/api/cities/cancun/reports/${lastId}/confirm`, { method: 'POST' });
    assert.equal(blockedConfirm.status, 429);
    assert.equal((blockedConfirm.body.error as { code: string }).code, 'RATE_LIMITED');
    const { rows } = await getPool().query<{ confirm_count: number }>(
      'SELECT confirm_count FROM urban_reports WHERE id = $1::bigint',
      [lastId],
    );
    assert.equal(rows[0]?.confirm_count, 0);
  });

  it('la moderación exige el token de admin y guarda estado, fecha y nota', async () => {
    const createdReport = await post('cdmx', { kind: 'FLOOD', lat: 19.4334, lon: -99.1334, description: 'para moderar' });
    const id = (createdReport.body.report as { id: string }).id;
    created.push(id);

    const anonymous = await api(`/api/cities/cdmx/reports/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    assert.equal(anonymous.status, 401);
    assert.equal((anonymous.body.error as { code: string }).code, 'UNAUTHORIZED');

    const wrong = await api(`/api/cities/cdmx/reports/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', authorization: 'Bearer otro-token' },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    assert.equal(wrong.status, 401);

    const invalid = await api(`/api/cities/cdmx/reports/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', authorization: 'Bearer test-admin-token' },
      body: JSON.stringify({ status: 'CLOSED', moderationNote: 'x'.repeat(281) }),
    });
    assert.equal(invalid.status, 400);
    assert.equal((invalid.body.error as { code: string }).code, 'VALIDATION');

    const ok = await api(`/api/cities/cdmx/reports/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', authorization: 'Bearer test-admin-token' },
      body: JSON.stringify({ status: 'REJECTED', moderationNote: '  duplicado  ' }),
    });
    assert.equal(ok.status, 200);
    const report = ok.body.report as { status: string; moderationNote?: string; moderatedAt?: string; dataStatus: string };
    assert.equal(report.status, 'REJECTED');
    assert.equal(report.moderationNote, 'duplicado');
    assert.equal(report.dataStatus, 'USER_REPORTED');
    assert.ok(report.moderatedAt && !Number.isNaN(Date.parse(report.moderatedAt)));

    const listed = await api('/api/cities/cdmx/reports');
    const found = (listed.body.reports as { id: string; status: string }[]).find((item) => item.id === id);
    assert.equal(found?.status, 'REJECTED');
  });

  it('sin base configurada responde 503 y una ciudad desconocida responde 404', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const unavailable = await api('/api/cities/cancun/reports');
      assert.equal(unavailable.status, 503);
      assert.equal((unavailable.body.error as { code: string }).code, 'DATABASE_UNAVAILABLE');
    } finally {
      process.env.DATABASE_URL = previous;
    }

    const missing = await api('/api/cities/madrid/reports');
    assert.equal(missing.status, 404);
    assert.equal((missing.body.error as { code: string }).code, 'CITY_NOT_FOUND');

    const malformed = await api(`/api/cities/${encodeURIComponent('<script>')}/reports`);
    assert.equal(malformed.status, 400);
    assert.equal((malformed.body.error as { code: string }).code, 'INVALID_CITY_ID');
  });
});

async function countUserReports(): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>("SELECT count(*)::text AS count FROM urban_reports WHERE data_status = 'USER_REPORTED'");
  return Number(rows[0]?.count ?? 0);
}
