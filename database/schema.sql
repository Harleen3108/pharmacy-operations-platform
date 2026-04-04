-- Pharmacy Operations Platform Database Schema

-- Roles: Admin, Supervisor, Pharmacist, Associate
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Stores
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT,
    contact_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    store_id INTEGER REFERENCES stores(id),
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Catalog
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    manufacturer VARCHAR(100),
    sku VARCHAR(50) UNIQUE,
    is_prescription_required BOOLEAN DEFAULT FALSE,
    unit_measure VARCHAR(20) DEFAULT 'tablet',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store Inventory (Stock quantity per store)
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    product_id INTEGER REFERENCES products(id),
    reorder_level INTEGER DEFAULT 10,
    UNIQUE(store_id, product_id)
);

-- Batches tracking within inventory
CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id),
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    cost_price DECIMAL(12, 2) NOT NULL,
    selling_price DECIMAL(12, 2) NOT NULL,
    initial_quantity INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales transactions
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    associate_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sale Items
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    batch_id INTEGER REFERENCES batches(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);

-- Prescriptions (Linked to sales if product requires it)
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    patient_name VARCHAR(100),
    doctor_name VARCHAR(100),
    prescription_image_url TEXT,
    verified_by_pharmacist_id INTEGER REFERENCES users(id),
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inter-store Transfers
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    from_store_id INTEGER REFERENCES stores(id),
    to_store_id INTEGER REFERENCES stores(id),
    batch_id INTEGER REFERENCES batches(id),
    quantity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'requested', -- requested, in_transit, completed, cancelled
    requested_by INTEGER REFERENCES users(id),
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50), -- sale, inventory, user, transfer
    resource_id INTEGER,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Roles
INSERT INTO roles (name, description) VALUES
('District Admin', 'System-wide access and analytics'),
('Store Supervisor', 'Manage one store and its inventory'),
('Pharmacist', 'Verify prescriptions and manage clinical items'),
('Associate', 'Mainly floor sales and inventory searches');
