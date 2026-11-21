import { query } from '../../shared/db.js';
import type { GoogleProfile } from './google.js';

// Usuarios creados con Google. Sin contraseñas ni tokens de Google guardados: solo la identidad mínima.
export type User = { id: string; email: string; name: string | null; pictureUrl: string | null };

type Row = { id: string; email: string; name: string | null; picture_url: string | null };
const toUser = (r: Row): User => ({ id: String(r.id), email: r.email, name: r.name, pictureUrl: r.picture_url });

// Crea el usuario la primera vez y actualiza nombre/foto/último acceso las siguientes (idempotente por google_sub).
export async function upsertGoogleUser(p: GoogleProfile): Promise<User> {
  const { rows } = await query<Row>(
    `INSERT INTO users (google_sub, email, name, picture_url) VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_sub) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name,
       picture_url = EXCLUDED.picture_url, last_login_at = now()
     RETURNING id, email, name, picture_url`,
    [p.sub, p.email, p.name, p.picture],
  );
  return toUser(rows[0]);
}

export async function findUserById(id: string): Promise<User | null> {
  if (!/^\d{1,19}$/.test(id)) return null;
  const { rows } = await query<Row>('SELECT id, email, name, picture_url FROM users WHERE id = $1', [id]);
  return rows[0] ? toUser(rows[0]) : null;
}
