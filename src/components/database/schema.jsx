-- Comprehensive PostgreSQL Schema for Xero Clone Accounting System
-- This schema supports multi-tenant architecture with complete accounting functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-tenant Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    fiscal_year_start DATE NOT NULL,
    created_by UUID REFERENCES users(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Organization relationships
CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

-- Chart of Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    category VARCHAR(50),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    parent_account_id UUID REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, code)
);

-- Contacts (Customers and Suppliers)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    tax_number VARCHAR(100),
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(20) DEFAULT 'net_30',
    is_active BOOLEAN DEFAULT true,
    contact_details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items/Products
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sales_price DECIMAL(15,2),
    purchase_price DECIMAL(15,2),
    sales_account_id UUID REFERENCES accounts(id),
    purchase_account_id UUID REFERENCES accounts(id),
    inventory_account_id UUID REFERENCES accounts(id),
    cogs_account_id UUID REFERENCES accounts(id),
    is_tracked BOOLEAN DEFAULT false,
    quantity_on_hand DECIMAL(15,4) DEFAULT 0,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    total_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2),
    notes TEXT,
    terms TEXT,
    reference VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, invoice_number)
);

-- Invoice Line Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    description TEXT NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_rate DECIMAL(5,2) DEFAULT 0,
    account_id UUID REFERENCES accounts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bills (Supplier Invoices)
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(100) NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'awaiting_payment', 'paid', 'overdue')),
    total_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2),
    notes TEXT,
    reference VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, bill_number)
);

-- Bill Line Items
CREATE TABLE bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    description TEXT NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    account_id UUID REFERENCES accounts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Accounts
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100),
    bank_name VARCHAR(255),
    account_id UUID REFERENCES accounts(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Transactions
CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID REFERENCES bank_accounts(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('receive', 'spend', 'transfer')),
    contact_id UUID REFERENCES contacts(id),
    account_id UUID REFERENCES accounts(id),
    is_reconciled BOOLEAN DEFAULT false,
    category VARCHAR(100),
    tax_amount DECIMAL(15,2) DEFAULT 0,
    attachment_url VARCHAR(500),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- General Ledger Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    reference VARCHAR(100),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    source_type VARCHAR(50), -- 'invoice', 'bill', 'payment', 'manual', etc.
    source_id UUID, -- ID of the source document
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries (Double-entry bookkeeping)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax Codes and Rates
CREATE TABLE taxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sales', 'purchase', 'withholding')),
    account_id UUID REFERENCES accounts(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(100),
    contact_id UUID REFERENCES contacts(id),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('received', 'made')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'credit_card', 'online')),
    reference VARCHAR(100),
    bank_account_id UUID REFERENCES bank_accounts(id),
    status VARCHAR(20) DEFAULT 'authorised' CHECK (status IN ('authorised', 'deleted')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_accounts_organization_type ON accounts(organization_id, type);
CREATE INDEX idx_contacts_organization_type ON contacts(organization_id, type);
CREATE INDEX idx_invoices_organization_status ON invoices(organization_id, status);
CREATE INDEX idx_bills_organization_status ON bills(organization_id, status);
CREATE INDEX idx_bank_transactions_account_date ON bank_transactions(bank_account_id, date);
CREATE INDEX idx_journal_entries_account ON journal_entries(account_id);
CREATE INDEX idx_transactions_organization_date ON transactions(organization_id, date);
CREATE INDEX idx_payments_organization_date ON payments(organization_id, payment_date);

-- Insert default roles
INSERT INTO roles (id, name, permissions) VALUES 
    (uuid_generate_v4(), 'Admin', '["all"]'),
    (uuid_generate_v4(), 'Accountant', '["read", "write", "reports"]'),
    (uuid_generate_v4(), 'User', '["read", "write"]'),
    (uuid_generate_v4(), 'Read Only', '["read"]');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';