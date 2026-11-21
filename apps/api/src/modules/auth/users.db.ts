import { query } from '../../shared/db.js';
import type { GoogleProfile } from './google.js';

// Usuarios creados con Google. Sin contraseñas ni tokens de Google guardados: solo la identidad mínima.
// plan: PRO solo si no ha caducado; `simulated` = concedido por la demo, sin cobro (KH-021).
export type Plan = { tier: 'FREE' | 'PRO'; until: string | null; simulated: boolean };
export type User = { id: string; email: string; name: string | null; pictureUrl: string | null; plan: Plan };

type Row = {
  id: string;
  email: string;
  name: string | null;
  picture_url: string | null;
  plan: 'FREE' | 'PRO';
  plan_until: Date | null;
  plan_simulated: boolean;
};
const COLUMNS = 'id, email, name, picture_url, plan, plan_until, plan_simulated';

export function planOf(r: Pick<Row, 'plan' | 'plan_until' | 'plan_simulated'>, now = new Date()): Plan {
  const active = r.plan === 'PRO' && (r.plan_until === null || r.plan_until > now);
  return active
    ? { tier: 'PRO', until: r.plan_until ? r.plan_until.toISOString() : null, simulated: r.plan_simulated }
    : { tier: 'FREE', until: null, simulated: false };
}

const toUser = (r: Row): User => ({ id: String(r.id), email: r.email, name: r.name, pictureUrl: r.picture_url, plan: planOf(r) });

// Crea el usuario la primera vez y actualiza nombre/foto/último acceso las siguientes (idempotente por google_sub).
export async function upsertGoogleUser(p: GoogleProfile): Promise<User> {
  const { rows } = await query<Row>(
    `INSERT INTO users (google_sub, email, name, picture_url) VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_sub) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name,
       picture_url = EXCLUDED.picture_url, last_login_at = now()
     RETURNING ${COLUMNS}`,
    [p.sub, p.email, p.name, p.picture],
  );
  return toUser(rows[0]);
}

export async function findUserById(id: string): Promise<User | null> {
  if (!/^\d{1,19}$/.test(id)) return null;
  const { rows } = await query<Row>(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ? toUser(rows[0]) : null;
}

// Pro simulado de 30 días para la cuenta demo (sin Stripe, sin cobro). Solo lo llama /dev-login.
export async function grantSimulatedPro(id: string): Promise<User> {
  const { rows } = await query<Row>(
    `UPDATE users SET plan = 'PRO', plan_until = now() + interval '30 days', plan_simulated = true
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id],
  );
  return toUser(rows[0]);
}
