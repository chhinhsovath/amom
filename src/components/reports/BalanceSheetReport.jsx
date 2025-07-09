
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function BalanceSheetReport({ data, dateRange }) {
  const { accounts, loading } = data;
  const { end } = dateRange;

  // Helper function to filter accounts by type
  const getSectionAccounts = (type) => accounts.filter(a => a.type === type);

  // Helper function to calculate total balance for a given account type
  const calculateTotal = (type) => {
    return getSectionAccounts(type).reduce((sum, acc) => sum + (acc.balance || 0), 0);
  };

  // Calculate totals for each major section
  const totalAssets = calculateTotal('asset');
  const totalLiabilities = calculateTotal('liability');
  const totalEquity = calculateTotal('equity');
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // Helper function to render a list of accounts for a given type
  const renderAccountList = (type) => {
    const sectionAccounts = getSectionAccounts(type);
    if (sectionAccounts.length === 0) {
      return <div className="text-slate-500 italic">No {type} accounts available.</div>;
    }
    return sectionAccounts.map(acc => (
      <div key={acc.id} className="flex justify-between items-center py-1">
        <span className="text-slate-700">{acc.name}</span>
        <span className="font-medium">${(acc.balance || 0).toLocaleString()}</span>
      </div>
    ));
  };
  
  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/3"></div>
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Balance Sheet</h2>
        <p className="text-slate-600">As at {format(end, "MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                {renderAccountList('asset')}
             </div>
            <div className="bg-emerald-50 p-4 rounded-lg mt-4"> {/* Added mt-4 for spacing */}
              <div className="flex justify-between items-center font-bold text-lg">
                <span className="text-slate-900">Total Assets</span>
                <span className="text-emerald-600">${totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities and Equity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Liabilities & Equity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Liabilities */}
            <div>
              <h3 className="font-semibold text-lg text-slate-800 mb-3">Liabilities</h3>
              <div className="space-y-2">
                {renderAccountList('liability')}
                <div className="flex justify-between items-center py-2 border-t border-slate-200 font-semibold">
                  <span>Total Liabilities</span>
                  <span>${totalLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Equity */}
            <div>
              <h3 className="font-semibold text-lg text-slate-800 mb-3">Equity</h3>
              <div className="space-y-2">
                {renderAccountList('equity')}
                <div className="flex justify-between items-center py-2 border-t border-slate-200 font-semibold">
                  <span>Total Equity</span>
                  <span>${totalEquity.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Total Liabilities and Equity */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-bold text-lg">
                <span className="text-slate-900">Total Liabilities & Equity</span>
                <span className="text-blue-600">${totalLiabilitiesAndEquity.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Check */}
      <Card className={`border-2 ${totalAssets === totalLiabilitiesAndEquity ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              {totalAssets === totalLiabilitiesAndEquity ? "✅ Balance Sheet Balanced" : "⚠️ Balance Sheet Out of Balance"}
            </div>
            <div className="text-sm text-slate-600">
              Assets: ${totalAssets.toLocaleString()} | Liabilities & Equity: ${totalLiabilitiesAndEquity.toLocaleString()}
            </div>
            {totalAssets !== totalLiabilitiesAndEquity && (
              <div className="text-sm text-red-600 mt-2">
                Difference: ${Math.abs(totalAssets - totalLiabilitiesAndEquity).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
