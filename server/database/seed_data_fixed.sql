-- Comprehensive Seed Data for Money App (Schema Compatible)
-- This creates realistic accounting data for testing all CRUD operations

-- Clear existing data (be careful in production!)
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE journal_entry_lines CASCADE;
TRUNCATE TABLE journal_entries CASCADE;
TRUNCATE TABLE bill_line_items CASCADE;
TRUNCATE TABLE bills CASCADE;
TRUNCATE TABLE invoice_line_items CASCADE;
TRUNCATE TABLE invoices CASCADE;
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE tax_rates CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE accounts CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE organizations CASCADE;

-- Insert Organizations
INSERT INTO organizations (id, name, legal_name, address, city, state, postal_code, country, phone, contact_email, tax_number, currency_code, timezone, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Accounting Corp', 'Demo Accounting Corporation Ltd', '123 Business Street', 'New York', 'NY', '10001', 'US', '+1-555-0123', 'admin@demoacc.com', '123456789', 'USD', 'America/New_York', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Test Company Inc', 'Test Company Incorporated', '456 Corporate Ave', 'Los Angeles', 'CA', '90210', 'US', '+1-555-0456', 'info@testcompany.com', '987654321', 'USD', 'America/Los_Angeles', NOW(), NOW());

-- Insert Users
INSERT INTO users (id, organization_id, first_name, last_name, email, password_hash, role, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'John', 'Smith', 'admin@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Sarah', 'Johnson', 'accountant@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'accountant', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Mike', 'Wilson', 'manager@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Emily', 'Davis', 'admin@testcompany.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Alice', 'Brown', 'user@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true, NOW(), NOW());

-- Insert Chart of Accounts (Standard US Chart of Accounts)
INSERT INTO accounts (id, organization_id, code, name, type, parent_account_id, description, balance, is_active, created_at, updated_at) VALUES
-- ASSETS
('a1000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1000', 'ASSETS', 'asset', NULL, 'Total Assets', 0.00, true, NOW(), NOW()),
('a1100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1100', 'Current Assets', 'asset', 'a1000000-0000-0000-0000-000000000001', 'Current Assets', 0.00, true, NOW(), NOW()),
('a1110000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1110', 'Cash and Cash Equivalents', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Cash and Cash Equivalents', 25000.00, true, NOW(), NOW()),
('a1111000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1111', 'Petty Cash', 'asset', 'a1110000-0000-0000-0000-000000000001', 'Petty Cash Fund', 500.00, true, NOW(), NOW()),
('a1112000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1112', 'Checking Account - Main', 'asset', 'a1110000-0000-0000-0000-000000000001', 'Primary Business Checking', 22000.00, true, NOW(), NOW()),
('a1113000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1113', 'Savings Account', 'asset', 'a1110000-0000-0000-0000-000000000001', 'Business Savings Account', 15000.00, true, NOW(), NOW()),
('a1120000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1120', 'Accounts Receivable', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Accounts Receivable', 18500.00, true, NOW(), NOW()),
('a1130000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1130', 'Inventory', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Inventory Asset', 12000.00, true, NOW(), NOW()),
('a1140000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1140', 'Prepaid Expenses', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Prepaid Expenses', 3200.00, true, NOW(), NOW()),

-- FIXED ASSETS
('a1200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1200', 'Fixed Assets', 'asset', 'a1000000-0000-0000-0000-000000000001', 'Fixed Assets', 0.00, true, NOW(), NOW()),
('a1210000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1210', 'Equipment', 'asset', 'a1200000-0000-0000-0000-000000000001', 'Equipment', 45000.00, true, NOW(), NOW()),
('a1220000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1220', 'Accumulated Depreciation - Equipment', 'asset', 'a1200000-0000-0000-0000-000000000001', 'Accumulated Depreciation - Equipment', -12000.00, true, NOW(), NOW()),

-- LIABILITIES
('a2000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2000', 'LIABILITIES', 'liability', NULL, 'Total Liabilities', 0.00, true, NOW(), NOW()),
('a2100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2100', 'Current Liabilities', 'liability', 'a2000000-0000-0000-0000-000000000001', 'Current Liabilities', 0.00, true, NOW(), NOW()),
('a2110000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2110', 'Accounts Payable', 'liability', 'a2100000-0000-0000-0000-000000000001', 'Accounts Payable', 8500.00, true, NOW(), NOW()),
('a2120000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2120', 'Sales Tax Payable', 'liability', 'a2100000-0000-0000-0000-000000000001', 'Sales Tax Payable', 1200.00, true, NOW(), NOW()),

-- EQUITY
('a3000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '3000', 'EQUITY', 'equity', NULL, 'Total Equity', 0.00, true, NOW(), NOW()),
('a3100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '3100', 'Owner''s Equity', 'equity', 'a3000000-0000-0000-0000-000000000001', 'Owner''s Equity', 50000.00, true, NOW(), NOW()),
('a3200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '3200', 'Retained Earnings', 'equity', 'a3000000-0000-0000-0000-000000000001', 'Retained Earnings', 28000.00, true, NOW(), NOW()),

-- REVENUE
('a4000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '4000', 'REVENUE', 'revenue', NULL, 'Total Revenue', 0.00, true, NOW(), NOW()),
('a4100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '4100', 'Sales Revenue', 'revenue', 'a4000000-0000-0000-0000-000000000001', 'Sales Revenue', -125000.00, true, NOW(), NOW()),
('a4200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '4200', 'Service Revenue', 'revenue', 'a4000000-0000-0000-0000-000000000001', 'Service Revenue', -85000.00, true, NOW(), NOW()),

-- EXPENSES
('a5000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5000', 'EXPENSES', 'expense', NULL, 'Total Expenses', 0.00, true, NOW(), NOW()),
('a5100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5100', 'Cost of Goods Sold', 'expense', 'a5000000-0000-0000-0000-000000000001', 'Cost of Goods Sold', 68000.00, true, NOW(), NOW()),
('a5200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5200', 'Operating Expenses', 'expense', 'a5000000-0000-0000-0000-000000000001', 'Operating Expenses', 0.00, true, NOW(), NOW()),
('a5210000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5210', 'Rent Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Rent Expense', 18000.00, true, NOW(), NOW()),
('a5220000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5220', 'Utilities Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Utilities Expense', 3600.00, true, NOW(), NOW());

-- Insert Tax Rates
INSERT INTO tax_rates (id, organization_id, name, rate, type, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Sales Tax', 8.25, 'sales', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'GST', 10.00, 'both', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'HST', 13.00, 'both', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'VAT', 15.00, 'both', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'No Tax', 0.00, 'both', true, NOW(), NOW());

-- Insert Contacts
INSERT INTO contacts (id, organization_id, type, name, email, phone, contact_person, address, city, state, postal_code, country, tax_number, payment_terms, credit_limit, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'ABC Manufacturing Ltd', 'accounts@abcmanufacturing.com', '+1-555-1001', 'John Anderson', '789 Industrial Blvd', 'Chicago', 'IL', '60601', 'US', '111-22-3333', 30, 50000.00, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'XYZ Retail Corp', 'billing@xyzretail.com', '+1-555-1002', 'Sarah Miller', '456 Commerce St', 'Dallas', 'TX', '75201', 'US', '444-55-6666', 15, 25000.00, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Tech Solutions Inc', 'finance@techsolutions.com', '+1-555-1003', 'Mike Johnson', '321 Technology Dr', 'San Jose', 'CA', '95101', 'US', '777-88-9999', 45, 75000.00, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Office Supplies Plus', 'orders@officesupplies.com', '+1-555-2001', 'Lisa Chen', '654 Supply Chain Ave', 'Phoenix', 'AZ', '85001', 'US', '123-45-6789', 30, 10000.00, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Equipment Rental Co', 'accounts@equipmentrental.com', '+1-555-2002', 'David Wilson', '987 Rental Rd', 'Denver', 'CO', '80201', 'US', '987-65-4321', 15, 20000.00, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Professional Services LLC', 'billing@professionalservices.com', '+1-555-2003', 'Emma Davis', '111 Professional Plaza', 'Miami', 'FL', '33101', 'US', '555-66-7777', 30, 15000.00, true, NOW(), NOW());

-- Insert Items
INSERT INTO items (id, organization_id, item_code, name, description, type, unit_price, cost_price, quantity_on_hand, sales_account_id, purchase_account_id, tax_rate_id, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'PROD001', 'Widget A', 'Standard Widget Model A', 'product', 125.00, 75.00, 250, 'a4100000-0000-0000-0000-000000000001', 'a5100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440010', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'PROD002', 'Widget B', 'Premium Widget Model B', 'product', 185.00, 110.00, 150, 'a4100000-0000-0000-0000-000000000001', 'a5100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440010', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'SERV001', 'Consulting Services', 'Professional consulting services', 'service', 150.00, 0.00, 0, 'a4200000-0000-0000-0000-000000000001', 'a5200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440014', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', 'SERV002', 'Installation Service', 'Product installation service', 'service', 95.00, 0.00, 0, 'a4200000-0000-0000-0000-000000000001', 'a5200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440010', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440000', 'PROD003', 'Accessory Kit', 'Widget accessory kit', 'product', 45.00, 28.00, 500, 'a4100000-0000-0000-0000-000000000001', 'a5100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440010', true, NOW(), NOW());

-- Display summary of inserted data
SELECT 
    'Data Summary' as section,
    (SELECT COUNT(*) FROM organizations) as organizations,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM accounts) as accounts,
    (SELECT COUNT(*) FROM contacts) as contacts,
    (SELECT COUNT(*) FROM tax_rates) as tax_rates,
    (SELECT COUNT(*) FROM items) as items;