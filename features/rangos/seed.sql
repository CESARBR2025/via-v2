CREATE TABLE IF NOT EXISTS v2_rangos_oficiales (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre  VARCHAR(100) NOT NULL,
    activo  BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rangos_nombre ON v2_rangos_oficiales(UPPER(nombre));

INSERT INTO v2_rangos_oficiales (nombre) VALUES
    ('OFICIAL'),
    ('SUBOFICIAL'),
    ('OFICIAL SUPERIOR'),
    ('INSPECTOR'),
    ('SUBINSPECTOR'),
    ('COMANDANTE'),
    ('SUBCOMANDANTE'),
    ('JEFE'),
    ('DIRECTOR')
ON CONFLICT (UPPER(nombre)) DO NOTHING;

ALTER TABLE v2_oficiales ADD COLUMN IF NOT EXISTS rango_id UUID REFERENCES v2_rangos_oficiales(id) ON DELETE SET NULL;
