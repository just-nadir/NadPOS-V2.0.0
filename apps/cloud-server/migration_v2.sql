-- Migration V2: Add missing columns and tables for V2 Schema

-- 1. ADD COLUMNS TO PRODUCTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock DECIMAL(15, 4) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'item';

-- 2. CREATE MISSING TABLES

-- SUPPLIES
CREATE TABLE IF NOT EXISTS supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name TEXT,
    date TIMESTAMP,
    status TEXT DEFAULT 'draft',
    total_amount DECIMAL(15, 2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- SUPPLY_ITEMS
CREATE TABLE IF NOT EXISTS supply_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(15, 4),
    price DECIMAL(15, 2),
    total DECIMAL(15, 2),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    key TEXT,
    value TEXT,
    is_synced INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT NOW(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    PRIMARY KEY (restaurant_id, key)
);

-- RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_phone TEXT,
    reservation_time TIMESTAMP,
    guests INTEGER DEFAULT 1,
    note TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- CANCELLED_ORDERS
CREATE TABLE IF NOT EXISTS cancelled_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID, -- No FK constraint
    date TIMESTAMP,
    total_amount DECIMAL(15, 2),
    waiter_name TEXT,
    items_json JSONB,
    reason TEXT,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- DEBT_HISTORY
CREATE TABLE IF NOT EXISTS debt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    sale_id UUID,
    amount DECIMAL(15, 2),
    type TEXT,
    date TIMESTAMP,
    comment TEXT,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CUSTOMER_DEBTS
CREATE TABLE IF NOT EXISTS customer_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2),
    due_date TIMESTAMP,
    last_sms_date TIMESTAMP,
    is_paid INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SMS TEMPLATES
CREATE TABLE IF NOT EXISTS sms_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT,
    title TEXT,
    content TEXT,
    is_active INTEGER DEFAULT 1,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(restaurant_id, type)
);

-- SMS LOGS
CREATE TABLE IF NOT EXISTS sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT,
    message TEXT,
    status TEXT,
    date TIMESTAMP,
    type TEXT,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);
