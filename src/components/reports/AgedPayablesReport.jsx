
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function AgedPayablesReport({ data }) {
  const { bills, loading } = data;

  const getAgedPayables = () => {
    const outstandingBills = (bills || []).filter(b => b.status === 'awaiting_payment' || b.status === 'overdue');
    const today = new Date();
    
    const aged = {
      current: [],
      days_1_30: [],
      days_31_60: [],
      days_61_90: [],
      days_over_90: []
    };

    outstandingBills.forEach(bill => {
      const daysOverdue = differenceInDays(today, new Date(bill.due_date));
      
      if (daysOverdue <= 0) {
        aged.current.push(bill);
      } else if (daysOverdue <= 30) {
        aged.days_1_30.push(bill);
      } else if (daysOverdue <= 60) {
        aged.days_31_60.push(bill);
      } else if (daysOverdue <= 90) {
        aged.days_61_90.push(bill);
      } else {
        aged.days_over_90.push(bill);
      }
    });

    return aged;
  };

  const calculateTotals = (billList) => {
    return billList.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  };

  const agedPayables = getAgedPayables();
  
  const totals = {
    current: calculateTotals(agedPayables.current),
    days_1_30: calculateTotals(agedPayables.days_1_30),
    days_31_60: calculateTotals(agedPayables.days_31_60),
    days_61_90: calculateTotals(agedPayables.days_61_90),
    days_over_90: calculateTotals(agedPayables.days_over_90)
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
    { key: 'current', label: 'Current (Not Due)', bills: agedPayables.current, total: totals.current, color: 'emerald', icon: CheckCircle },
    { key: 'days_1_30', label: '1-30 Days Overdue', bills: agedPayables.days_1_30, total: totals.days_1_30, color: 'yellow', icon: Clock },
    { key: 'days_31_60', label: '31-60 Days Overdue', bills: agedPayables.days_31_60, total: totals.days_31_60, color: 'orange', icon: Clock },
    { key: 'days_61_90', label: '61-90 Days Overdue', bills: agedPayables.days_61_90, total: totals.days_61_90, color: 'red', icon: AlertTriangle },
    { key: 'days_over_90', label: 'Over 90 Days Overdue', bills: agedPayables.days_over_90, total: totals.days_over_90, color: 'red', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-8">
      <Card className="border-2 border-slate-300">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-2">Total Outstanding Payables</div>
            <div className="text-4xl font-bold text-slate-900">${grandTotal.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
            <CardTitle>Aged Payables Summary</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 font-semibold">Supplier</th>
                            <th className="text-right py-2 font-semibold">Current</th>
                            <th className="text-right py-2 font-semibold">1-30 Days</th>
                            <th className="text-right py-2 font-semibold">31-60 Days</th>
                            <th className="text-right py-2 font-semibold">61-90 Days</th>
                            <th className="text-right py-2 font-semibold">&gt;90 Days</th>
                            <th className="text-right py-2 font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                       {/* This needs a summary by contact, for now showing total line */}
                       <tr className="border-t-2 font-bold">
                            <td className="py-3">Total</td>
                            <td className="py-3 text-right">${totals.current.toFixed(2)}</td>
                            <td className="py-3 text-right">${totals.days_1_30.toFixed(2)}</td>
                            <td className="py-3 text-right">${totals.days_31_60.toFixed(2)}</td>
                            <td className="py-3 text-right">${totals.days_61_90.toFixed(2)}</td>
                            <td className="py-3 text-right">${totals.days_over_90.toFixed(2)}</td>
                            <td className="py-3 text-right">${grandTotal.toFixed(2)}</td>
                       </tr>
                    </tbody>
                </table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
