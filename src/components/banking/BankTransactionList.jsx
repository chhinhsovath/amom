import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, DollarSign } from "lucide-react";
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

export default function BankTransactionList({ transactions, loading, bankAccounts }) {
  const getTransactionIcon = (type) => {
    switch(type) {
      case 'receive': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'spend': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'transfer': return <ArrowLeftRight className="w-4 h-4 text-blue-500" />;
      default: return <DollarSign className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBankAccountName = (bankAccountId) => {
    const account = bankAccounts.find(acc => acc.id === bankAccountId);
    return account ? account.name : 'Unknown Account';
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <div className="text-slate-400 mb-4">
            <DollarSign className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Transactions Found</h3>
          <p className="text-slate-500">Add your first transaction to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{transaction.description || 'N/A'}</div>
                  <div className="text-sm text-slate-500">
                    {getBankAccountName(transaction.bank_account_id)} • {safeFormatDate(transaction.date)}
                  </div>
                  {transaction.reference && (
                    <div className="text-xs text-slate-400">Ref: {transaction.reference}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${
                  transaction.type === 'receive' ? 'text-green-600' :
                  transaction.type === 'spend' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {transaction.type === 'spend' ? '-' : '+'}${(transaction.amount || 0).toFixed(2)}
                </div>
                <div className="text-sm">
                  <Badge variant={transaction.is_reconciled ? 'default' : 'secondary'}>
                    {transaction.is_reconciled ? 'Reconciled' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}