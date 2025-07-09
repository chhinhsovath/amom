import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Calendar, DollarSign } from "lucide-react";

export default function AccountDetails({ account, onClose, onEdit }) {
  const mockTransactions = [
    { id: 1, date: "2024-01-15", description: "Sales Invoice #001", debit: 1500, credit: 0 },
    { id: 2, date: "2024-01-14", description: "Payment Received", debit: 0, credit: 1200 },
    { id: 3, date: "2024-01-13", description: "Bank Transfer", debit: 800, credit: 0 },
    { id: 4, date: "2024-01-12", description: "Office Supplies", debit: 0, credit: 250 },
    { id: 5, date: "2024-01-11", description: "Service Revenue", debit: 2000, credit: 0 }
  ];

  const balance = mockTransactions.reduce((sum, txn) => sum + txn.debit - txn.credit, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Account Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Account Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-500">Account Code</div>
                    <div className="font-semibold text-2xl text-slate-900">{account.code}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Account Name</div>
                    <div className="font-semibold text-lg text-slate-900">{account.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Account Type</div>
                    <Badge className={`${
                      account.type === 'asset' ? 'bg-emerald-100 text-emerald-800' :
                      account.type === 'liability' ? 'bg-red-100 text-red-800' :
                      account.type === 'equity' ? 'bg-blue-100 text-blue-800' :
                      account.type === 'revenue' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Status</div>
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {account.description && (
                    <div>
                      <div className="text-sm text-slate-500">Description</div>
                      <div className="text-slate-700">{account.description}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Balance</h3>
                <Card className="bg-slate-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-sm text-slate-500 mb-2">Current Balance</div>
                    <div className={`text-3xl font-bold ${
                      balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      ${Math.abs(balance).toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {balance >= 0 ? 'Debit Balance' : 'Credit Balance'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
              <Button variant="outline" size="sm">
                View All Transactions
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 text-slate-900 font-semibold">Date</th>
                    <th className="text-left py-3 text-slate-900 font-semibold">Description</th>
                    <th className="text-right py-3 text-slate-900 font-semibold">Debit</th>
                    <th className="text-right py-3 text-slate-900 font-semibold">Credit</th>
                    <th className="text-right py-3 text-slate-900 font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((transaction, index) => {
                    const runningBalance = mockTransactions
                      .slice(0, index + 1)
                      .reduce((sum, txn) => sum + txn.debit - txn.credit, 0);
                    
                    return (
                      <tr key={transaction.id} className="border-b border-slate-100">
                        <td className="py-3 text-slate-700">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-slate-700">{transaction.description}</td>
                        <td className="text-right py-3 text-slate-700">
                          {transaction.debit > 0 ? `$${transaction.debit.toFixed(2)}` : '-'}
                        </td>
                        <td className="text-right py-3 text-slate-700">
                          {transaction.credit > 0 ? `$${transaction.credit.toFixed(2)}` : '-'}
                        </td>
                        <td className={`text-right py-3 font-semibold ${
                          runningBalance >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          ${Math.abs(runningBalance).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onEdit} className="bg-emerald-600 hover:bg-emerald-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}