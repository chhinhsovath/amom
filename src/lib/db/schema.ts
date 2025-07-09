import { pgTable, text, uuid, varchar, boolean, timestamp, integer, decimal, date, jsonb, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const accountTypeEnum = pgEnum('account_type', ['asset', 'liability', 'equity', 'revenue', 'expense']);
export const contactTypeEnum = pgEnum('contact_type', ['customer', 'supplier', 'both']);
export const taxTypeEnum = pgEnum('tax_type', ['sales', 'purchase', 'both']);
export const journalStatusEnum = pgEnum('journal_status', ['draft', 'posted', 'reversed']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'cancelled', 'overdue']);
export const billStatusEnum = pgEnum('bill_status', ['draft', 'approved', 'paid', 'cancelled', 'overdue']);
export const expenseStatusEnum = pgEnum('expense_status', ['draft', 'submitted', 'approved', 'paid', 'rejected']);
export const bankTransactionTypeEnum = pgEnum('bank_transaction_type', ['debit', 'credit']);
export const itemTypeEnum = pgEnum('item_type', ['product', 'service']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete']);

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }),
  taxNumber: varchar('tax_number', { length: 100 }),
  registrationNumber: varchar('registration_number', { length: 100 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  currencyCode: varchar('currency_code', { length: 3 }).default('USD'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  fiscalYearStartMonth: integer('fiscal_year_start_month').default(1),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('user'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Chart of Accounts
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: accountTypeEnum('type').notNull(),
  parentAccountId: uuid('parent_account_id'),
  isBankAccount: boolean('is_bank_account').default(false),
  isActive: boolean('is_active').default(true),
  taxRateId: uuid('tax_rate_id'),
  description: text('description'),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgCodeUnique: uniqueIndex('accounts_org_code_unique').on(table.organizationId, table.code),
}));

// Contacts (Customers & Suppliers)
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  type: contactTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  taxNumber: varchar('tax_number', { length: 100 }),
  paymentTerms: integer('payment_terms').default(30),
  creditLimit: decimal('credit_limit', { precision: 15, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Tax Rates
export const taxRates = pgTable('tax_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  name: varchar('name', { length: 100 }).notNull(),
  rate: decimal('rate', { precision: 8, scale: 4 }).notNull(),
  type: taxTypeEnum('type').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Journal Entries
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  entryNumber: varchar('entry_number', { length: 50 }).notNull(),
  date: date('date').notNull(),
  reference: varchar('reference', { length: 255 }),
  description: text('description').notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  status: journalStatusEnum('status').default('posted'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgEntryNumberUnique: uniqueIndex('journal_entries_org_number_unique').on(table.organizationId, table.entryNumber),
}));

// Journal Entry Lines
export const journalEntryLines = pgTable('journal_entry_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').references(() => accounts.id),
  debitAmount: decimal('debit_amount', { precision: 15, scale: 2 }).default('0.00'),
  creditAmount: decimal('credit_amount', { precision: 15, scale: 2 }).default('0.00'),
  description: text('description'),
  reference: varchar('reference', { length: 255 }),
  contactId: uuid('contact_id').references(() => contacts.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Invoices
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  contactId: uuid('contact_id').references(() => contacts.id),
  contactName: varchar('contact_name', { length: 255 }),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  status: invoiceStatusEnum('status').default('draft'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull().default('0.00'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  total: decimal('total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0.00'),
  notes: text('notes'),
  terms: text('terms'),
  templateId: uuid('template_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgInvoiceNumberUnique: uniqueIndex('invoices_org_number_unique').on(table.organizationId, table.invoiceNumber),
}));

// Invoice Line Items
export const invoiceLineItems = pgTable('invoice_line_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').references(() => accounts.id),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 15, scale: 2 }).notNull(),
  taxRateId: uuid('tax_rate_id').references(() => taxRates.id),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Bills (Purchases)
export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  billNumber: varchar('bill_number', { length: 50 }).notNull(),
  contactId: uuid('contact_id').references(() => contacts.id),
  contactName: varchar('contact_name', { length: 255 }),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  status: billStatusEnum('status').default('draft'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull().default('0.00'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
  total: decimal('total', { precision: 15, scale: 2 }).notNull().default('0.00'),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0.00'),
  notes: text('notes'),
  reference: varchar('reference', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgBillNumberUnique: uniqueIndex('bills_org_number_unique').on(table.organizationId, table.billNumber),
}));

// Bill Line Items
export const billLineItems = pgTable('bill_line_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  billId: uuid('bill_id').references(() => bills.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').references(() => accounts.id),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 15, scale: 2 }).notNull(),
  taxRateId: uuid('tax_rate_id').references(() => taxRates.id),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  paymentNumber: varchar('payment_number', { length: 50 }).notNull(),
  date: date('date').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  reference: varchar('reference', { length: 255 }),
  bankAccountId: uuid('bank_account_id').references(() => accounts.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgPaymentNumberUnique: uniqueIndex('payments_org_number_unique').on(table.organizationId, table.paymentNumber),
}));

// Payment Allocations
export const paymentAllocations = pgTable('payment_allocations', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').references(() => invoices.id),
  billId: uuid('bill_id').references(() => bills.id),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Bank Transactions
export const bankTransactions = pgTable('bank_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  bankAccountId: uuid('bank_account_id').references(() => accounts.id),
  date: date('date').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  type: bankTransactionTypeEnum('type').notNull(),
  description: text('description'),
  reference: varchar('reference', { length: 255 }),
  payee: varchar('payee', { length: 255 }),
  isReconciled: boolean('is_reconciled').default(false),
  contactId: uuid('contact_id').references(() => contacts.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Items (Products & Services)
export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  itemCode: varchar('item_code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: itemTypeEnum('type').notNull(),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  costPrice: decimal('cost_price', { precision: 15, scale: 2 }),
  quantityOnHand: integer('quantity_on_hand').default(0),
  salesAccountId: uuid('sales_account_id').references(() => accounts.id),
  purchaseAccountId: uuid('purchase_account_id').references(() => accounts.id),
  taxRateId: uuid('tax_rate_id').references(() => taxRates.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgItemCodeUnique: uniqueIndex('items_org_code_unique').on(table.organizationId, table.itemCode),
}));

// Expense Claims
export const expenseClaims = pgTable('expense_claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  claimNumber: varchar('claim_number', { length: 50 }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  date: date('date').notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  status: expenseStatusEnum('status').default('draft'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgClaimNumberUnique: uniqueIndex('expense_claims_org_number_unique').on(table.organizationId, table.claimNumber),
}));

// Expense Claim Lines
export const expenseClaimLines = pgTable('expense_claim_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  expenseClaimId: uuid('expense_claim_id').references(() => expenseClaims.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').references(() => accounts.id),
  date: date('date').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  description: text('description').notNull(),
  receiptReference: varchar('receipt_reference', { length: 255 }),
  taxRateId: uuid('tax_rate_id').references(() => taxRates.id),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Audit Trail
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  userId: uuid('user_id').references(() => users.id),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: uuid('record_id').notNull(),
  action: auditActionEnum('action').notNull(),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgTableRecordIdx: index('audit_logs_org_table_record_idx').on(table.organizationId, table.tableName, table.recordId),
}));

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  accounts: many(accounts),
  contacts: many(contacts),
  taxRates: many(taxRates),
  journalEntries: many(journalEntries),
  invoices: many(invoices),
  bills: many(bills),
  payments: many(payments),
  bankTransactions: many(bankTransactions),
  items: many(items),
  expenseClaims: many(expenseClaims),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  journalEntries: many(journalEntries),
  expenseClaims: many(expenseClaims),
  auditLogs: many(auditLogs),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [accounts.organizationId],
    references: [organizations.id],
  }),
  parentAccount: one(accounts, {
    fields: [accounts.parentAccountId],
    references: [accounts.id],
  }),
  childAccounts: many(accounts),
  journalEntryLines: many(journalEntryLines),
  invoiceLineItems: many(invoiceLineItems),
  billLineItems: many(billLineItems),
  payments: many(payments),
  bankTransactions: many(bankTransactions),
  salesItems: many(items),
  purchaseItems: many(items),
  expenseClaimLines: many(expenseClaimLines),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  invoices: many(invoices),
  bills: many(bills),
  payments: many(payments),
  bankTransactions: many(bankTransactions),
  journalEntryLines: many(journalEntryLines),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
  contact: one(contacts, {
    fields: [invoices.contactId],
    references: [contacts.id],
  }),
  lineItems: many(invoiceLineItems),
  paymentAllocations: many(paymentAllocations),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  account: one(accounts, {
    fields: [invoiceLineItems.accountId],
    references: [accounts.id],
  }),
  taxRate: one(taxRates, {
    fields: [invoiceLineItems.taxRateId],
    references: [taxRates.id],
  }),
}));