-- Cheques Management Schema
-- This creates tables for managing cheques including cheque books, individual cheques, and transactions

-- Create cheque_books table
CREATE TABLE IF NOT EXISTS cheque_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    bank_account_id UUID NOT NULL,
    book_number VARCHAR(50) NOT NULL,
    starting_cheque_number INTEGER NOT NULL,
    ending_cheque_number INTEGER NOT NULL,
    current_cheque_number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'lost')),
    issue_date DATE NOT NULL,
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    routing_number VARCHAR(50),
    account_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_cheque_books_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_cheque_books_account FOREIGN KEY (bank_account_id) REFERENCES accounts(id),
    
    -- Unique constraints
    CONSTRAINT uq_cheque_books_org_book UNIQUE (organization_id, book_number),
    
    -- Check constraints
    CONSTRAINT chk_cheque_numbers CHECK (ending_cheque_number > starting_cheque_number),
    CONSTRAINT chk_current_cheque_number CHECK (current_cheque_number >= starting_cheque_number AND current_cheque_number <= ending_cheque_number)
);

-- Create cheques table
CREATE TABLE IF NOT EXISTS cheques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    cheque_book_id UUID NOT NULL,
    cheque_number INTEGER NOT NULL,
    payee_name VARCHAR(255) NOT NULL,
    payee_contact_id UUID,
    amount DECIMAL(15,2) NOT NULL,
    amount_in_words TEXT NOT NULL,
    issue_date DATE NOT NULL,
    memo VARCHAR(255),
    status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'cleared', 'cancelled', 'bounced', 'stopped', 'stale')),
    
    -- Bank details
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    routing_number VARCHAR(50),
    account_number VARCHAR(50),
    
    -- Reference information
    reference_type VARCHAR(50) CHECK (reference_type IN ('bill_payment', 'expense', 'transfer', 'other')),
    reference_id UUID,
    reference_number VARCHAR(100),
    
    -- Clearing information
    cleared_date DATE,
    clearing_bank VARCHAR(255),
    
    -- Accounting integration
    journal_entry_id UUID,
    expense_account_id UUID,
    
    -- Metadata
    created_by UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_cheques_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_cheques_cheque_book FOREIGN KEY (cheque_book_id) REFERENCES cheque_books(id),
    CONSTRAINT fk_cheques_payee_contact FOREIGN KEY (payee_contact_id) REFERENCES contacts(id),
    CONSTRAINT fk_cheques_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_cheques_expense_account FOREIGN KEY (expense_account_id) REFERENCES accounts(id),
    
    -- Unique constraints
    CONSTRAINT uq_cheques_book_number UNIQUE (cheque_book_id, cheque_number),
    
    -- Check constraints
    CONSTRAINT chk_cheques_amount CHECK (amount > 0),
    CONSTRAINT chk_cheques_cleared_date CHECK (cleared_date IS NULL OR cleared_date >= issue_date)
);

-- Create cheque_transactions table for tracking cheque lifecycle
CREATE TABLE IF NOT EXISTS cheque_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cheque_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('issued', 'cleared', 'bounced', 'cancelled', 'stopped', 'reissued')),
    transaction_date DATE NOT NULL,
    amount DECIMAL(15,2),
    bank_reference VARCHAR(100),
    notes TEXT,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_cheque_transactions_cheque FOREIGN KEY (cheque_id) REFERENCES cheques(id),
    CONSTRAINT fk_cheque_transactions_processed_by FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cheque_books_organization ON cheque_books(organization_id);
CREATE INDEX IF NOT EXISTS idx_cheque_books_bank_account ON cheque_books(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_cheque_books_status ON cheque_books(status);

CREATE INDEX IF NOT EXISTS idx_cheques_organization ON cheques(organization_id);
CREATE INDEX IF NOT EXISTS idx_cheques_cheque_book ON cheques(cheque_book_id);
CREATE INDEX IF NOT EXISTS idx_cheques_payee_contact ON cheques(payee_contact_id);
CREATE INDEX IF NOT EXISTS idx_cheques_status ON cheques(status);
CREATE INDEX IF NOT EXISTS idx_cheques_issue_date ON cheques(issue_date);
CREATE INDEX IF NOT EXISTS idx_cheques_amount ON cheques(amount);
CREATE INDEX IF NOT EXISTS idx_cheques_reference ON cheques(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_cheque_transactions_cheque ON cheque_transactions(cheque_id);
CREATE INDEX IF NOT EXISTS idx_cheque_transactions_type ON cheque_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_cheque_transactions_date ON cheque_transactions(transaction_date);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cheque_books_updated_at BEFORE UPDATE ON cheque_books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cheques_updated_at BEFORE UPDATE ON cheques
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO cheque_books (id, organization_id, bank_account_id, book_number, starting_cheque_number, ending_cheque_number, current_cheque_number, status, issue_date, bank_name, branch_name, routing_number, account_number) VALUES
('cb000001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'a1112000-0000-0000-0000-000000000001', 'CHQ-001', 1001, 1100, 1003, 'active', '2024-01-01', 'First National Bank', 'Main Branch', '021000021', '1234567890'),
('cb000002-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'a1113000-0000-0000-0000-000000000001', 'CHQ-002', 2001, 2100, 2001, 'active', '2024-01-15', 'Second National Bank', 'Business Branch', '021000022', '0987654321');

INSERT INTO cheques (id, organization_id, cheque_book_id, cheque_number, payee_name, payee_contact_id, amount, amount_in_words, issue_date, memo, status, reference_type, reference_number, expense_account_id, created_by) VALUES
('ch000001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'cb000001-0000-0000-0000-000000000001', 1001, 'Office Supplies Plus', '550e8400-e29b-41d4-a716-446655440023', 850.00, 'Eight hundred fifty dollars and 00/100', '2024-01-05', 'Office supplies payment', 'cleared', 'bill_payment', 'BILL-2024-001', 'a5240000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440002'),
('ch000002-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', 'cb000001-0000-0000-0000-000000000001', 1002, 'Equipment Rental Co', '550e8400-e29b-41d4-a716-446655440024', 1200.00, 'One thousand two hundred dollars and 00/100', '2024-01-10', 'Equipment rental payment', 'issued', 'bill_payment', 'BILL-2024-002', 'a5210000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO cheque_transactions (cheque_id, transaction_type, transaction_date, amount, bank_reference, notes, processed_by) VALUES
('ch000001-0000-0000-0000-000000000001', 'issued', '2024-01-05', 850.00, 'ISS-20240105-001', 'Cheque issued for office supplies', '550e8400-e29b-41d4-a716-446655440002'),
('ch000001-0000-0000-0000-000000000001', 'cleared', '2024-01-08', 850.00, 'CLR-20240108-001', 'Cheque cleared successfully', '550e8400-e29b-41d4-a716-446655440002'),
('ch000002-0000-0000-0000-000000000001', 'issued', '2024-01-10', 1200.00, 'ISS-20240110-001', 'Cheque issued for equipment rental', '550e8400-e29b-41d4-a716-446655440002');