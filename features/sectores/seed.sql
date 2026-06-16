CREATE TABLE IF NOT EXISTS v2_sectores (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre  VARCHAR(100) NOT NULL,
    activo  BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sectores_nombre ON v2_sectores(UPPER(nombre));

INSERT INTO v2_sectores (nombre) VALUES
    ('PONIENTE'),
    ('ORIENTE'),
    ('CENTRO')
ON CONFLICT (UPPER(nombre)) DO NOTHING;
