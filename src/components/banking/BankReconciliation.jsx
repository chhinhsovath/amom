import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Check, AlertTriangle } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

// Helper function to safely format dates
const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isValid(date)) {
      return format(date, formatStr);
    }
    return 'N/A';
  } catch (error) {
    console.warn('Invalid date:', dateString);
    return 'N/A';
  }
};

export default function BankReconciliation({ bankAccounts, transactions, onClose }) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [statementBalance, setStatementBalance] = useState('');
  const [reconciledTransactions, setReconciledTransactions] = useState(new Set());

  const accountTransactions = transactions.filter(t => 
    t.bank_account_id === selectedAccount && !t.is_reconciled
  );

  const calculateBookBalance = () => {
    return accountTransactions.reduce((sum, t) => {
      return sum + (t.type === 'receive' ? t.amount : -t.amount);
    }, 0);
  };

  const calculateReconciledBalance = () => {
    return accountTransactions
      .filter(t => reconciledTransactions.has(t.id))
      .reduce((sum, t) => {
        return sum + (t.type === 'receive' ? t.amount : -t.amount);
      }, 0);
  };

  const handleTransactionToggle = (transactionId) => {
    const newSet = new Set(reconciledTransactions);
    if (newSet.has(transactionId)) {
      newSet.delete(transactionId);
    } else {
      newSet.add(transactionId);
    }
    setReconciledTransactions(newSet);
  };

  const handleReconcile = () => {
    // Here you would typically update the transactions to mark them as reconciled
    console.log('Reconciling transactions:', Array.from(reconciledTransactions));
    onClose();
  };

  const bookBalance = calculateBookBalance();
  const reconciledBalance = calculateReconciledBalance();
  const statementBalanceNum = parseFloat(statementBalance) || 0;
  const difference = statementBalanceNum - reconciledBalance;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Bank Reconciliation
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reconciliation Setup */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Setup</h3>
              
              <div className="space-y-2">
                <Label htmlFor="account">Bank Account</Label>
                <select
                  id="account"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select account</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.account_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statement_balance">Statement Balance</Label>
                <Input
                  id="statement_balance"
                  type="number"
                  step="0.01"
                  value={statementBalance}
                  onChange={(e) => setStatementBalance(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Balance Summary */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Book Balance:</span>
                  <span className="font-semibold">${bookBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Statement Balance:</span>
                  <span className="font-semibold">${statementBalanceNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reconciled Amount:</span>
                  <span className="font-semibold">${reconciledBalance.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className={`flex justify-between font-semibold ${
                    Math.abs(difference) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>Difference:</span>
                    <span>${difference.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {Math.abs(difference) < 0.01 && reconciledTransactions.size > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Ready to Reconcile</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    All transactions match the statement balance.
                  </p>
                  <Button
                    onClick={handleReconcile}
                    className="mt-3 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Complete Reconciliation
                  </Button>
                </div>
              )}

              {Math.abs(difference) >= 0.01 && statementBalance && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Balance Mismatch</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    Please review transactions or check for missing entries.
                  </p>
                </div>
              )}
            </div>

            {/* Transactions List */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-slate-900 mb-4">
                Unreconciled Transactions
                {selectedAccount && (
                  <span className="text-slate-500 font-normal ml-2">
                    ({accountTransactions.length} transactions)
                  </span>
                )}
              </h3>

              {!selectedAccount ? (
                <div className="text-center py-8 text-slate-500">
                  Select a bank account to start reconciliation
                </div>
              ) : accountTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No unreconciled transactions found
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {accountTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                        reconciledTransactions.has(transaction.id)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Checkbox
                        checked={reconciledTransactions.has(transaction.id)}
                        onCheckedChange={() => handleTransactionToggle(transaction.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-slate-500">
                          {safeFormatDate(transaction.date)}
                          {transaction.reference && ` • Ref: ${transaction.reference}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.type === 'receive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'spend' ? '-' : '+'}${transaction.amount.toFixed(2)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}