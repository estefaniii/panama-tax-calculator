
DROP TABLE IF EXISTS tax_calculations;

-- Crea la tabla para almacenar los cálculos de impuestos
CREATE TABLE tax_calculations (
  id SERIAL PRIMARY KEY,
  income DECIMAL(12, 2) NOT NULL CHECK (income >= 0),
  tax DECIMAL(12, 2) NOT NULL CHECK (tax >= 0),
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crea índice para mejorar las consultas por fecha
CREATE INDEX idx_tax_calculations_date ON tax_calculations(calculation_date DESC);

-- Opcional: Crea un usuario específico para la aplicación (ajusta los valores)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tax_app_user') THEN
    CREATE ROLE tax_app_user WITH LOGIN PASSWORD 'securepassword';
  END IF;
END
$$;

-- Otorga permisos al usuario
GRANT CONNECT ON DATABASE current_database() TO tax_app_user;
GRANT USAGE ON SCHEMA public TO tax_app_user;
GRANT ALL PRIVILEGES ON TABLE tax_calculations TO tax_app_user;
GRANT USAGE, SELECT ON SEQUENCE tax_calculations_id_seq TO tax_app_user;