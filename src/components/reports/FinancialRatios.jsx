import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function FinancialRatios({ pnlData, balanceSheetData }) {
  const ratios = {
    currentRatio: {
        value: 2.5,
        label: "Current Ratio",
        goodThreshold: 2,
        icon: ShieldCheck,
        description: "Measures liquidity (Assets / Liabilities). Higher is better."
    },
    debtToEquity: {
        value: 0.8,
        label: "Debt-to-Equity",
        goodThreshold: 1.5,
        icon: Scale,
        description: "Measures leverage. Lower is generally better."
    },
    netProfitMargin: {
        value: 15.2,
        label: "Net Profit Margin",
        goodThreshold: 10,
        icon: TrendingUp,
        description: "Measures profitability. Higher is better."
    },
    quickRatio: {
        value: 1.2,
        label: "Quick Ratio",
        goodThreshold: 1,
        icon: AlertTriangle,
        description: "Measures immediate liquidity. Higher is better."
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Key Financial Ratios</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(ratios).map(ratio => (
          <div key={ratio.label} className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${ratio.value >= ratio.goodThreshold ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <ratio.icon className={`w-6 h-6 ${ratio.value >= ratio.goodThreshold ? 'text-emerald-700' : 'text-red-700'}`} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{ratio.label}</p>
              <p className="text-2xl font-bold">{ratio.value}{ratio.label.includes("Margin") ? "%" : ""}</p>
              <p className="text-xs text-slate-500">{ratio.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}