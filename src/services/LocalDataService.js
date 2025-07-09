import MockDataService from './MockDataService';
import ClientAuthService from './ClientAuthService';

// Local data service to replace Base44 SDK entities
export class LocalDataService {
  static getCurrentOrganizationId() {
    const user = ClientAuthService.getCurrentUser();
    return user?.organizationId || '550e8400-e29b-41d4-a716-446655440000'; // Demo organization ID
  }

  // Account management
  static Account = {
    async list(orderBy = 'code', limit = 100) {
      try {
        return await MockDataService.getAccounts({ is_active: true }, { orderBy, limit });
      } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
      }
    },

    async findById(id) {
      const accounts = await MockDataService.getAccounts();
      return accounts.find(account => account.id === id) || null;
    },

    async create(data) {
      return await MockDataService.create('accounts', data);
    },

    async update(id, data) {
      return await MockDataService.update('accounts', id, data);
    },

    async delete(id) {
      return await MockDataService.delete('accounts', id);
    }
  };

  // Contact management
  static Contact = {
    async list(orderBy = 'name', limit = 100) {
      try {
        return await MockDataService.getContacts({ is_active: true }, { orderBy, limit });
      } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }
    },

    async filter(criteria) {
      try {
        return await MockDataService.getContacts(criteria);
      } catch (error) {
        console.error('Error filtering contacts:', error);
        return [];
      }
    },

    async findById(id) {
      const contacts = await MockDataService.getContacts();
      return contacts.find(contact => contact.id === id) || null;
    },

    async create(data) {
      return await MockDataService.create('contacts', data);
    },

    async update(id, data) {
      return await MockDataService.update('contacts', id, data);
    },

    async delete(id) {
      return await MockDataService.delete('contacts', id);
    }
  };

  // Invoice management
  static Invoice = {
    async list(orderBy = '-created_at', limit = 100) {
      try {
        const orderField = orderBy.startsWith('-') ? orderBy.substring(1) + ' DESC' : orderBy;
        return await MockDataService.getInvoices({}, { orderBy: orderField, limit });
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    },

    async findById(id) {
      const invoices = await MockDataService.getInvoices();
      return invoices.find(invoice => invoice.id === id) || null;
    },

    async create(data) {
      return await MockDataService.create('invoices', data);
    },

    async update(id, data) {
      return await MockDataService.update('invoices', id, data);
    },

    async delete(id) {
      return await MockDataService.delete('invoices', id);
    }
  };

  // Bill management
  static Bill = {
    async list(orderBy = '-created_at', limit = 100) {
      try {
        const orderField = orderBy.startsWith('-') ? orderBy.substring(1) + ' DESC' : orderBy;
        return await MockDataService.getBills({}, { orderBy: orderField, limit });
      } catch (error) {
        console.error('Error fetching bills:', error);
        return [];
      }
    },

    async findById(id) {
      const bills = await MockDataService.getBills();
      return bills.find(bill => bill.id === id) || null;
    },

    async create(data) {
      return await MockDataService.create('bills', data);
    },

    async update(id, data) {
      return await MockDataService.update('bills', id, data);
    },

    async delete(id) {
      return await MockDataService.delete('bills', id);
    }
  };

  // Transaction management
  static Transaction = {
    async list(orderBy = '-date', limit = 100) {
      try {
        return await MockDataService.getTransactions({}, { orderBy, limit });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    },

    async filter(criteria) {
      try {
        return await MockDataService.getTransactions(criteria);
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
        return await MockDataService.getTaxRates({ is_active: true }, { orderBy, limit });
      } catch (error) {
        console.error('Error fetching tax rates:', error);
        return [];
      }
    },

    async create(data) {
      return await MockDataService.create('taxRates', data);
    }
  };

  // Journal Entry management
  static JournalEntry = {
    async list(orderBy = '-date', limit = 100) {
      try {
        return await MockDataService.getTransactions({}, { orderBy, limit });
      } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }
    },

    async create(data) {
      return await MockDataService.create('transactions', data);
    }
  };

  // Bank Account management
  static BankAccount = {
    async list(orderBy = 'code', limit = 100) {
      try {
        return await MockDataService.getBankAccounts({ is_active: true }, { orderBy, limit });
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
        return await MockDataService.getItems({ is_active: true }, { orderBy, limit });
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      }
    },

    async create(data) {
      return await MockDataService.create('items', data);
    }
  };

  // User management (simplified version)
  static User = {
    async me() {
      // Return current user from ClientAuthService
      try {
        const ClientAuthService = (await import('./ClientAuthService')).default;
        const currentUser = ClientAuthService.getCurrentUser();
        if (currentUser) {
          return {
            id: currentUser.userId,
            email: currentUser.email,
            organization_id: currentUser.organizationId,
            role: currentUser.role
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },

    logout() {
      // This will be handled by ClientAuthService - placeholder for compatibility
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