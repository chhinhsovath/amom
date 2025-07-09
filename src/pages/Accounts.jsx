import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Trash2, Archive, Edit, FileText, Upload, Download } from "lucide-react";
import { Account, BankAccount } from "@/api/entities";

import ChartOfAccountsView from "../components/accounts/ChartOfAccountsView";
import AccountForm from "../components/accounts/AccountForm";
import BankAccountForm from "../components/accounts/BankAccountForm";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExportMenu from "../components/common/ExportMenu";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedAccountForAction, setSelectedAccountForAction] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");

  const filterOptions = [
    { value: "all", label: "All Accounts" },
    { value: "assets", label: "Assets" },
    { value: "liabilities", label: "Liabilities" },
    { value: "equity", label: "Equity" },
    { value: "revenue", label: "Revenue" },
    { value: "expenses", label: "Expenses" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, bankAccountsData] = await Promise.all([
        Account.list('code'),
        BankAccount.list('name').catch(() => [])
      ]);
      setAccounts(accountsData);
      setBankAccounts(bankAccountsData || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
      setBankAccounts([]);
    }
    setLoading(false);
  };

  const handleSaveAccount = async (accountData) => {
    try {
      if (editingAccount) {
        await Account.update(editingAccount.id, accountData);
      } else {
        await Account.create(accountData);
      }
      setShowForm(false);
      setEditingAccount(null);
      loadData();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleSaveBankAccount = async (bankAccountData) => {
    try {
      await BankAccount.create(bankAccountData);
      setShowBankForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving bank account:', error);
    }
  };
  
  const handleDeleteRequest = (account) => {
    setSelectedAccountForAction(account);
    setDeleteDialogOpen(true);
  };

  const handleArchiveRequest = (account) => {
    setSelectedAccountForAction(account);
    setArchiveDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccountForAction) return;
    try {
      await Account.delete(selectedAccountForAction.id);
      loadData();
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAccountForAction(null);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!selectedAccountForAction) return;
    try {
      await Account.update(selectedAccountForAction.id, { 
        ...selectedAccountForAction, 
        is_active: false 
      });
      loadData();
    } catch (error) {
      console.error("Error archiving account:", error);
    } finally {
      setArchiveDialogOpen(false);
      setSelectedAccountForAction(null);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAccounts.size === 0) return;
    
    try {
      const accountIds = Array.from(selectedAccounts);
      
      if (bulkAction === "delete") {
        await Promise.all(accountIds.map(id => Account.delete(id)));
      } else if (bulkAction === "archive") {
        await Promise.all(accountIds.map(async id => {
          const account = accounts.find(a => a.id === id);
          if (account) {
            await Account.update(id, { ...account, is_active: false });
          }
        }));
      } else if (bulkAction === "activate") {
        await Promise.all(accountIds.map(async id => {
          const account = accounts.find(a => a.id === id);
          if (account) {
            await Account.update(id, { ...account, is_active: true });
          }
        }));
      }
      
      setSelectedAccounts(new Set());
      setBulkAction("");
      loadData();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleAccountSelection = (accountId, checked) => {
    const newSelection = new Set(selectedAccounts);
    if (checked) {
      newSelection.add(accountId);
    } else {
      newSelection.delete(accountId);
    }
    setSelectedAccounts(newSelection);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAccounts(new Set(filteredAccounts.map(a => a.id)));
    } else {
      setSelectedAccounts(new Set());
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = (account.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (account.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch(selectedFilter) {
      case "assets":
        matchesFilter = account.type === "asset";
        break;
      case "liabilities":
        matchesFilter = account.type === "liability";
        break;
      case "equity":
        matchesFilter = account.type === "equity";
        break;
      case "revenue":
        matchesFilter = account.type === "revenue";
        break;
      case "expenses":
        matchesFilter = account.type === "expense";
        break;
      case "active":
        matchesFilter = account.is_active === true;
        break;
      case "archived":
        matchesFilter = account.is_active === false;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getAccountSummary = () => {
    return {
      total: accounts.length,
      active: accounts.filter(a => a.is_active).length,
      archived: accounts.filter(a => !a.is_active).length,
      assets: accounts.filter(a => a.type === 'asset').length,
      liabilities: accounts.filter(a => a.type === 'liability').length,
      equity: accounts.filter(a => a.type === 'equity').length,
      revenue: accounts.filter(a => a.type === 'revenue').length,
      expenses: accounts.filter(a => a.type === 'expense').length,
    };
  };

  const summary = getAccountSummary();
  
  const accountColumns = [
    { header: 'Code', accessorKey: 'code' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Balance', accessorKey: 'balance' },
    { header: 'Status', accessorKey: 'is_active' },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header with description matching Xero */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Chart of Accounts</h1>
            <p className="text-slate-600 mt-2">Categorise every transaction with our full Chart of accounts</p>
            <p className="text-slate-500 text-sm">Financial reports draw on each account to show how your business is performing</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportMenu data={filteredAccounts} columns={accountColumns} filename="chart-of-accounts" />
            <Button 
              variant="outline"
              onClick={() => setShowBankForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bank Account
            </Button>
            <Button 
              onClick={() => { setEditingAccount(null); setShowForm(true); }} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{summary.total}</div>
              <div className="text-sm text-slate-500">Total</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{summary.assets}</div>
              <div className="text-sm text-slate-500">Assets</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{summary.liabilities}</div>
              <div className="text-sm text-slate-500">Liabilities</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.equity}</div>
              <div className="text-sm text-slate-500">Equity</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.revenue}</div>
              <div className="text-sm text-slate-500">Revenue</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.expenses}</div>
              <div className="text-sm text-slate-500">Expenses</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{summary.active}</div>
              <div className="text-sm text-slate-500">Active</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters matching Xero layout */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(option => (
                <Button
                  key={option.value}
                  variant={selectedFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(option.value)}
                  className={selectedFilter === option.value ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedAccounts.size > 0 && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  {selectedAccounts.size} account{selectedAccounts.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-3 py-1 border border-slate-200 rounded text-sm"
                  >
                    <option value="">Choose action...</option>
                    <option value="archive">Archive</option>
                    <option value="activate">Activate</option>
                    <option value="delete">Delete</option>
                  </select>
                  <Button 
                    size="sm" 
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms */}
      {showForm && (
        <AccountForm
          account={editingAccount}
          accounts={accounts}
          onSave={handleSaveAccount}
          onCancel={() => {
            setShowForm(false);
            setEditingAccount(null);
          }}
        />
      )}

      {showBankForm && (
        <BankAccountForm
          accounts={accounts.filter(a => a.type === 'asset')}
          onSave={handleSaveBankAccount}
          onCancel={() => setShowBankForm(false)}
        />
      )}
      
      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        description={`Are you sure you want to delete "${selectedAccountForAction?.name}"? This action cannot be undone.`}
      />

      <ConfirmationDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onConfirm={handleArchiveConfirm}
        title="Archive Account"
        description={`Are you sure you want to archive "${selectedAccountForAction?.name}"? You can reactivate it later if needed.`}
      />

      {/* Enhanced Chart of Accounts View */}
      <ChartOfAccountsView
        accounts={filteredAccounts}
        loading={loading}
        selectedAccounts={selectedAccounts}
        onEdit={(account) => {
          setEditingAccount(account);
          setShowForm(true);
        }}
        onDelete={handleDeleteRequest}
        onArchive={handleArchiveRequest}
        onSelectAccount={handleAccountSelection}
        onSelectAll={handleSelectAll}
      />
    </div>
  );
}