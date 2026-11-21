-- KindHop 0007 · 2026-11-21 · usuarios (Google) y sesiones de express-session (KH-019). Diccionario: docs/06-data/database.md
-- Solo añade. Sin contraseñas: la identidad la da Google (OpenID Connect).

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE CHECK (char_length(google_sub) BETWEEN 1 AND 255), -- "sub" de Google: id estable
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  name TEXT CHECK (char_length(name) <= 200),
  picture_url TEXT CHECK (picture_url IS NULL OR picture_url ~ '^https://'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (lower(email));

-- Esquema que espera connect-pg-simple. Solo guarda el id de sesión (sid), sus datos (sess: userId y estado OAuth
-- temporal) y su caducidad. El navegador solo ve el sid firmado en una cookie HttpOnly.
CREATE TABLE IF NOT EXISTS user_sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS user_sessions_expire_idx ON user_sessions (expire);
