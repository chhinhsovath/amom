import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function CashFlowReport({ data, dateRange }) {
  const { invoices, bills, transactions, loading } = data;
  const { start, end } = dateRange;

  const generateCashFlowData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issue_date);
        return invDate >= monthStart && invDate <= monthEnd && inv.status === 'paid';
      });
      
      const monthBills = bills.filter(bill => {
        const billDate = new Date(bill.issue_date);
        return billDate >= monthStart && billDate <= monthEnd && bill.status === 'paid';
      });
      
      const cashIn = monthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const cashOut = monthBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
      const netCash = cashIn - cashOut;
      
      months.push({
        month: format(monthDate, 'MMM yyyy'),
        cashIn,
        cashOut,
        netCash,
        date: monthDate
      });
    }
    
    return months;
  };

  const cashFlowData = generateCashFlowData();
  
  const totalCashIn = cashFlowData.reduce((sum, month) => sum + month.cashIn, 0);
  const totalCashOut = cashFlowData.reduce((sum, month) => sum + month.cashOut, 0);
  const netCashFlow = totalCashIn - totalCashOut;

  const getCurrentMonthFlow = () => {
    const currentMonth = cashFlowData[cashFlowData.length - 1];
    return currentMonth || { cashIn: 0, cashOut: 0, netCash: 0 };
  };

  const currentMonth = getCurrentMonthFlow();

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
                <div className="text-sm font-medium text-slate-600">Cash Inflow</div>
                <div className="text-3xl font-bold text-emerald-600">${totalCashIn.toFixed(2)}</div>
                <div className="text-sm text-slate-500 mt-1">
                  This month: ${currentMonth.cashIn.toFixed(2)}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Cash Outflow</div>
                <div className="text-3xl font-bold text-red-600">${totalCashOut.toFixed(2)}</div>
                <div className="text-sm text-slate-500 mt-1">
                  This month: ${currentMonth.cashOut.toFixed(2)}
                </div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">Net Cash Flow</div>
                <div className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${netCashFlow.toFixed(2)}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  This month: ${currentMonth.netCash.toFixed(2)}
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">12-Month Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
              <Line type="monotone" dataKey="cashIn" stroke="#10B981" strokeWidth={3} name="Cash In" />
              <Line type="monotone" dataKey="cashOut" stroke="#EF4444" strokeWidth={3} name="Cash Out" />
              <Line type="monotone" dataKey="netCash" stroke="#3B82F6" strokeWidth={3} name="Net Cash Flow" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly Cash Flow Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
              <Bar dataKey="cashIn" fill="#10B981" name="Cash In" />
              <Bar dataKey="cashOut" fill="#EF4444" name="Cash Out" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cash Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Detailed Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 text-slate-900 font-semibold">Month</th>
                  <th className="text-right py-3 text-slate-900 font-semibold">Cash In</th>
                  <th className="text-right py-3 text-slate-900 font-semibold">Cash Out</th>
                  <th className="text-right py-3 text-slate-900 font-semibold">Net Flow</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((month, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-3 text-slate-700">{month.month}</td>
                    <td className="text-right py-3 text-emerald-600 font-semibold">
                      ${month.cashIn.toFixed(2)}
                    </td>
                    <td className="text-right py-3 text-red-600 font-semibold">
                      ${month.cashOut.toFixed(2)}
                    </td>
                    <td className={`text-right py-3 font-semibold ${
                      month.netCash >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      ${month.netCash.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}