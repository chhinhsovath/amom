
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Banknote, CreditCard, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";
import { BankAccount, BankTransaction, Account } from "@/api/entities";

import BankAccountForm from "../components/banking/BankAccountForm";
import TransactionForm from "../components/banking/TransactionForm";
import BankTransactionList from "../components/banking/BankTransactionList";
import BankReconciliation from "../components/banking/BankReconciliation";
import BankStatementImport from "../components/banking/BankStatementImport"; // Added import
import { useLocation, useNavigate } from "react-router-dom";

export default function Banking() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false); // New state
  const [accountForImport, setAccountForImport] = useState(null); // New state
  const [newTransactionType, setNewTransactionType] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new_transaction') {
      const type = params.get('type');
      setNewTransactionType(type);
      setShowTransactionForm(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bankAccountsData, transactionsData, accountsData] = await Promise.all([
        BankAccount.list('-created_date'),
        BankTransaction.list('-date'),
        Account.list('code')
      ]);
      setBankAccounts(bankAccountsData || []);
      setTransactions(transactionsData || []);
      setAccounts(accountsData || []);
    } catch (error) {
      console.error('Error loading banking data:', error);
      setBankAccounts([]);
      setTransactions([]);
      setAccounts([]);
    }
    setLoading(false);
  };

  const handleCreateBankAccount = async (accountData) => {
    try {
      await BankAccount.create(accountData);
      setShowAccountForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating bank account:', error);
    }
  };

  const handleCreateTransaction = async (transactionData) => {
    try {
      await BankTransaction.create(transactionData);
      setShowTransactionForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleOpenImport = (bankAccount) => {
    setAccountForImport(bankAccount);
    setShowImport(true);
  };

  const getTotalBalance = () => {
    return transactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + (t.amount || 0), 0) -
      transactions
      .filter(t => t.type === 'spend')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Banking</h1>
          <p className="text-slate-500 mt-1">Manage bank accounts and transactions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowReconciliation(true)}
            variant="outline"
          >
            <Filter className="w-4 h-4 mr-2" />
            Reconcile
          </Button>
          <Button 
            onClick={() => setShowTransactionForm(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
          <Button 
            onClick={() => setShowAccountForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Bank Account
          </Button>
        </div>
      </div>

      {/* Bank Accounts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Total Balance</div>
                <div className="text-3xl font-bold text-emerald-600">${getTotalBalance().toFixed(2)}</div>
              </div>
              <Banknote className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Bank Accounts</div>
                <div className="text-3xl font-bold text-blue-600">{bankAccounts.length}</div>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Money In</div>
                <div className="text-3xl font-bold text-green-600">
                  ${transactions.filter(t => t.type === 'receive').reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                </div>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Money Out</div>
                <div className="text-3xl font-bold text-red-600">
                  ${transactions.filter(t => t.type === 'spend').reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                </div>
              </div>
              <ArrowUpRight className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankAccounts.map((bankAccount) => (
              <div key={bankAccount.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{bankAccount.name}</h3>
                    <p className="text-slate-500 text-sm">Account: {bankAccount.account_number}</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    Active
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900">
                    ${Math.floor(Math.random() * 50000 + 10000).toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-500">Available Balance</div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2"> {/* Modified this section */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAccount(bankAccount)}
                    className="flex-1"
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenImport(bankAccount)}
                    className="flex-1"
                  >
                    Import
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forms and Modals */}
      {showAccountForm && (
        <BankAccountForm
          accounts={accounts}
          onSave={handleCreateBankAccount}
          onCancel={() => setShowAccountForm(false)}
        />
      )}

      {showTransactionForm && (
        <TransactionForm
          bankAccounts={bankAccounts}
          accounts={accounts}
          initialType={newTransactionType}
          onSave={handleCreateTransaction}
          onCancel={() => {
            setShowTransactionForm(false);
            setNewTransactionType(null);
          }}
        />
      )}

      {showReconciliation && (
        <BankReconciliation
          bankAccounts={bankAccounts}
          transactions={transactions}
          onClose={() => setShowReconciliation(false)}
        />
      )}

      {showImport && (
        <BankStatementImport 
            bankAccount={accountForImport}
            onClose={() => setShowImport(false)}
            onImportSuccess={() => {
                setShowImport(false);
                loadData();
            }}
        />
      )}

      {/* Recent Transactions */}
      <BankTransactionList
        transactions={getRecentTransactions()}
        loading={loading}
        bankAccounts={bankAccounts}
      />
    </div>
  );
}
