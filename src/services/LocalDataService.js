import api from './api';
import ClientAuthService from './ClientAuthService';

// Local data service to replace Base44 SDK entities
export class LocalDataService {
  static getCurrentOrganizationId() {
    const user = ClientAuthService.getCurrentUser();
    return user?.organizationId || '550e8400-e29b-41d4-a716-446655440000';
  }

  // Account management
  static Account = {
    async list(orderBy = 'code', limit = 100) {
      try {
        return await api.accounts.list({ orderBy, limit, active: true });
      } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
      }
    },

    async findById(id) {
      try {
        return await api.accounts.get(id);
      } catch (error) {
        console.error('Error fetching account:', error);
        return null;
      }
    },

    async create(data) {
      return await api.accounts.create(data);
    },

    async update(id, data) {
      return await api.accounts.update(id, data);
    },

    async delete(id) {
      return await api.accounts.delete(id);
    }
  };

  // Contact management
  static Contact = {
    async list(orderBy = 'name', limit = 100) {
      try {
        return await api.contacts.list({ orderBy, limit, active: true });
      } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }
    },

    async filter(criteria) {
      try {
        return await api.contacts.list(criteria);
      } catch (error) {
        console.error('Error filtering contacts:', error);
        return [];
      }
    },

    async findById(id) {
      try {
        return await api.contacts.get(id);
      } catch (error) {
        console.error('Error fetching contact:', error);
        return null;
      }
    },

    async create(data) {
      return await api.contacts.create(data);
    },

    async update(id, data) {
      return await api.contacts.update(id, data);
    },

    async delete(id) {
      return await api.contacts.delete(id);
    }
  };

  // Invoice management
  static Invoice = {
    async list(orderBy = '-created_at', limit = 100) {
      try {
        const orderField = orderBy.startsWith('-') ? orderBy.substring(1) + ' DESC' : orderBy;
        return await api.invoices.list({ orderBy: orderField, limit });
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    },

    async findById(id) {
      try {
        return await api.invoices.get(id);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        return null;
      }
    },

    async create(data) {
      return await api.invoices.create(data);
    },

    async update(id, data) {
      return await api.invoices.update(id, data);
    },

    async delete(id) {
      return await api.invoices.delete(id);
    }
  };

  // Bill management
  static Bill = {
    async list(orderBy = '-created_at', limit = 100) {
      try {
        const orderField = orderBy.startsWith('-') ? orderBy.substring(1) + ' DESC' : orderBy;
        return await api.bills.list({ orderBy: orderField, limit });
      } catch (error) {
        console.error('Error fetching bills:', error);
        return [];
      }
    },

    async findById(id) {
      try {
        return await api.bills.get(id);
      } catch (error) {
        console.error('Error fetching bill:', error);
        return null;
      }
    },

    async create(data) {
      return await api.bills.create(data);
    },

    async update(id, data) {
      return await api.bills.update(id, data);
    },

    async delete(id) {
      return await api.bills.delete(id);
    }
  };

  // Transaction management
  static Transaction = {
    async list(orderBy = '-date', limit = 100) {
      try {
        return await api.transactions.list({ orderBy, limit });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    },

    async filter(criteria) {
      try {
        return await api.transactions.list(criteria);
      } catch (error) {
        console.error('Error filtering transactions:', error);
        return [];
      }
    }
  };

  // Tax management
  static Tax = {
    async list(orderBy = 'name', limit = 100) {
      try {
        return await api.taxes.list({ orderBy, limit, active: true });
      } catch (error) {
        console.error('Error fetching tax rates:', error);
        return [];
      }
    },

    async create(data) {
      return await api.taxes.create(data);
    }
  };

  // Journal Entry management
  static JournalEntry = {
    async list(orderBy = '-date', limit = 100) {
      try {
        return await api.transactions.list({ orderBy, limit });
      } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }
    },

    async create(data) {
      return await api.transactions.createJournalEntry(data);
    }
  };

  // Bank Account management
  static BankAccount = {
    async list(orderBy = 'code', limit = 100) {
      try {
        // Filter accounts to only show bank accounts
        const accounts = await api.accounts.list({ orderBy, limit, active: true });
        return accounts.filter(account => 
          account.account_type === 'Asset' && 
          account.name.toLowerCase().includes('bank')
        );
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        return [];
      }
    }
  };

  // Items management
  static Item = {
    async list(orderBy = 'item_code', limit = 100) {
      try {
        return await api.items.list({ orderBy, limit, active: true });
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      }
    },

    async create(data) {
      return await api.items.create(data);
    }
  };

  // User management
  static User = {
    async me() {
      try {
        return await api.auth.me();
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },

    logout() {
      // This will be handled by ClientAuthService
      console.log('User logout called');
    }
  };

  // Template management
  static InvoiceTemplate = {
    async list() {
      // Return a default template for now
      return [{
        id: 'default',
        name: 'Default Template',
        is_default: true
      }];
    }
  };
}

// Export individual entities for compatibility
export const Account = LocalDataService.Account;
export const Contact = LocalDataService.Contact;
export const Invoice = LocalDataService.Invoice;
export const Bill = LocalDataService.Bill;
export const Transaction = LocalDataService.Transaction;
export const JournalEntry = LocalDataService.JournalEntry;
export const Tax = LocalDataService.Tax;
export const BankAccount = LocalDataService.BankAccount;
export const Item = LocalDataService.Item;
export const User = LocalDataService.User;
export const InvoiceTemplate = LocalDataService.InvoiceTemplate;

export default LocalDataService;