-- Migration V3: Fix existing tables with missing columns

-- 1. DEBT HISTORY: Add sale_id
ALTER TABLE debt_history ADD COLUMN IF NOT EXISTS sale_id UUID;

-- 2. CUSTOMER DEBTS: Add missing columns if any (based on V2 schema)
-- V2: id, customer_id, amount, due_date, last_sms_date, is_paid, created_at, restaurant_id, updated_at
ALTER TABLE customer_debts ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
ALTER TABLE customer_debts ADD COLUMN IF NOT EXISTS last_sms_date TIMESTAMP;
ALTER TABLE customer_debts ADD COLUMN IF NOT EXISTS is_paid INTEGER DEFAULT 0;
ALTER TABLE customer_debts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- 3. SALES: Ensure shift_id is UUID (if it was text, casting might differ, but ADD COLUMN IF NOT EXISTS is safe)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shift_id UUID;

-- 4. CUSTOMERS: Add type/value/balance/birthday
ALTER TABLE customers ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'standard';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS value INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS balance DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday DATE;
