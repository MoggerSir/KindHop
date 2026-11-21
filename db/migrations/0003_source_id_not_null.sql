-- KindHop 0003 · 2026-11-21 · source_id obligatorio en places y events.
-- Diccionario: docs/06-data/database.md. Idempotente: se puede volver a ejecutar el archivo.
-- No toca UNIQUE (source_id, external_id): el upsert de la importación OSM sigue por ese par.
-- Las columnas de legado de places (source_name, source_url, license) se retiran al final:
-- nombre, URL y licencia viven en data_sources. El enlace al objeto OSM se arma con external_id.

-- Rellena solo filas DEMO sin procedencia, con la fuente kindhop-demo.
-- Cualquier otro source_id nulo aborta la migración (no se inventa una fuente REAL).
DO $$
DECLARE
  demo_ok int;
  pendientes int;
  detalle text;
  tiene_legado boolean;
BEGIN
  IF EXISTS (
    SELECT 1 FROM places WHERE source_id IS NULL AND data_status = 'DEMO'
    UNION ALL
    SELECT 1 FROM events WHERE source_id IS NULL AND data_status = 'DEMO'
  ) THEN
    SELECT count(*) INTO demo_ok
    FROM data_sources
    WHERE id = 'kindhop-demo' AND data_status = 'DEMO';

    IF demo_ok = 0 THEN
      INSERT INTO data_sources (id, name, url, license, attribution, data_status, notes) VALUES
        ('kindhop-demo', 'Datos simulados de KindHop', NULL, 'Propios del proyecto', 'Ejemplo: no son datos reales', 'DEMO',
         'Todo lo que apunta aquí se muestra con la etiqueta DEMO y lo regeneran los seeds.')
      ON CONFLICT (id) DO NOTHING;
      SELECT count(*) INTO demo_ok
      FROM data_sources
      WHERE id = 'kindhop-demo' AND data_status = 'DEMO';
    END IF;

    IF demo_ok <> 1 THEN
      RAISE EXCEPTION
        'Migración 0003: hay filas DEMO sin source_id y la fuente kindhop-demo no existe con data_status DEMO. No se asigna otra procedencia. Corrige data_sources y vuelve a migrar.';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM places pendiente
      JOIN places ya
        ON ya.source_id = 'kindhop-demo'
       AND ya.external_id = pendiente.external_id
      WHERE pendiente.source_id IS NULL
        AND pendiente.data_status = 'DEMO'
        AND pendiente.external_id IS NOT NULL
    ) OR EXISTS (
      SELECT 1
      FROM places
      WHERE source_id IS NULL AND data_status = 'DEMO' AND external_id IS NOT NULL
      GROUP BY external_id
      HAVING count(*) > 1
    ) THEN
      SELECT string_agg(external_id, ', ' ORDER BY external_id) INTO detalle
      FROM (
        SELECT DISTINCT external_id
        FROM places
        WHERE data_status = 'DEMO' AND external_id IS NOT NULL AND source_id IS NULL
        ORDER BY external_id
        LIMIT 20
      ) choque;
      RAISE EXCEPTION
        'Migración 0003: no se puede asignar kindhop-demo a lugares DEMO porque external_id chocaría con el único (source_id, external_id). Revisa: %',
        COALESCE(detalle, '(sin external_id listado)');
    END IF;

    IF EXISTS (
      SELECT 1
      FROM events pendiente
      JOIN events ya
        ON ya.source_id = 'kindhop-demo'
       AND ya.external_id = pendiente.external_id
      WHERE pendiente.source_id IS NULL
        AND pendiente.data_status = 'DEMO'
        AND pendiente.external_id IS NOT NULL
    ) OR EXISTS (
      SELECT 1
      FROM events
      WHERE source_id IS NULL AND data_status = 'DEMO' AND external_id IS NOT NULL
      GROUP BY external_id
      HAVING count(*) > 1
    ) THEN
      SELECT string_agg(external_id, ', ' ORDER BY external_id) INTO detalle
      FROM (
        SELECT DISTINCT external_id
        FROM events
        WHERE data_status = 'DEMO' AND external_id IS NOT NULL AND source_id IS NULL
        ORDER BY external_id
        LIMIT 20
      ) choque;
      RAISE EXCEPTION
        'Migración 0003: no se puede asignar kindhop-demo a eventos DEMO porque external_id chocaría con el único (source_id, external_id). Revisa: %',
        COALESCE(detalle, '(sin external_id listado)');
    END IF;

    UPDATE places SET source_id = 'kindhop-demo' WHERE source_id IS NULL AND data_status = 'DEMO';
    UPDATE events SET source_id = 'kindhop-demo' WHERE source_id IS NULL AND data_status = 'DEMO';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'source_name'
  ) INTO tiene_legado;

  SELECT count(*) INTO pendientes FROM places WHERE source_id IS NULL;
  detalle := '';
  IF pendientes > 0 THEN
    IF tiene_legado THEN
      EXECUTE $q$
        SELECT string_agg(
          format(
            'places id=%s data_status=%s source_name=%s source_url=%s license=%s',
            id,
            data_status,
            COALESCE(source_name, ''),
            COALESCE(source_url, ''),
            COALESCE(license, '')
          ),
          ' | ' ORDER BY id
        )
        FROM (
          SELECT id, data_status, source_name, source_url, license
          FROM places
          WHERE source_id IS NULL
          ORDER BY id
          LIMIT 20
        ) muestra
      $q$ INTO detalle;
    ELSE
      SELECT string_agg(format('places id=%s data_status=%s', id, data_status), ' | ' ORDER BY id)
      INTO detalle
      FROM (
        SELECT id, data_status FROM places WHERE source_id IS NULL ORDER BY id LIMIT 20
      ) muestra;
    END IF;
    detalle := format('%s lugar(es): %s', pendientes, COALESCE(detalle, ''));
  END IF;

  SELECT count(*) INTO pendientes FROM events WHERE source_id IS NULL;
  IF pendientes > 0 THEN
    DECLARE
      eventos text;
    BEGIN
      SELECT string_agg(format('events id=%s data_status=%s', id, data_status), ' | ' ORDER BY id)
      INTO eventos
      FROM (
        SELECT id, data_status FROM events WHERE source_id IS NULL ORDER BY id LIMIT 20
      ) muestra;
      detalle := concat_ws(' || ', NULLIF(detalle, ''), format('%s evento(s): %s', pendientes, COALESCE(eventos, '')));
    END;
  END IF;

  IF detalle <> '' THEN
    RAISE EXCEPTION
      'Migración 0003: hay filas sin procedencia (source_id nulo y data_status distinto de DEMO). No se les asigna una fuente. Corrige source_id y vuelve a migrar. %',
      detalle;
  END IF;
END $$;

ALTER TABLE places ALTER COLUMN source_id SET NOT NULL;
ALTER TABLE events ALTER COLUMN source_id SET NOT NULL;

ALTER TABLE places DROP COLUMN IF EXISTS source_name;
ALTER TABLE places DROP COLUMN IF EXISTS source_url;
ALTER TABLE places DROP COLUMN IF EXISTS license;
