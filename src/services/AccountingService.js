import MockDataService from './MockDataService';

export class AccountingService {
  // Chart of Accounts Management
  static async getAccountsHierarchy(organizationId) {
    try {
      const accounts = await MockDataService.getAccounts({ is_active: true });
      
      return this.buildAccountHierarchy(accounts);
    } catch (error) {
      console.error('Error fetching accounts hierarchy:', error);
      throw error;
    }
  }

  static buildAccountHierarchy(accounts) {
    const accountMap = new Map();
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    const rootAccounts = [];
    accounts.forEach(account => {
      if (account.parent_account_id) {
        const parent = accountMap.get(account.parent_account_id);
        if (parent) {
          parent.children.push(accountMap.get(account.id));
        }
      } else {
        rootAccounts.push(accountMap.get(account.id));
      }
    });

    return rootAccounts;
  }

  static async createAccount(organizationId, accountData) {
    try {
      const account = await MockDataService.create('accounts', {
        organization_id: organizationId,
        ...accountData,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return account;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  static async updateAccount(accountId, accountData) {
    try {
      const account = await MockDataService.update('accounts', accountId, accountData);
      return account;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  static async deleteAccount(accountId) {
    try {
      // Simplified for mock data - in real implementation would check transactions
      // TODO: Add proper validation when connecting to real database
      return await MockDataService.delete('accounts', accountId);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Journal Entry Management
  static async createJournalEntry(organizationId, entryData) {
    try {
      // Validate that debits equal credits
      const totalDebits = entryData.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
      const totalCredits = entryData.lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Debits must equal credits');
      }

      // Generate entry number
      const entryNumber = await this.generateEntryNumber(organizationId);

      // Create journal entry with mock data
      const journalEntry = await MockDataService.create('transactions', {
        organization_id: organizationId,
        entry_number: entryNumber,
        date: entryData.date,
        description: entryData.description,
        total_amount: totalDebits,
        status: entryData.status || 'posted',
        created_by: entryData.created_by,
        lines: entryData.lines
      });

      return journalEntry;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  static async generateEntryNumber(organizationId) {
    // Simplified for mock data - generate sequential numbers
    const transactions = await MockDataService.getTransactions();
    const lastNumber = transactions.length + 1;
    return `JE-2025-${lastNumber.toString().padStart(3, '0')}`;
  }

  static async updateAccountBalance(accountId, debitAmount, creditAmount) {
    // Simplified for mock data - would normally update account balance in database
    const accounts = await MockDataService.getAccounts();
    const account = accounts.find(a => a.id === accountId);
    
    if (account) {
      let balanceChange = 0;
      
      // Asset, Expense accounts have debit normal balance
      if (account.type === 'asset' || account.type === 'expense') {
        balanceChange = debitAmount - creditAmount;
      } 
      // Liability, Equity, Revenue accounts have credit normal balance  
      else if (account.type === 'liability' || account.type === 'equity' || account.type === 'revenue') {
        balanceChange = creditAmount - debitAmount;
      }

      account.balance += balanceChange;
      console.log(`Updated balance for account ${account.name}: ${account.balance}`);
    }
  }

  static async getJournalEntries(organizationId, options = {}) {
    const { startDate, endDate, accountId, limit = 50, offset = 0 } = options;
    
    try {
      let transactions = await MockDataService.getTransactions();
      
      // Apply filters
      if (startDate) {
        transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
      }
      if (endDate) {
        transactions = transactions.filter(t => new Date(t.date) <= new Date(endDate));
      }
      if (accountId) {
        transactions = transactions.filter(t => 
          t.lines && t.lines.some(line => line.account_id === accountId)
        );
      }
      
      // Apply pagination
      const paginatedTransactions = transactions.slice(offset, offset + limit);
      
      return paginatedTransactions;
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  }

  // Financial Reporting
  static async generateTrialBalance(organizationId, asOfDate) {
    try {
      const accounts = await MockDataService.getAccounts({ is_active: true });
      
      return accounts.filter(a => a.balance !== 0).map(a => ({
        id: a.id,
        code: a.code,
        name: a.name,
        type: a.type,
        balance: a.balance,
        debit_balance: (a.type === 'asset' || a.type === 'expense') && a.balance >= 0 ? a.balance : 0,
        credit_balance: (a.type === 'liability' || a.type === 'equity' || a.type === 'revenue') && a.balance >= 0 ? a.balance : 0
      })).sort((a, b) => a.code.localeCompare(b.code));
    } catch (error) {
      console.error('Error generating trial balance:', error);
      throw error;
    }
  }

  static async generateProfitLoss(organizationId, startDate, endDate) {
    try {
      const accounts = await MockDataService.getAccounts({ is_active: true });
      
      return accounts
        .filter(a => a.type === 'revenue' || a.type === 'expense')
        .map(a => ({
          id: a.id,
          code: a.code,
          name: a.name,
          type: a.type,
          balance: a.balance,
          period_movement: a.balance // Simplified for mock data
        }))
        .sort((a, b) => a.type.localeCompare(b.type) || a.code.localeCompare(b.code));
    } catch (error) {
      console.error('Error generating profit & loss:', error);
      throw error;
    }
  }

  static async generateBalanceSheet(organizationId, asOfDate) {
    try {
      const accounts = await MockDataService.getAccounts({ is_active: true });
      
      return accounts
        .filter(a => a.type === 'asset' || a.type === 'liability' || a.type === 'equity')
        .map(a => ({
          id: a.id,
          code: a.code,
          name: a.name,
          type: a.type,
          balance: a.balance
        }))
        .sort((a, b) => a.type.localeCompare(b.type) || a.code.localeCompare(b.code));
    } catch (error) {
      console.error('Error generating balance sheet:', error);
      throw error;
    }
  }

  // Transaction Processing
  static async processInvoice(organizationId, invoiceData) {
    try {
      // Create invoice with mock data
      const invoice = await MockDataService.create('invoices', {
        organization_id: organizationId,
        invoice_number: invoiceData.invoice_number,
        contact_id: invoiceData.contact_id,
        contact_name: invoiceData.contact_name,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        status: invoiceData.status,
        subtotal: invoiceData.subtotal,
        tax_amount: invoiceData.tax_amount,
        total: invoiceData.total,
        line_items: invoiceData.line_items
      });

      // Create journal entry for invoice if posted/sent
      if (invoiceData.status === 'posted' || invoiceData.status === 'sent') {
        await this.createInvoiceJournalEntry(organizationId, invoice, invoiceData.line_items);
      }

      return invoice;
    } catch (error) {
      console.error('Error processing invoice:', error);
      throw error;
    }
  }

  static async createInvoiceJournalEntry(organizationId, invoice, lineItems) {
    const entryNumber = await this.generateEntryNumber(organizationId);
    
    // Create journal entry lines for the invoice
    const journalLines = [];
    
    // Debit Accounts Receivable
    journalLines.push({
      account_id: '1120', // Accounts Receivable
      debit_amount: invoice.total,
      credit_amount: 0,
      description: `Invoice ${invoice.invoice_number}`,
      contact_id: invoice.contact_id
    });

    // Credit revenue accounts
    for (const line of lineItems) {
      journalLines.push({
        account_id: line.account_id,
        debit_amount: 0,
        credit_amount: line.line_total,
        description: line.description,
        contact_id: invoice.contact_id
      });
    }

    // Credit tax payable if applicable
    if (invoice.tax_amount > 0) {
      journalLines.push({
        account_id: '2120', // Tax Payable
        debit_amount: 0,
        credit_amount: invoice.tax_amount,
        description: 'Sales Tax',
        contact_id: invoice.contact_id
      });
    }

    // Create the journal entry
    const entry = await MockDataService.create('transactions', {
      organization_id: organizationId,
      entry_number: entryNumber,
      date: invoice.issue_date,
      description: `Invoice ${invoice.invoice_number}`,
      total_amount: invoice.total,
      status: 'posted',
      lines: journalLines
    });

    return entry;
  }
}

export default AccountingService;