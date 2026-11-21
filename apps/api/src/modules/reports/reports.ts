import { timingSafeEqual } from 'node:crypto';
import { AppError } from '../../shared/errors.js';
import { requireDatabase } from '../../shared/db.js';

// Elección del MVP, no un dato medido: 10 escrituras públicas por IP cada 10 minutos.
// Crear y confirmar comparten el contador. La IP vive solo en este mapa y se olvida al salir de la ventana.
export const REPORT_WRITE_LIMIT = 10;
export const REPORT_WRITE_WINDOW_MS = 10 * 60 * 1000;

const writesByIp = new Map<string, number[]>();

export function resetReportRateLimits(): void {
  writesByIp.clear();
}

export function assertReportWriteAllowed(ip: string, now = Date.now()): void {
  for (const [key, stamps] of writesByIp) {
    const recent = stamps.filter((stamp) => now - stamp < REPORT_WRITE_WINDOW_MS);
    if (recent.length === 0) writesByIp.delete(key);
    else if (recent.length !== stamps.length) writesByIp.set(key, recent);
  }

  const recent = writesByIp.get(ip) ?? [];
  if (recent.length >= REPORT_WRITE_LIMIT) {
    throw new AppError(429, 'RATE_LIMITED', 'Demasiados reportes desde esta red. Inténtalo más tarde.');
  }
  recent.push(now);
  writesByIp.set(ip, recent);
}

// Tres decimales ≈ 100 m. Empate (…x5) se aleja de cero. Se aplica en la API, antes de guardar.
export function roundTo3(value: number): number {
  const negative = value < 0;
  const [whole, frac = ''] = Math.abs(value).toFixed(8).split('.');
  let digits = Number(frac.slice(0, 3));
  if (Number(frac[3] ?? '0') >= 5) digits += 1;
  let roundedWhole = Number(whole);
  if (digits >= 1000) {
    roundedWhole += 1;
    digits = 0;
  }
  const rounded = roundedWhole + digits / 1000;
  return negative ? -rounded : rounded;
}

const REPORT_ID_MAX = 9223372036854775807n;

export function parseReportId(raw: unknown): string {
  if (typeof raw !== 'string' || !/^[1-9]\d{0,18}$/.test(raw) || BigInt(raw) > REPORT_ID_MAX) {
    throw new AppError(400, 'VALIDATION', 'Identificador de incidencia inválido');
  }
  return raw;
}

export function assertDatabaseConfigured(): void {
  requireDatabase();
}

// Falla cerrado: sin variable, o con un valor distinto, la respuesta es la misma (401).
export function assertReportsAdmin(authorization: string | undefined): void {
  const expected = process.env.REPORTS_ADMIN_TOKEN?.trim() ?? '';
  const provided = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';
  if (!expected || !safeEqual(provided, expected)) {
    throw new AppError(401, 'UNAUTHORIZED', 'Token de moderación inválido');
  }
}

function safeEqual(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}
