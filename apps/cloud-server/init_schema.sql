-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 0. TENANTS (Restaurants)
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 1. HALLS
CREATE TABLE IF NOT EXISTS halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 2. TABLES
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id UUID REFERENCES halls(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'free',
    start_time TIMESTAMP,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    current_check_number INTEGER DEFAULT 0,
    waiter_id UUID,
    waiter_name TEXT,
    guests INTEGER DEFAULT 0,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 4. KITCHENS
CREATE TABLE IF NOT EXISTS kitchens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    printer_ip TEXT,
    printer_port INTEGER DEFAULT 9100,
    printer_type TEXT DEFAULT 'driver',
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    destination UUID, -- Kitchen ID
    is_active INTEGER DEFAULT 1,
    stock DECIMAL(15, 4) DEFAULT 0,
    unit_type TEXT DEFAULT 'item',
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 6. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pin TEXT,
    role TEXT DEFAULT 'waiter',
    salt TEXT,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    UNIQUE(restaurant_id, pin) -- PIN per restaurant unique
);

-- 7. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    debt DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    type TEXT DEFAULT 'standard',
    value INTEGER DEFAULT 0,
    balance DECIMAL(15, 2) DEFAULT 0,
    birthday DATE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 8. SALES (Headers)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_number INTEGER,
    date TIMESTAMP,
    total_amount DECIMAL(15, 2),
    subtotal DECIMAL(15, 2),
    discount DECIMAL(15, 2),
    payment_method TEXT,
    customer_id UUID REFERENCES customers(id),
    waiter_name TEXT,
    guest_count INTEGER,
    items_json JSONB,
    shift_id UUID,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. SALE_ITEMS
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_name TEXT,
    category_name TEXT,
    price DECIMAL(15, 2),
    quantity DECIMAL(15, 2),
    total_price DECIMAL(15, 2),
    date TIMESTAMP,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. SHIFTS
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    start_cash DECIMAL(15, 2) DEFAULT 0,
    end_cash DECIMAL(15, 2) DEFAULT 0,
    declared_cash DECIMAL(15, 2) DEFAULT 0,
    declared_card DECIMAL(15, 2) DEFAULT 0,
    difference_cash DECIMAL(15, 2) DEFAULT 0,
    difference_card DECIMAL(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'open',
    cashier_name TEXT,
    total_sales DECIMAL(15, 2) DEFAULT 0,
    total_cash DECIMAL(15, 2) DEFAULT 0,
    total_card DECIMAL(15, 2) DEFAULT 0,
    total_transfer DECIMAL(15, 2) DEFAULT 0,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. SUPPLIES
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

-- 12. SUPPLY_ITEMS
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

-- 13. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    key TEXT,
    value TEXT,
    is_synced INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT NOW(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    PRIMARY KEY (restaurant_id, key)
);

-- 14. RESERVATIONS
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

-- 15. CANCELLED_ORDERS
CREATE TABLE IF NOT EXISTS cancelled_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID, -- No FK constraint to keep history even if table deleted (or use logic)
    date TIMESTAMP,
    total_amount DECIMAL(15, 2),
    waiter_name TEXT,
    items_json JSONB,
    reason TEXT,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 16. DEBT_HISTORY
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

-- 17. CUSTOMER_DEBTS
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

-- 18. SMS TEMPLATES
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

-- 19. SMS LOGS
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


-- DEFAULT RESTAURANT (Generic Tenant for testing)
INSERT INTO restaurants (id, name) 
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Default Restaurant')
ON CONFLICT (id) DO NOTHING;
