-- Migration V4: Add missing 'total_transfer' to shifts and other checks

ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_transfer DECIMAL(15, 2) DEFAULT 0;

-- Just in case checks
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shift_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock DECIMAL(15, 4) DEFAULT 0;
