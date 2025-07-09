import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function AgedReceivablesReport({ data }) {
  const { invoices, loading } = data;

  const getAgedReceivables = () => {
    const outstandingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
    const today = new Date();
    
    const aged = {
      current: [],
      days_1_30: [],
      days_31_60: [],
      days_61_90: [],
      days_over_90: []
    };

    outstandingInvoices.forEach(invoice => {
      const daysOverdue = differenceInDays(today, new Date(invoice.due_date));
      
      if (daysOverdue <= 0) {
        aged.current.push(invoice);
      } else if (daysOverdue <= 30) {
        aged.days_1_30.push(invoice);
      } else if (daysOverdue <= 60) {
        aged.days_31_60.push(invoice);
      } else if (daysOverdue <= 90) {
        aged.days_61_90.push(invoice);
      } else {
        aged.days_over_90.push(invoice);
      }
    });

    return aged;
  };

  const calculateTotals = (invoiceList) => {
    return invoiceList.reduce((sum, inv) => sum + (inv.total || 0), 0);
  };

  const agedReceivables = getAgedReceivables();
  
  const totals = {
    current: calculateTotals(agedReceivables.current),
    days_1_30: calculateTotals(agedReceivables.days_1_30),
    days_31_60: calculateTotals(agedReceivables.days_31_60),
    days_61_90: calculateTotals(agedReceivables.days_61_90),
    days_over_90: calculateTotals(agedReceivables.days_over_90)
  };

  const grandTotal = Object.values(totals).reduce((sum, amount) => sum + amount, 0);

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

  const agingBuckets = [
    { key: 'current', label: 'Current (Not Due)', invoices: agedReceivables.current, total: totals.current, color: 'emerald', icon: CheckCircle },
    { key: 'days_1_30', label: '1-30 Days', invoices: agedReceivables.days_1_30, total: totals.days_1_30, color: 'yellow', icon: Clock },
    { key: 'days_31_60', label: '31-60 Days', invoices: agedReceivables.days_31_60, total: totals.days_31_60, color: 'orange', icon: Clock },
    { key: 'days_61_90', label: '61-90 Days', invoices: agedReceivables.days_61_90, total: totals.days_61_90, color: 'red', icon: AlertTriangle },
    { key: 'days_over_90', label: 'Over 90 Days', invoices: agedReceivables.days_over_90, total: totals.days_over_90, color: 'red', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {agingBuckets.map((bucket) => (
          <Card key={bucket.key} className={`border-l-4 border-l-${bucket.color}-500`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <bucket.icon className={`w-5 h-5 text-${bucket.color}-500`} />
                <span className="text-sm font-medium text-slate-600">{bucket.invoices.length}</span>
              </div>
              <div className="text-sm text-slate-600 mb-1">{bucket.label}</div>
              <div className={`text-lg font-bold text-${bucket.color}-600`}>
                ${bucket.total.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grand Total */}
      <Card className="border-2 border-slate-300">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-2">Total Outstanding Receivables</div>
            <div className="text-4xl font-bold text-slate-900">${grandTotal.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {agingBuckets.map((bucket) => (
        bucket.invoices.length > 0 && (
          <Card key={bucket.key}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <bucket.icon className={`w-5 h-5 text-${bucket.color}-500`} />
                {bucket.label} - ${bucket.total.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 text-slate-900 font-semibold">Invoice #</th>
                      <th className="text-left py-3 text-slate-900 font-semibold">Customer</th>
                      <th className="text-left py-3 text-slate-900 font-semibold">Issue Date</th>
                      <th className="text-left py-3 text-slate-900 font-semibold">Due Date</th>
                      <th className="text-right py-3 text-slate-900 font-semibold">Amount</th>
                      <th className="text-right py-3 text-slate-900 font-semibold">Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucket.invoices.map((invoice) => {
                      const daysOverdue = differenceInDays(new Date(), new Date(invoice.due_date));
                      return (
                        <tr key={invoice.id} className="border-b border-slate-100">
                          <td className="py-3 text-slate-700">{invoice.invoice_number}</td>
                          <td className="py-3 text-slate-700">{invoice.contact_name}</td>
                          <td className="py-3 text-slate-700">
                            {format(new Date(invoice.issue_date), "MMM d, yyyy")}
                          </td>
                          <td className="py-3 text-slate-700">
                            {format(new Date(invoice.due_date), "MMM d, yyyy")}
                          </td>
                          <td className="text-right py-3 font-semibold text-slate-900">
                            ${invoice.total?.toFixed(2)}
                          </td>
                          <td className="text-right py-3">
                            {daysOverdue <= 0 ? (
                              <Badge className="bg-emerald-100 text-emerald-800">
                                Current
                              </Badge>
                            ) : (
                              <Badge className={`bg-${bucket.color}-100 text-${bucket.color}-800`}>
                                {daysOverdue} days
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
}