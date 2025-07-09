import ApiService from './ApiService';

// Real data service using PostgreSQL backend
export class DataService {
  static getCurrentOrganizationId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.organization_id;
  }

  // Account management
  static Account = {
    async list(orderBy = 'code', limit = 100) {
      try {
        return await ApiService.getAccounts({ orderBy, limit, is_active: true });
      } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
      }
    },

    async filter(criteria) {
      try {
        return await ApiService.getAccounts(criteria);
      } catch (error) {
        console.error('Error filtering accounts:', error);
        throw error;
      }
    },

    async findById(id) {
      try {
        return await ApiService.getById('accounts', id);
      } catch (error) {
        console.error('Error fetching account:', error);
        throw error;
      }
    },

    async create(data) {
      return await ApiService.create('accounts', data);
    },

    async update(id, data) {
      return await ApiService.update('accounts', id, data);
    },

    async delete(id) {
      return await ApiService.delete('accounts', id);
    }
  };

  // Contact management
  static Contact = {
    async list(orderBy = 'name', limit = 100) {
      try {
        return await ApiService.getContacts({ orderBy, limit, is_active: true });
      } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }
    },

    async filter(criteria) {
      try {
        return await ApiService.getContacts(criteria);
      } catch (error) {
        console.error('Error filtering contacts:', error);
        throw error;
      }
    },

    async findById(id) {
      try {
        return await ApiService.getById('contacts', id);
      } catch (error) {
        console.error('Error fetching contact:', error);
        throw error;
      }
    },

    async create(data) {
      return await ApiService.create('contacts', data);
    },

    async update(id, data) {
      return await ApiService.update('contacts', id, data);
    },

    async delete(id) {
      return await ApiService.delete('contacts', id);
    }
  };

  // Invoice management
  static Invoice = {
    async list(orderBy = '-created_at', limit = 100) {
      try {
        return await ApiService.getInvoices({ orderBy, limit });
      } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
    },

    async filter(criteria) {
      try {
        return await ApiService.getInvoices(criteria);
      } catch (error) {
        console.error('Error filtering invoices:', error);
        throw error;
      }
    },

    async findById(id) {
      try {
        return await ApiService.getById('invoices', id);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        throw error;
      }
    },

    async create(data) {
      return await ApiService.create('invoices', data);
    },

    async update(id, data) {
      return await ApiService.update('invoices', id, data);
    },

    async delete(id) {
      return await ApiService.delete('invoices', id);
    }
  };

  // Bill management
  static Bill = {
    async list(orderBy = '-created_at', limit = 100) {
      try {
        return await ApiService.getBills({ orderBy, limit });
      } catch (error) {
        console.error('Error fetching bills:', error);
        throw error;
      }
    },

    async filter(criteria) {
      try {
        return await ApiService.getBills(criteria);
      } catch (error) {
        console.error('Error filtering bills:', error);
        throw error;
      }
    },

    async findById(id) {
      try {
        return await ApiService.getById('bills', id);
      } catch (error) {
        console.error('Error fetching bill:', error);
        throw error;
      }
    },

    async create(data) {
      return await ApiService.create('bills', data);
    },

    async update(id, data) {
      return await ApiService.update('bills', id, data);
    },

    async delete(id) {
      return await ApiService.delete('bills', id);
    }
  };

  // Transaction management
  static Transaction = {
    async list(orderBy = '-date', limit = 100) {
      try {
        return await ApiService.getTransactions({ orderBy, limit });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
    },

    async filter(criteria) {
      try {
        return await ApiService.getTransactions(criteria);
      } catch (error) {
        console.error('Error filtering transactions:', error);
        throw error;
      }
    }
  };

  // Tax management
  static Tax = {
    async list(orderBy = 'name', limit = 100) {
      try {
        return await ApiService.getTaxRates({ orderBy, limit, is_active: true });
      } catch (error) {
        console.error('Error fetching tax rates:', error);
        throw error;
      }
    },

    async create(data) {
      return await ApiService.create('taxes', data);
    }
  };

  // Journal Entry management
  static JournalEntry = {
    async list(orderBy = '-date', limit = 100) {
      try {
        return await ApiService.getTransactions({ orderBy, limit, type: 'journal' });
      } catch (error) {
        console.error('Error fetching journal entries:', error);
        throw error;
      }
    },

    async create(data) {
      return await ApiService.create('transactions', data);
    }
  };

  // Item management
  static Item = {
    async list(orderBy = 'item_code', limit = 100) {
      try {
        return await ApiService.getItems({ orderBy, limit, is_active: true });
      } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
      }
    },

    async create(data) {
      return await ApiService.create('items', data);
    }
  };

  // User management
  static User = {
    async me() {
      try {
        return await ApiService.getCurrentUser();
      } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
      }
    },

    logout() {
      ApiService.logout();
    }
  };

  // Template management
  static InvoiceTemplate = {
    async list() {
      // For now, return a default template
      return [{
        id: 'default',
        name: 'Default Template',
        is_default: true
      }];
    }
  };

  // Cheque management
  static Cheque = {
    async list(orderBy = '-issue_date', limit = 100) {
      try {
        return await ApiService.getCheques({ orderBy, limit });
      } catch (error) {
        console.error('Error fetching cheques:', error);
        throw error;
      }
    },

    async create(data) {
      try {
        return await ApiService.create('cheques', data);
      } catch (error) {
        console.error('Error creating cheque:', error);
        throw error;
      }
    },

    async updateStatus(id, statusData) {
      try {
        return await ApiService.updateChequeStatus(id, statusData);
      } catch (error) {
        console.error('Error updating cheque status:', error);
        throw error;
      }
    },

    async getTransactions(id) {
      try {
        return await ApiService.getChequeTransactions(id);
      } catch (error) {
        console.error('Error fetching cheque transactions:', error);
        throw error;
      }
    }
  };

  // Cheque Book management
  static ChequeBook = {
    async list() {
      try {
        return await ApiService.getChequeBooks();
      } catch (error) {
        console.error('Error fetching cheque books:', error);
        throw error;
      }
    },

    async create(data) {
      try {
        return await ApiService.create('cheques/books', data);
      } catch (error) {
        console.error('Error creating cheque book:', error);
        throw error;
      }
    }
  };

  // Bank Account management
  static BankAccount = {
    async list(orderBy = 'code', limit = 100) {
      try {
        return await ApiService.getAccounts({ orderBy, limit, type: 'bank', is_active: true });
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        throw error;
      }
    }
  };

  // Quote management (temporary implementation until backend endpoint is ready)
  static Quote = {
    async list(orderBy = '-created_at', limit = 100) {
      try {
        return await ApiService.getQuotes({ orderBy, limit });
      } catch (error) {
        console.warn('Quotes endpoint not implemented in backend, returning empty array');
        return [];
      }
    },

    async filter(criteria) {
      try {
        return await ApiService.getQuotes(criteria);
      } catch (error) {
        console.warn('Quotes endpoint not implemented in backend, returning empty array');
        return [];
      }
    },

    async findById(id) {
      try {
        return await ApiService.getById('quotes', id);
      } catch (error) {
        console.warn('Quotes endpoint not implemented in backend, returning null');
        return null;
      }
    },

    async create(data) {
      try {
        return await ApiService.create('quotes', data);
      } catch (error) {
        console.error('Cannot create quote - endpoint not implemented in backend');
        throw new Error('Quotes functionality is not yet available. Please contact your administrator.');
      }
    },

    async update(id, data) {
      try {
        return await ApiService.update('quotes', id, data);
      } catch (error) {
        console.error('Cannot update quote - endpoint not implemented in backend');
        throw new Error('Quotes functionality is not yet available. Please contact your administrator.');
      }
    },

    async delete(id) {
      try {
        return await ApiService.delete('quotes', id);
      } catch (error) {
        console.error('Cannot delete quote - endpoint not implemented in backend');
        throw new Error('Quotes functionality is not yet available. Please contact your administrator.');
      }
    }
  };
}

// Export individual entities for compatibility
export const Account = DataService.Account;
export const Contact = DataService.Contact;
export const Invoice = DataService.Invoice;
export const Bill = DataService.Bill;
export const Transaction = DataService.Transaction;
export const JournalEntry = DataService.JournalEntry;
export const Tax = DataService.Tax;
export const BankAccount = DataService.BankAccount;
export const Item = DataService.Item;
export const User = DataService.User;
export const InvoiceTemplate = DataService.InvoiceTemplate;
export const Cheque = DataService.Cheque;
export const ChequeBook = DataService.ChequeBook;
export const Quote = DataService.Quote;

export default DataService;