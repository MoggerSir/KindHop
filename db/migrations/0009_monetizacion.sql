-- KindHop 0009 · 2026-11-21 · monetización (KH-021). Solo añade.
-- Plan del usuario: FREE o PRO. En la demo, PRO es simulado (plan_simulated = true, sin cobro): lo concede la entrada
-- demo. En producción lo concedería el webhook de Stripe al confirmar el pago (pendiente, ver docs/02-modules/monetization.md).
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_simulated BOOLEAN NOT NULL DEFAULT false;

-- Evento patrocinado: puesto pagado 1, 2 o 3 entre los recomendados. Un puesto por ciudad. Siempre se etiqueta "Patrocinado".
ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsored_rank SMALLINT CHECK (sponsored_rank BETWEEN 1 AND 3);
CREATE UNIQUE INDEX IF NOT EXISTS events_sponsored_rank_uq ON events (city_id, sponsored_rank) WHERE sponsored_rank IS NOT NULL;
