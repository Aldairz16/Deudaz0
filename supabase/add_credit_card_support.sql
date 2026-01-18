-- Migración para agregar soporte de Tarjetas de Crédito a la tabla wallets

-- Agregar columna 'type' (DEBIT o CREDIT)
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'DEBIT';

-- Agregar columna 'credit_limit'
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC DEFAULT 0;

-- Opcional: Agregar restricción para asegurar integridad de datos
ALTER TABLE wallets 
ADD CONSTRAINT wallets_type_check CHECK (type IN ('DEBIT', 'CREDIT'));
