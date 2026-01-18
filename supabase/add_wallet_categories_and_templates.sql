-- Migración para mejorar wallets y agregar templates de transacciones

-- 1. Mejoras en Wallets: Agregar columna 'category'
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- 2. Tabla para Plantillas de Transacciones (Acciones Rápidas)
CREATE TABLE IF NOT EXISTS transaction_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Opcional si usas RLS
    name TEXT NOT NULL, -- "Pasaje", "Sueldo"
    amount NUMERIC DEFAULT 0,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL, -- Wallet por defecto (opcional)
    category TEXT, -- Categoría de la transacción
    icon TEXT, -- Para UI (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_transaction_templates_user_id ON transaction_templates(user_id);
