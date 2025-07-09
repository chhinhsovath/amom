import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction, JournalEntry, Account, Invoice, Bill } from '@/api/entities';
import { format, parseISO, isValid } from 'date-fns';

const safeFormatDate = (dateString, formatStr = "dd MMM yyyy") => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return isValid(date) ? format(date, formatStr) : 'N/A';
  } catch (e) { return 'N/A'; }
};

export default function AccountTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAccountFilter, setShowAccountFilter] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: format(new Date(2024, 0, 1), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
    groupBy: 'Account',
    columns: '3 columns selected'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, accountsData, journalEntriesData, invoicesData, billsData] = await Promise.all([
        Transaction.list('-date'),
        Account.list('code'),
        JournalEntry.list(),
        Invoice.list(),
        Bill.list()
      ]);

      // Combine all transaction sources
      const allTransactions = [];

      // Add manual journal entries
      transactionsData.forEach(trans => {
        const relatedJournalEntries = journalEntriesData.filter(je => je.transaction_id === trans.id);
        relatedJournalEntries.forEach(je => {
          const account = accountsData.find(a => a.id === je.account_id);
          allTransactions.push({
            id: `journal-${je.id}`,
            date: trans.date,
            source: 'Manual Journal',
            description: je.description || trans.description,
            reference: trans.reference || '',
            debit: je.debit || 0,
            credit: je.credit || 0,
            accountId: je.account_id,
            accountCode: account?.code || '',
            accountName: account?.name || '',
            runningBalance: 0 // Will calculate later
          });
        });
      });

      // Add invoice transactions
      invoicesData.forEach(inv => {
        if (inv.status === 'paid') {
          allTransactions.push({
            id: `invoice-${inv.id}`,
            date: inv.issue_date,
            source: 'Sales Invoice',
            description: `Invoice ${inv.invoice_number} - ${inv.contact_name}`,
            reference: inv.invoice_number,
            debit: inv.total_amount || 0,
            credit: 0,
            accountId: 'sales', // Would map to sales account
            accountCode: '200',
            accountName: 'Sales',
            runningBalance: 0
          });
        }
      });

      // Add bill transactions
      billsData.forEach(bill => {
        if (bill.status === 'paid') {
          allTransactions.push({
            id: `bill-${bill.id}`,
            date: bill.issue_date,
            source: 'Purchase Invoice',
            description: `Bill ${bill.bill_number} - ${bill.contact_name}`,
            reference: bill.bill_number,
            debit: 0,
            credit: bill.total_amount || 0,
            accountId: 'purchases',
            accountCode: '500',
            accountName: 'Purchases',
            runningBalance: 0
          });
        }
      });

      // Sort by date
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Calculate running balances per account
      const accountBalances = {};
      allTransactions.forEach(trans => {
        if (!accountBalances[trans.accountId]) {
          accountBalances[trans.accountId] = 0;
        }
        accountBalances[trans.accountId] += (trans.debit - trans.credit);
        trans.runningBalance = accountBalances[trans.accountId];
      });

      setTransactions(allTransactions);
      setAccounts(accountsData);
      setSelectedAccounts(accountsData.slice(0, 5).map(a => a.id)); // Default to first 5 accounts
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountToggle = (accountId, checked) => {
    if (checked) {
      setSelectedAccounts([...selectedAccounts, accountId]);
    } else {
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
    }
  };

  const filteredTransactions = transactions.filter(trans => {
    const dateMatch = trans.date >= filters.dateFrom && trans.date <= filters.dateTo;
    const accountMatch = selectedAccounts.length === 0 || selectedAccounts.includes(trans.accountId);
    return dateMatch && accountMatch;
  });

  const groupedTransactions = filters.groupBy === 'Account' 
    ? groupTransactionsByAccount(filteredTransactions)
    : filteredTransactions;

  function groupTransactionsByAccount(transactions) {
    const grouped = {};
    transactions.forEach(trans => {
      const key = `${trans.accountCode} - ${trans.accountName}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(trans);
    });
    return grouped;
  }

  const totals = filteredTransactions.reduce((acc, trans) => ({
    debit: acc.debit + (trans.debit || 0),
    credit: acc.credit + (trans.credit || 0)
  }), { debit: 0, credit: 0 });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Account Transactions</h1>
          <p className="text-slate-500 mt-1">View and analyze all account transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Tips and tricks</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Accounts</label>
              <Button 
                variant="outline" 
                onClick={() => setShowAccountFilter(!showAccountFilter)}
                className="w-full justify-between"
              >
                {selectedAccounts.length} accounts selected
                {showAccountFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date range: Custom</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Columns</label>
              <Select value={filters.columns} onValueChange={(val) => setFilters(prev => ({ ...prev, columns: val }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3 columns selected">3 columns selected</SelectItem>
                  <SelectItem value="5 columns selected">5 columns selected</SelectItem>
                  <SelectItem value="All columns">All columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grouping/Summarising</label>
              <Select value={filters.groupBy} onValueChange={(val) => setFilters(prev => ({ ...prev, groupBy: val }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Account">Group by Account</SelectItem>
                  <SelectItem value="Month">Group by Month</SelectItem>
                  <SelectItem value="None">No grouping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Account Filter Panel */}
          {showAccountFilter && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={(checked) => handleAccountToggle(account.id, checked)}
                    />
                    <label className="text-sm">{account.code} - {account.name}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />More</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sales Transactions</CardTitle>
            <Button variant="ghost" size="sm">Reconcile columns</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Running Balance</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filters.groupBy === 'Account' ? (
                    Object.entries(groupedTransactions).map(([accountName, accountTransactions]) => (
                      <React.Fragment key={accountName}>
                        <TableRow className="bg-slate-100 font-semibold">
                          <TableCell colSpan={9} className="py-3">
                            {accountName}
                          </TableCell>
                        </TableRow>
                        {accountTransactions.map(trans => (
                          <TableRow key={trans.id}>
                            <TableCell className="font-medium">{safeFormatDate(trans.date)}</TableCell>
                            <TableCell>{trans.source}</TableCell>
                            <TableCell>{trans.description}</TableCell>
                            <TableCell>{trans.reference}</TableCell>
                            <TableCell className="text-right">{trans.debit > 0 ? `$${trans.debit.toFixed(2)}` : ''}</TableCell>
                            <TableCell className="text-right">{trans.credit > 0 ? `$${trans.credit.toFixed(2)}` : ''}</TableCell>
                            <TableCell className="text-right">${trans.runningBalance.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${Math.max(trans.debit, trans.credit).toFixed(2)}</TableCell>
                            <TableCell className="text-right">$0.00</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    filteredTransactions.map(trans => (
                      <TableRow key={trans.id}>
                        <TableCell className="font-medium">{safeFormatDate(trans.date)}</TableCell>
                        <TableCell>{trans.source}</TableCell>
                        <TableCell>{trans.description}</TableCell>
                        <TableCell>{trans.reference}</TableCell>
                        <TableCell className="text-right">{trans.debit > 0 ? `$${trans.debit.toFixed(2)}` : ''}</TableCell>
                        <TableCell className="text-right">{trans.credit > 0 ? `$${trans.credit.toFixed(2)}` : ''}</TableCell>
                        <TableCell className="text-right">${trans.runningBalance.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${Math.max(trans.debit, trans.credit).toFixed(2)}</TableCell>
                        <TableCell className="text-right">$0.00</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="bg-slate-100 font-bold">
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-right">${totals.debit.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${totals.credit.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(totals.debit - totals.credit).toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(totals.debit + totals.credit).toFixed(2)}</TableCell>
                    <TableCell className="text-right">$0.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}