// Mock data service for browser-side demo
// In production, this would make API calls to a backend server

const mockData = {
  accounts: [
    { id: '1', code: '1000', name: 'Assets', type: 'asset', balance: 0, is_active: true },
    { id: '2', code: '1110', name: 'Cash and Cash Equivalents', type: 'asset', balance: 10000, is_active: true, parent_account_id: '1' },
    { id: '3', code: '1120', name: 'Accounts Receivable', type: 'asset', balance: 5000, is_active: true, parent_account_id: '1' },
    { id: '4', code: '1130', name: 'Inventory', type: 'asset', balance: 8000, is_active: true, parent_account_id: '1' },
    { id: '5', code: '2000', name: 'Liabilities', type: 'liability', balance: 0, is_active: true },
    { id: '6', code: '2110', name: 'Accounts Payable', type: 'liability', balance: 3000, is_active: true, parent_account_id: '5' },
    { id: '7', code: '2120', name: 'Sales Tax Payable', type: 'liability', balance: 500, is_active: true, parent_account_id: '5' },
    { id: '8', code: '3000', name: 'Equity', type: 'equity', balance: 0, is_active: true },
    { id: '9', code: '3100', name: 'Owner\'s Equity', type: 'equity', balance: 20000, is_active: true, parent_account_id: '8' },
    { id: '10', code: '4000', name: 'Revenue', type: 'revenue', balance: 0, is_active: true },
    { id: '11', code: '4100', name: 'Sales Revenue', type: 'revenue', balance: 25000, is_active: true, parent_account_id: '10' },
    { id: '12', code: '4200', name: 'Service Revenue', type: 'revenue', balance: 8000, is_active: true, parent_account_id: '10' },
    { id: '13', code: '5000', name: 'Expenses', type: 'expense', balance: 0, is_active: true },
    { id: '14', code: '5100', name: 'Cost of Goods Sold', type: 'expense', balance: 15000, is_active: true, parent_account_id: '13' },
    { id: '15', code: '5200', name: 'Operating Expenses', type: 'expense', balance: 8000, is_active: true, parent_account_id: '13' }
  ],
  
  contacts: [
    { id: '1', name: 'ABC Corporation', type: 'customer', email: 'billing@abccorp.com', is_active: true },
    { id: '2', name: 'XYZ Industries', type: 'customer', email: 'accounts@xyzind.com', is_active: true },
    { id: '3', name: 'Office Supplies Inc', type: 'supplier', email: 'orders@officesupplies.com', is_active: true },
    { id: '4', name: 'Tech Solutions Ltd', type: 'supplier', email: 'billing@techsolutions.com', is_active: true }
  ],
  
  invoices: [
    { 
      id: '1', 
      invoice_number: 'INV-2025-001', 
      contact_id: '1', 
      contact_name: 'ABC Corporation', 
      issue_date: '2025-01-01', 
      due_date: '2025-01-31', 
      status: 'sent', 
      subtotal: 1800.00, 
      tax_amount: 148.50, 
      total: 1948.50,
      created_at: '2025-01-01T10:00:00Z'
    },
    { 
      id: '2', 
      invoice_number: 'INV-2025-002', 
      contact_id: '2', 
      contact_name: 'XYZ Industries', 
      issue_date: '2025-01-05', 
      due_date: '2025-02-04', 
      status: 'draft', 
      subtotal: 2500.00, 
      tax_amount: 206.25, 
      total: 2706.25,
      created_at: '2025-01-05T14:30:00Z'
    }
  ],
  
  bills: [
    { 
      id: '1', 
      bill_number: 'BILL-2025-001', 
      contact_id: '3', 
      contact_name: 'Office Supplies Inc', 
      issue_date: '2025-01-05', 
      due_date: '2025-02-04', 
      status: 'approved', 
      subtotal: 350.00, 
      tax_amount: 28.88, 
      total: 378.88,
      created_at: '2025-01-05T09:15:00Z'
    }
  ],
  
  transactions: [
    {
      id: '1',
      entry_number: 'JE-2025-001',
      date: '2025-01-01',
      description: 'Opening Balance Entry',
      total_amount: 37000.00,
      status: 'posted',
      created_at: '2025-01-01T00:00:00Z'
    }
  ],
  
  taxRates: [
    { id: '1', name: 'Sales Tax', rate: 8.25, type: 'sales', is_active: true },
    { id: '2', name: 'GST', rate: 10.00, type: 'both', is_active: true },
    { id: '3', name: 'No Tax', rate: 0.00, type: 'both', is_active: true }
  ],
  
  items: [
    { id: '1', item_code: 'PROD001', name: 'Professional Service', type: 'service', unit_price: 150.00, is_active: true },
    { id: '2', item_code: 'PROD002', name: 'Software License', type: 'product', unit_price: 1200.00, is_active: true },
    { id: '3', item_code: 'PROD003', name: 'Training Workshop', type: 'service', unit_price: 500.00, is_active: true }
  ]
};

export class MockDataService {
  // Helper to simulate async operations
  static async delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper to filter and sort data
  static filterAndSort(data, filters = {}, options = {}) {
    let filtered = data.filter(item => {
      return Object.keys(filters).every(key => 
        item[key] === filters[key]
      );
    });

    if (options.orderBy) {
      const [field, direction] = options.orderBy.includes(' DESC') 
        ? options.orderBy.split(' DESC') 
        : [options.orderBy, 'ASC'];
      
      filtered.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (aVal < bVal) return direction === 'DESC' ? 1 : -1;
        if (aVal > bVal) return direction === 'DESC' ? -1 : 1;
        return 0;
      });
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  // Account methods
  static async getAccounts(filters = {}, options = {}) {
    await this.delay();
    return this.filterAndSort(mockData.accounts, filters, options);
  }

  // Contact methods
  static async getContacts(filters = {}, options = {}) {
    await this.delay();
    return this.filterAndSort(mockData.contacts, filters, options);
  }

  // Invoice methods
  static async getInvoices(filters = {}, options = {}) {
    await this.delay();
    return this.filterAndSort(mockData.invoices, filters, options);
  }

  // Bill methods
  static async getBills(filters = {}, options = {}) {
    await this.delay();
    return this.filterAndSort(mockData.bills, filters, options);
  }

  // Transaction methods
  static async getTransactions(filters = {}, options = {}) {
    await this.delay();
    return this.filterAndSort(mockData.transactions, filters, options);
  }

  // Tax rate methods
  static async getTaxRates(filters = {}, options = {}) {
    await this.delay();
    return this.filterAndSort(mockData.taxRates, filters, options);
  }

  // Item methods
  static async getItems(filters = {}, options = {}) {
    await this.delay();
    return this.filterAndSort(mockData.items, filters, options);
  }

  // Bank account methods (subset of accounts)
  static async getBankAccounts(filters = {}, options = {}) {
    await this.delay();
    return this.filterAndSort(
      mockData.accounts.filter(acc => acc.code === '1110'), // Cash account
      filters, 
      options
    );
  }

  // Generic create method
  static async create(table, data) {
    await this.delay();
    const newItem = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    if (mockData[table]) {
      mockData[table].push(newItem);
    }
    
    return newItem;
  }

  // Generic update method
  static async update(table, id, data) {
    await this.delay();
    
    if (mockData[table]) {
      const index = mockData[table].findIndex(item => item.id === id);
      if (index !== -1) {
        mockData[table][index] = { ...mockData[table][index], ...data };
        return mockData[table][index];
      }
    }
    
    return null;
  }

  // Generic delete method
  static async delete(table, id) {
    await this.delay();
    
    if (mockData[table]) {
      const index = mockData[table].findIndex(item => item.id === id);
      if (index !== -1) {
        return mockData[table].splice(index, 1)[0];
      }
    }
    
    return null;
  }
}

export default MockDataService;