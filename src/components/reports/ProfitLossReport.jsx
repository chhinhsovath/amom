
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

export default function ProfitLossReport({ data, dateRange }) {
  const { accounts = [], transactions = [], journal_entries = [], loading } = data || {};
  const { start, end } = dateRange || {};

  const calculatePnl = () => {
    let revenue = 0;
    let expenses = 0;
    
    // This is a simplified calculation. A real P&L would need to process all transactions
    // within the date range and sum up the movements in revenue/expense accounts.
    // For now, we use the account balances as a proxy for movement in the period.
    
    // Revenue accounts often have negative balances in accounting (credit normal)
    // Expenses have positive (debit normal). We'll flip revenue for display.
    revenue = accounts
        .filter(a => a.type === 'revenue')
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);
    revenue = Math.abs(revenue); // Display revenue as a positive value

    expenses = accounts
        .filter(a => a.type === 'expense')
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);

    const grossProfit = revenue - expenses;
    const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    
    return { revenue, expenses, grossProfit, profitMargin };
  };

  const { revenue, expenses, grossProfit, profitMargin } = calculatePnl();

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/3"></div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Total Revenue</div>
                <div className="text-3xl font-bold text-emerald-600">${revenue.toFixed(2)}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Total Expenses</div>
                <div className="text-3xl font-bold text-red-600">${expenses.toFixed(2)}</div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Net Profit</div>
                <div className={`text-3xl font-bold ${grossProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${grossProfit.toFixed(2)}
                </div>
                <div className="text-sm text-slate-500">
                  {profitMargin.toFixed(1)}% margin
                </div>
              </div>
              <Badge variant={grossProfit >= 0 ? "default" : "destructive"} className="text-lg px-3 py-1">
                {grossProfit >= 0 ? "+" : ""}{profitMargin.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed P&L Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Profit & Loss Statement
          </CardTitle>
          <div className="text-sm text-slate-500">
            {/* Ensure start and end are valid Date objects before formatting */}
            {start instanceof Date && !isNaN(start) ? format(start, "MMM d, yyyy") : 'N/A'} - {end instanceof Date && !isNaN(end) ? format(end, "MMM d, yyyy") : 'N/A'}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Revenue</h3>
              <div className="space-y-2">
                {accounts.filter(a => a.type === 'revenue').map((account) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-700">{account.name}</span>
                    <span className="font-semibold text-emerald-600">${Math.abs(account.balance || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 border-t-2 border-slate-300 font-bold">
                  <span className="text-slate-900">Total Revenue</span>
                  <span className="text-emerald-600">${revenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Expenses</h3>
              <div className="space-y-2">
                 {accounts.filter(a => a.type === 'expense').map((account) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-700">{account.name}</span>
                    <span className="font-semibold text-red-600">${(account.balance || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 border-t-2 border-slate-300 font-bold">
                  <span className="text-slate-900">Total Expenses</span>
                  <span className="text-red-600">${expenses.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-slate-900">Net Profit</span>
                <span className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${grossProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
