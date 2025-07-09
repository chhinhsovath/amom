-- Comprehensive Seed Data for Money App
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
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Emily', 'Davis', 'admin@testcompany.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true, NOW(), NOW());

-- Insert Chart of Accounts (Standard US Chart of Accounts)
INSERT INTO accounts (id, organization_id, code, name, type, parent_account_id, description, balance, is_active, created_at, updated_at) VALUES
-- ASSETS
('a1000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1000', 'ASSETS', 'asset', NULL, 'Total Assets', 0.00, true, NOW(), NOW()),
('a1100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1100', 'Current Assets', 'asset', 'a1000000-0000-0000-0000-000000000001', 'Current Assets', 0.00, true, NOW(), NOW()),
('a1110000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1110', 'Cash and Cash Equivalents', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Cash and Cash Equivalents', 25000.00, true, NOW(), NOW()),
('a1111000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1111', 'Petty Cash', 'asset', 'a1110000-0000-0000-0000-000000000001', 'Petty Cash Fund', 500.00, true, NOW(), NOW()),
('a1112000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1112', 'Checking Account - Main', 'asset', 'a1110000-0000-0000-0000-000000000001', 'Primary Business Checking', 22000.00, true, NOW(), NOW()),
('a1113000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1113', 'Savings Account', 'asset', 'a1110000-0000-0000-0000-000000000001', 'Business Savings Account', 15000.00, true, NOW(), NOW()),
('a1114000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1114', 'Money Market Account', 'asset', 'a1110000-0000-0000-0000-000000000001', 'Money Market Investment', 8000.00, true, NOW(), NOW()),
('a1120000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1120', 'Accounts Receivable', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Accounts Receivable', 18500.00, true, NOW(), NOW()),
('a1130000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1130', 'Inventory', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Inventory Asset', 12000.00, true, NOW(), NOW()),
('a1140000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1140', 'Prepaid Expenses', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Prepaid Expenses', 3200.00, true, NOW(), NOW()),
('a1150000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1150', 'Other Current Assets', 'asset', 'a1100000-0000-0000-0000-000000000001', 'Other Current Assets', 1800.00, true, NOW(), NOW()),

-- FIXED ASSETS
('a1200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1200', 'Fixed Assets', 'asset', 'a1000000-0000-0000-0000-000000000001', 'Fixed Assets', 0.00, true, NOW(), NOW()),
('a1210000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1210', 'Equipment', 'asset', 'a1200000-0000-0000-0000-000000000001', 'Equipment', 45000.00, true, NOW(), NOW()),
('a1220000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1220', 'Accumulated Depreciation - Equipment', 'asset', 'a1200000-0000-0000-0000-000000000001', 'Accumulated Depreciation - Equipment', -12000.00, true, NOW(), NOW()),
('a1230000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1230', 'Furniture & Fixtures', 'asset', 'a1200000-0000-0000-0000-000000000001', 'Furniture & Fixtures', 8500.00, true, NOW(), NOW()),
('a1240000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1240', 'Accumulated Depreciation - Furniture', 'asset', 'a1200000-0000-0000-0000-000000000001', 'Accumulated Depreciation - Furniture', -2500.00, true, NOW(), NOW()),

-- LIABILITIES
('a2000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2000', 'LIABILITIES', 'liability', NULL, 'Total Liabilities', 0.00, true, NOW(), NOW()),
('a2100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2100', 'Current Liabilities', 'liability', 'a2000000-0000-0000-0000-000000000001', 'Current Liabilities', 0.00, true, NOW(), NOW()),
('a2110000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2110', 'Accounts Payable', 'liability', 'a2100000-0000-0000-0000-000000000001', 'Accounts Payable', 8500.00, true, NOW(), NOW()),
('a2120000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2120', 'Sales Tax Payable', 'liability', 'a2100000-0000-0000-0000-000000000001', 'Sales Tax Payable', 1200.00, true, NOW(), NOW()),
('a2130000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2130', 'Payroll Liabilities', 'liability', 'a2100000-0000-0000-0000-000000000001', 'Payroll Liabilities', 2800.00, true, NOW(), NOW()),
('a2140000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2140', 'Income Tax Payable', 'liability', 'a2100000-0000-0000-0000-000000000001', 'Income Tax Payable', 3500.00, true, NOW(), NOW()),
('a2150000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2150', 'Accrued Expenses', 'liability', 'a2100000-0000-0000-0000-000000000001', 'Accrued Expenses', 1800.00, true, NOW(), NOW()),

-- LONG-TERM LIABILITIES
('a2200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2200', 'Long-term Liabilities', 'liability', 'a2000000-0000-0000-0000-000000000001', 'Long-term Liabilities', 0.00, true, NOW(), NOW()),
('a2210000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2210', 'Notes Payable', 'liability', 'a2200000-0000-0000-0000-000000000001', 'Notes Payable', 25000.00, true, NOW(), NOW()),
('a2220000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '2220', 'Equipment Loan', 'liability', 'a2200000-0000-0000-0000-000000000001', 'Equipment Loan', 18000.00, true, NOW(), NOW()),

-- EQUITY
('a3000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '3000', 'EQUITY', 'equity', NULL, 'Total Equity', 0.00, true, NOW(), NOW()),
('a3100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '3100', 'Owner''s Equity', 'equity', 'a3000000-0000-0000-0000-000000000001', 'Owner''s Equity', 50000.00, true, NOW(), NOW()),
('a3200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '3200', 'Retained Earnings', 'equity', 'a3000000-0000-0000-0000-000000000001', 'Retained Earnings', 28000.00, true, NOW(), NOW()),
('a3300000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '3300', 'Current Year Earnings', 'equity', 'a3000000-0000-0000-0000-000000000001', 'Current Year Earnings', 0.00, true, NOW(), NOW()),

-- REVENUE
('a4000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '4000', 'REVENUE', 'revenue', NULL, 'Total Revenue', 0.00, true, NOW(), NOW()),
('a4100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '4100', 'Sales Revenue', 'revenue', 'a4000000-0000-0000-0000-000000000001', 'Sales Revenue', -125000.00, true, NOW(), NOW()),
('a4200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '4200', 'Service Revenue', 'revenue', 'a4000000-0000-0000-0000-000000000001', 'Service Revenue', -85000.00, true, NOW(), NOW()),
('a4300000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '4300', 'Other Revenue', 'revenue', 'a4000000-0000-0000-0000-000000000001', 'Other Revenue', -3500.00, true, NOW(), NOW()),

-- EXPENSES
('a5000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5000', 'EXPENSES', 'expense', NULL, 'Total Expenses', 0.00, true, NOW(), NOW()),
('a5100000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5100', 'Cost of Goods Sold', 'expense', 'a5000000-0000-0000-0000-000000000001', 'Cost of Goods Sold', 68000.00, true, NOW(), NOW()),
('a5200000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5200', 'Operating Expenses', 'expense', 'a5000000-0000-0000-0000-000000000001', 'Operating Expenses', 0.00, true, NOW(), NOW()),
('a5210000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5210', 'Rent Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Rent Expense', 18000.00, true, NOW(), NOW()),
('a5220000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5220', 'Utilities Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Utilities Expense', 3600.00, true, NOW(), NOW()),
('a5230000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5230', 'Insurance Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Insurance Expense', 4800.00, true, NOW(), NOW()),
('a5240000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5240', 'Office Supplies Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Office Supplies Expense', 2400.00, true, NOW(), NOW()),
('a5250000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5250', 'Professional Services', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Professional Services', 8500.00, true, NOW(), NOW()),
('a5260000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5260', 'Marketing Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Marketing Expense', 5200.00, true, NOW(), NOW()),
('a5270000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5270', 'Travel Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Travel Expense', 3800.00, true, NOW(), NOW()),
('a5280000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5280', 'Depreciation Expense', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Depreciation Expense', 6000.00, true, NOW(), NOW()),
('a5290000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '5290', 'Bank Fees', 'expense', 'a5200000-0000-0000-0000-000000000001', 'Bank Fees', 480.00, true, NOW(), NOW());

-- Insert Tax Rates
INSERT INTO tax_rates (id, organization_id, name, rate, type, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Sales Tax', 8.25, 'sales', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'GST', 10.00, 'both', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'HST', 13.00, 'both', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'VAT', 15.00, 'both', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'No Tax', 0.00, 'both', true, NOW(), NOW());

-- Insert Contacts (Customers and Suppliers)
INSERT INTO contacts (id, organization_id, name, type, email, phone, address, city, state, postal_code, country, tax_number, credit_limit, payment_terms, notes, is_active, created_at, updated_at) VALUES
-- CUSTOMERS
('c1000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'ABC Corporation', 'customer', 'billing@abccorp.com', '+1-555-0101', '100 Main Street', 'New York', 'NY', '10001', 'US', '12-3456789', 50000.00, 30, 'Long-term customer, reliable payments', true, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'XYZ Industries', 'customer', 'accounts@xyzind.com', '+1-555-0102', '200 Business Ave', 'Chicago', 'IL', '60601', 'US', '98-7654321', 25000.00, 15, 'New customer, requires credit check', true, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'Global Solutions Ltd', 'customer', 'finance@globalsol.com', '+1-555-0103', '300 Corporate Blvd', 'Los Angeles', 'CA', '90210', 'US', '45-6789012', 75000.00, 45, 'Premium customer, extended terms', true, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'Tech Innovations Inc', 'customer', 'billing@techinno.com', '+1-555-0104', '400 Innovation Dr', 'Austin', 'TX', '73301', 'US', '78-9012345', 30000.00, 20, 'Tech startup, growing rapidly', true, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'Retail Partners Co', 'customer', 'ap@retailpartners.com', '+1-555-0105', '500 Retail Row', 'Miami', 'FL', '33101', 'US', '23-4567890', 40000.00, 30, 'Retail chain, seasonal fluctuations', true, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', 'Manufacturing Corp', 'customer', 'procurement@mfgcorp.com', '+1-555-0106', '600 Industrial Way', 'Detroit', 'MI', '48201', 'US', '34-5678901', 60000.00, 45, 'Large manufacturer, bulk orders', true, NOW(), NOW()),

-- SUPPLIERS
('c2000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'Office Supplies Plus', 'supplier', 'orders@officesupplies.com', '+1-555-0201', '1000 Supply Street', 'Denver', 'CO', '80201', 'US', '11-2233445', 0.00, 30, 'Office supplies and equipment', true, NOW(), NOW()),
('c2000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'Tech Solutions Ltd', 'supplier', 'billing@techsolutions.com', '+1-555-0202', '2000 Technology Blvd', 'Seattle', 'WA', '98101', 'US', '22-3344556', 0.00, 15, 'IT services and software', true, NOW(), NOW()),
('c2000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'Professional Services Group', 'supplier', 'invoices@profservices.com', '+1-555-0203', '3000 Professional Plaza', 'Boston', 'MA', '02101', 'US', '33-4455667', 0.00, 20, 'Legal and consulting services', true, NOW(), NOW()),
('c2000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'Utility Services Inc', 'supplier', 'billing@utilityservices.com', '+1-555-0204', '4000 Utility Ave', 'Phoenix', 'AZ', '85001', 'US', '44-5566778', 0.00, 10, 'Electricity and water services', true, NOW(), NOW()),
('c2000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'Raw Materials Supplier', 'supplier', 'sales@rawmaterials.com', '+1-555-0205', '5000 Materials Way', 'Houston', 'TX', '77001', 'US', '55-6677889', 0.00, 45, 'Manufacturing raw materials', true, NOW(), NOW()),
('c2000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', 'Logistics Partners', 'supplier', 'billing@logistics.com', '+1-555-0206', '6000 Shipping Lane', 'Atlanta', 'GA', '30301', 'US', '66-7788990', 0.00, 30, 'Shipping and logistics', true, NOW(), NOW());

-- Insert Items (Products and Services)
INSERT INTO items (id, organization_id, item_code, name, description, type, unit_price, purchase_price, quantity_on_hand, revenue_account_id, expense_account_id, is_active, created_at, updated_at) VALUES
-- PRODUCTS
('i1000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'PROD001', 'Premium Widget', 'High-quality widget for industrial use', 'product', 149.99, 89.99, 150, 'a4100000-0000-0000-0000-000000000001', 'a5100000-0000-0000-0000-000000000001', true, NOW(), NOW()),
('i1000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'PROD002', 'Standard Widget', 'Standard widget for general use', 'product', 89.99, 54.99, 250, 'a4100000-0000-0000-0000-000000000001', 'a5100000-0000-0000-0000-000000000001', true, NOW(), NOW()),
('i1000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'PROD003', 'Economy Widget', 'Basic widget for budget-conscious customers', 'product', 49.99, 29.99, 300, 'a4100000-0000-0000-0000-000000000001', 'a5100000-0000-0000-0000-000000000001', true, NOW(), NOW()),
('i1000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'PROD004', 'Widget Pro Max', 'Professional-grade widget with advanced features', 'product', 299.99, 179.99, 75, 'a4100000-0000-0000-0000-000000000001', 'a5100000-0000-0000-0000-000000000001', true, NOW(), NOW()),
('i1000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'PROD005', 'Widget Accessories Kit', 'Complete accessory kit for widgets', 'product', 79.99, 39.99, 200, 'a4100000-0000-0000-0000-000000000001', 'a5100000-0000-0000-0000-000000000001', true, NOW(), NOW()),

-- SERVICES
('i2000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'SERV001', 'Consulting Services', 'Professional consulting services per hour', 'service', 125.00, 0.00, 0, 'a4200000-0000-0000-0000-000000000001', 'a5200000-0000-0000-0000-000000000001', true, NOW(), NOW()),
('i2000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'SERV002', 'Installation Service', 'Professional installation service', 'service', 200.00, 0.00, 0, 'a4200000-0000-0000-0000-000000000001', 'a5200000-0000-0000-0000-000000000001', true, NOW(), NOW()),
('i2000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'SERV003', 'Maintenance Service', 'Regular maintenance service contract', 'service', 150.00, 0.00, 0, 'a4200000-0000-0000-0000-000000000001', 'a5200000-0000-0000-0000-000000000001', true, NOW(), NOW()),
('i2000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'SERV004', 'Training Workshop', 'Professional training workshop per day', 'service', 850.00, 0.00, 0, 'a4200000-0000-0000-0000-000000000001', 'a5200000-0000-0000-0000-000000000001', true, NOW(), NOW()),
('i2000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'SERV005', 'Technical Support', 'Technical support services per hour', 'service', 95.00, 0.00, 0, 'a4200000-0000-0000-0000-000000000001', 'a5200000-0000-0000-0000-000000000001', true, NOW(), NOW());

-- Insert Invoices with realistic data
INSERT INTO invoices (id, organization_id, invoice_number, contact_id, contact_name, issue_date, due_date, status, subtotal, tax_amount, total, paid_amount, notes, terms, created_at, updated_at) VALUES
('inv00001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'INV-2025-001', 'c1000000-0000-0000-0000-000000000001', 'ABC Corporation', '2025-01-01', '2025-01-31', 'sent', 2249.97, 185.62, 2435.59, 0.00, 'First invoice of 2025', 'Payment due within 30 days', NOW(), NOW()),
('inv00002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'INV-2025-002', 'c1000000-0000-0000-0000-000000000002', 'XYZ Industries', '2025-01-03', '2025-01-18', 'paid', 1800.00, 148.50, 1948.50, 1948.50, 'Quick payment received', 'Payment due within 15 days', NOW(), NOW()),
('inv00003-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'INV-2025-003', 'c1000000-0000-0000-0000-000000000003', 'Global Solutions Ltd', '2025-01-05', '2025-02-19', 'sent', 5250.00, 433.13, 5683.13, 0.00, 'Large order for Q1', 'Payment due within 45 days', NOW(), NOW()),
('inv00004-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'INV-2025-004', 'c1000000-0000-0000-0000-000000000004', 'Tech Innovations Inc', '2025-01-07', '2025-01-27', 'overdue', 3200.00, 264.00, 3464.00, 0.00, 'Follow up required', 'Payment due within 20 days', NOW(), NOW()),
('inv00005-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'INV-2025-005', 'c1000000-0000-0000-0000-000000000005', 'Retail Partners Co', '2025-01-10', '2025-02-09', 'sent', 4500.00, 371.25, 4871.25, 0.00, 'Monthly order', 'Payment due within 30 days', NOW(), NOW()),
('inv00006-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', 'INV-2025-006', 'c1000000-0000-0000-0000-000000000006', 'Manufacturing Corp', '2025-01-12', '2025-02-26', 'draft', 8750.00, 721.88, 9471.88, 0.00, 'Bulk order - review pricing', 'Payment due within 45 days', NOW(), NOW());

-- Insert Invoice Line Items
INSERT INTO invoice_line_items (id, invoice_id, item_id, account_id, description, quantity, unit_price, line_total, tax_rate_id, tax_amount, created_at) VALUES
-- INV-2025-001 Line Items
('il100001-0000-0000-0000-000000000001', 'inv00001-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000001', 'a4100000-0000-0000-0000-000000000001', 'Premium Widget', 5.00, 149.99, 749.95, 't1000000-0000-0000-0000-000000000001', 61.87, NOW()),
('il100001-0000-0000-0000-000000000002', 'inv00001-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000002', 'a4100000-0000-0000-0000-000000000001', 'Standard Widget', 10.00, 89.99, 899.90, 't1000000-0000-0000-0000-000000000001', 74.24, NOW()),
('il100001-0000-0000-0000-000000000003', 'inv00001-0000-0000-0000-000000000001', 'i2000000-0000-0000-0000-000000000002', 'a4200000-0000-0000-0000-000000000001', 'Installation Service', 3.00, 200.00, 600.00, 't1000000-0000-0000-0000-000000000001', 49.50, NOW()),

-- INV-2025-002 Line Items
('il100002-0000-0000-0000-000000000001', 'inv00002-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000003', 'a4100000-0000-0000-0000-000000000001', 'Economy Widget', 20.00, 49.99, 999.80, 't1000000-0000-0000-0000-000000000001', 82.48, NOW()),
('il100002-0000-0000-0000-000000000002', 'inv00002-0000-0000-0000-000000000002', 'i2000000-0000-0000-0000-000000000001', 'a4200000-0000-0000-0000-000000000001', 'Consulting Services', 6.40, 125.00, 800.00, 't1000000-0000-0000-0000-000000000001', 66.00, NOW()),

-- INV-2025-003 Line Items
('il100003-0000-0000-0000-000000000001', 'inv00003-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000004', 'a4100000-0000-0000-0000-000000000001', 'Widget Pro Max', 15.00, 299.99, 4499.85, 't1000000-0000-0000-0000-000000000001', 371.24, NOW()),
('il100003-0000-0000-0000-000000000002', 'inv00003-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000005', 'a4100000-0000-0000-0000-000000000001', 'Widget Accessories Kit', 5.00, 79.99, 399.95, 't1000000-0000-0000-0000-000000000001', 32.99, NOW()),
('il100003-0000-0000-0000-000000000003', 'inv00003-0000-0000-0000-000000000003', 'i2000000-0000-0000-0000-000000000003', 'a4200000-0000-0000-0000-000000000001', 'Maintenance Service', 2.33, 150.00, 350.00, 't1000000-0000-0000-0000-000000000001', 28.88, NOW());

-- Insert Bills
INSERT INTO bills (id, organization_id, bill_number, contact_id, contact_name, issue_date, due_date, status, subtotal, tax_amount, total, paid_amount, notes, created_at, updated_at) VALUES
('bill0001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2025-001', 'c2000000-0000-0000-0000-000000000001', 'Office Supplies Plus', '2025-01-02', '2025-02-01', 'approved', 850.00, 70.13, 920.13, 0.00, 'Monthly office supplies', NOW(), NOW()),
('bill0002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2025-002', 'c2000000-0000-0000-0000-000000000002', 'Tech Solutions Ltd', '2025-01-04', '2025-01-19', 'paid', 2400.00, 198.00, 2598.00, 2598.00, 'IT services for January', NOW(), NOW()),
('bill0003-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2025-003', 'c2000000-0000-0000-0000-000000000003', 'Professional Services Group', '2025-01-06', '2025-01-26', 'approved', 3200.00, 264.00, 3464.00, 0.00, 'Legal consultation', NOW(), NOW()),
('bill0004-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2025-004', 'c2000000-0000-0000-0000-000000000004', 'Utility Services Inc', '2025-01-08', '2025-01-18', 'paid', 650.00, 53.63, 703.63, 703.63, 'Monthly utilities', NOW(), NOW()),
('bill0005-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2025-005', 'c2000000-0000-0000-0000-000000000005', 'Raw Materials Supplier', '2025-01-11', '2025-02-25', 'draft', 5800.00, 478.50, 6278.50, 0.00, 'Raw materials for production', NOW(), NOW());

-- Insert Bill Line Items
INSERT INTO bill_line_items (id, bill_id, account_id, description, quantity, unit_price, line_total, tax_rate_id, tax_amount, created_at) VALUES
-- BILL-2025-001 Line Items
('bl100001-0000-0000-0000-000000000001', 'bill0001-0000-0000-0000-000000000001', 'a5240000-0000-0000-0000-000000000001', 'Office Paper and Supplies', 1.00, 450.00, 450.00, 't1000000-0000-0000-0000-000000000001', 37.13, NOW()),
('bl100001-0000-0000-0000-000000000002', 'bill0001-0000-0000-0000-000000000001', 'a5240000-0000-0000-0000-000000000001', 'Printer Cartridges', 1.00, 400.00, 400.00, 't1000000-0000-0000-0000-000000000001', 33.00, NOW()),

-- BILL-2025-002 Line Items
('bl100002-0000-0000-0000-000000000001', 'bill0002-0000-0000-0000-000000000002', 'a5250000-0000-0000-0000-000000000001', 'IT Support Services', 16.00, 150.00, 2400.00, 't1000000-0000-0000-0000-000000000001', 198.00, NOW()),

-- BILL-2025-003 Line Items
('bl100003-0000-0000-0000-000000000001', 'bill0003-0000-0000-0000-000000000003', 'a5250000-0000-0000-0000-000000000001', 'Legal Consultation', 8.00, 400.00, 3200.00, 't1000000-0000-0000-0000-000000000001', 264.00, NOW());

-- Insert Journal Entries
INSERT INTO journal_entries (id, organization_id, entry_number, date, description, reference, total_amount, status, created_by, created_at, updated_at) VALUES
('je100001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'JE-2025-001', '2025-01-01', 'Opening Balance Entry', 'OPENING', 103000.00, 'posted', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('je100002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', 'JE-2025-002', '2025-01-15', 'Depreciation Entry - January', 'DEP-JAN', 1500.00, 'posted', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('je100003-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', 'JE-2025-003', '2025-01-31', 'Accrued Interest Entry', 'INT-JAN', 500.00, 'posted', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('je100004-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', 'JE-2025-004', '2025-02-01', 'Prepaid Insurance Adjustment', 'PREPAID', 400.00, 'posted', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW());

-- Insert Journal Entry Lines
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit_amount, credit_amount, description, reference, contact_id, created_at) VALUES
-- JE-2025-001 Opening Balance Entry
('jel10001-0000-0000-0000-000000000001', 'je100001-0000-0000-0000-000000000001', 'a1112000-0000-0000-0000-000000000001', 22000.00, 0.00, 'Opening balance - Checking Account', 'OPENING', NULL, NOW()),
('jel10001-0000-0000-0000-000000000002', 'je100001-0000-0000-0000-000000000001', 'a1113000-0000-0000-0000-000000000001', 15000.00, 0.00, 'Opening balance - Savings Account', 'OPENING', NULL, NOW()),
('jel10001-0000-0000-0000-000000000003', 'je100001-0000-0000-0000-000000000001', 'a1120000-0000-0000-0000-000000000001', 18500.00, 0.00, 'Opening balance - Accounts Receivable', 'OPENING', NULL, NOW()),
('jel10001-0000-0000-0000-000000000004', 'je100001-0000-0000-0000-000000000001', 'a1210000-0000-0000-0000-000000000001', 45000.00, 0.00, 'Opening balance - Equipment', 'OPENING', NULL, NOW()),
('jel10001-0000-0000-0000-000000000005', 'je100001-0000-0000-0000-000000000001', 'a1220000-0000-0000-0000-000000000001', 0.00, 12000.00, 'Opening balance - Accumulated Depreciation', 'OPENING', NULL, NOW()),
('jel10001-0000-0000-0000-000000000006', 'je100001-0000-0000-0000-000000000001', 'a2110000-0000-0000-0000-000000000001', 0.00, 8500.00, 'Opening balance - Accounts Payable', 'OPENING', NULL, NOW()),
('jel10001-0000-0000-0000-000000000007', 'je100001-0000-0000-0000-000000000001', 'a2210000-0000-0000-0000-000000000001', 0.00, 25000.00, 'Opening balance - Notes Payable', 'OPENING', NULL, NOW()),
('jel10001-0000-0000-0000-000000000008', 'je100001-0000-0000-0000-000000000001', 'a3100000-0000-0000-0000-000000000001', 0.00, 50000.00, 'Opening balance - Owner Equity', 'OPENING', NULL, NOW()),
('jel10001-0000-0000-0000-000000000009', 'je100001-0000-0000-0000-000000000001', 'a3200000-0000-0000-0000-000000000001', 0.00, 6000.00, 'Opening balance - Retained Earnings', 'OPENING', NULL, NOW()),

-- JE-2025-002 Depreciation Entry
('jel10002-0000-0000-0000-000000000001', 'je100002-0000-0000-0000-000000000002', 'a5280000-0000-0000-0000-000000000001', 1500.00, 0.00, 'Monthly depreciation expense', 'DEP-JAN', NULL, NOW()),
('jel10002-0000-0000-0000-000000000002', 'je100002-0000-0000-0000-000000000002', 'a1220000-0000-0000-0000-000000000001', 0.00, 1000.00, 'Accumulated depreciation - Equipment', 'DEP-JAN', NULL, NOW()),
('jel10002-0000-0000-0000-000000000003', 'je100002-0000-0000-0000-000000000002', 'a1240000-0000-0000-0000-000000000001', 0.00, 500.00, 'Accumulated depreciation - Furniture', 'DEP-JAN', NULL, NOW()),

-- JE-2025-003 Accrued Interest Entry
('jel10003-0000-0000-0000-000000000001', 'je100003-0000-0000-0000-000000000003', 'a5290000-0000-0000-0000-000000000001', 500.00, 0.00, 'Interest expense on notes payable', 'INT-JAN', NULL, NOW()),
('jel10003-0000-0000-0000-000000000002', 'je100003-0000-0000-0000-000000000003', 'a2150000-0000-0000-0000-000000000001', 0.00, 500.00, 'Accrued interest payable', 'INT-JAN', NULL, NOW()),

-- JE-2025-004 Prepaid Insurance Adjustment
('jel10004-0000-0000-0000-000000000001', 'je100004-0000-0000-0000-000000000004', 'a5230000-0000-0000-0000-000000000001', 400.00, 0.00, 'Insurance expense for January', 'PREPAID', NULL, NOW()),
('jel10004-0000-0000-0000-000000000002', 'je100004-0000-0000-0000-000000000004', 'a1140000-0000-0000-0000-000000000001', 0.00, 400.00, 'Prepaid insurance adjustment', 'PREPAID', NULL, NOW());

-- Insert Audit Log entries
INSERT INTO audit_logs (id, organization_id, user_id, entity_type, entity_id, action, changes, created_at) VALUES
('audit001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Invoice', 'inv00001-0000-0000-0000-000000000001', 'create', '{"invoice_number": "INV-2025-001", "total": 2435.59}', NOW()),
('audit002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Invoice', 'inv00002-0000-0000-0000-000000000002', 'update', '{"status": "paid", "paid_amount": 1948.50}', NOW()),
('audit003-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Bill', 'bill0001-0000-0000-0000-000000000001', 'create', '{"bill_number": "BILL-2025-001", "total": 920.13}', NOW()),
('audit004-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Account', 'a1112000-0000-0000-0000-000000000001', 'update', '{"balance": 22000.00}', NOW()),
('audit005-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'JournalEntry', 'je100001-0000-0000-0000-000000000001', 'create', '{"entry_number": "JE-2025-001", "description": "Opening Balance Entry"}', NOW());

-- Update sequences to ensure proper continuation
-- Note: PostgreSQL with UUID doesn't typically use sequences, but if you're using SERIAL columns, adjust accordingly

-- Display summary of inserted data
SELECT 
    'Data Summary' as section,
    (SELECT COUNT(*) FROM organizations) as organizations,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM accounts) as accounts,
    (SELECT COUNT(*) FROM contacts) as contacts,
    (SELECT COUNT(*) FROM tax_rates) as tax_rates,
    (SELECT COUNT(*) FROM items) as items,
    (SELECT COUNT(*) FROM invoices) as invoices,
    (SELECT COUNT(*) FROM bills) as bills,
    (SELECT COUNT(*) FROM journal_entries) as journal_entries,
    (SELECT COUNT(*) FROM audit_logs) as audit_logs;