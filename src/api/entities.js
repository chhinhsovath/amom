// Real entities using PostgreSQL database via API
import {
  Account,
  Contact,
  Invoice,
  Bill,
  Transaction,
  JournalEntry,
  Tax,
  BankAccount,
  Item,
  User,
  InvoiceTemplate,
  Quote
} from '@/services/DataService';

// Export main entities
export { Account, Contact, Invoice, Bill, Transaction, JournalEntry, Tax, BankAccount, Item, User, InvoiceTemplate, Quote };

// Create placeholder entities with basic functionality to prevent null errors
const createPlaceholderEntity = (entityName) => ({
  async list(orderBy = 'created_at', limit = 100) {
    console.log(`${entityName} entity not yet implemented`);
    return [];
  },
  
  async filter(criteria) {
    console.log(`${entityName} entity not yet implemented`);
    return [];
  },
  
  async findById(id) {
    console.log(`${entityName} entity not yet implemented`);
    return null;
  },
  
  async create(data) {
    console.log(`${entityName} entity not yet implemented`);
    return null;
  },
  
  async update(id, data) {
    console.log(`${entityName} entity not yet implemented`);
    return null;
  },
  
  async delete(id) {
    console.log(`${entityName} entity not yet implemented`);
    return null;
  }
});

// Placeholder entities (not yet implemented but with basic structure)
export const Organization = createPlaceholderEntity('Organization');
export const Role = createPlaceholderEntity('Role');
export const InvoiceItem = createPlaceholderEntity('InvoiceItem');
export const BillItem = createPlaceholderEntity('BillItem');
export const Expense = createPlaceholderEntity('Expense');
export const QuoteItem = createPlaceholderEntity('QuoteItem');
export const Payment = createPlaceholderEntity('Payment');
export const PaymentAllocation = createPlaceholderEntity('PaymentAllocation');
export const BankTransaction = createPlaceholderEntity('BankTransaction');
export const BankRule = createPlaceholderEntity('BankRule');
export const Employee = createPlaceholderEntity('Employee');
export const Payrun = createPlaceholderEntity('Payrun');
export const Payslip = createPlaceholderEntity('Payslip');
export const FixedAsset = createPlaceholderEntity('FixedAsset');
export const Budget = createPlaceholderEntity('Budget');
export const BudgetLine = createPlaceholderEntity('BudgetLine');
export const Project = createPlaceholderEntity('Project');
export const TimeEntry = createPlaceholderEntity('TimeEntry');
export const RecurringInvoice = createPlaceholderEntity('RecurringInvoice');
export const Approval = createPlaceholderEntity('Approval');
export const TaxReport = createPlaceholderEntity('TaxReport');
export const CurrencyRate = createPlaceholderEntity('CurrencyRate');
export const AuditLog = createPlaceholderEntity('AuditLog');
export const PurchaseOrder = createPlaceholderEntity('PurchaseOrder');
export const CreditNote = createPlaceholderEntity('CreditNote');
export const OnlinePayment = createPlaceholderEntity('OnlinePayment');