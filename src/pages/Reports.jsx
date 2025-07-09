
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Calendar,
  Download,
  Filter,
  PieChart,
  LineChart,
  Scale,
  Star,
  Search
} from "lucide-react";
import { Invoice, Bill, Account, JournalEntry, Transaction } from "@/api/entities";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ProfitLossReport from "../components/reports/ProfitLossReport";
import BalanceSheetReport from "../components/reports/BalanceSheetReport";
import CashFlowReport from "../components/reports/CashFlowReport";
import AgedReceivablesReport from "../components/reports/AgedReceivablesReport";
import AgedPayablesReport from "../components/reports/AgedPayablesReport"; // Added
import FinancialRatios from "../components/reports/FinancialRatios";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("profit_loss");
  const [dateRange, setDateRange] = useState("this_month");
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState({
    invoices: [],
    bills: [],
    accounts: [],
    transactions: [],
    loading: true
  });

  const favoriteReports = [
    { id: "account_transactions", name: "Account Transactions", icon: FileText, page: "AccountTransactions" },
    { id: "aged_payables_summary", name: "Aged Payables Summary", icon: FileText, page: "Reports" },
    { id: "aged_receivables", name: "Aged Receivables Summary", icon: FileText, page: "Reports" }, // Harmonized ID
    { id: "balance_sheet", name: "Balance Sheet", icon: BarChart3, page: "Reports" },
    { id: "profit_loss", name: "Profit and Loss", icon: TrendingUp, page: "Reports" },
    { id: "sales_tax_report", name: "Sales Tax Report", icon: FileText, page: "Reports" }
  ];

  const reportCategories = [
    {
      title: "Financial performance",
      reports: [
        { name: "Analytics - Business snapshot", icon: BarChart3, description: "High-level view of your business performance" },
        { name: "Analytics - Short-term cash flow", icon: LineChart, description: "Cash flow forecast for the next 13 weeks" },
        { name: "Budget Manager", icon: PieChart, description: "Compare actual performance to budget" },
        { name: "Budget Summary", icon: BarChart3, badge: "New", description: "Summary of budget vs actual" },
        { name: "Budget Variance", icon: BarChart3, description: "Detailed budget variance analysis" },
        { name: "Business Performance", icon: TrendingUp, description: "Key performance indicators" },
        { name: "Cash Summary", icon: LineChart, description: "Cash position summary" },
        { name: "Executive Summary", icon: BarChart3, description: "Executive-level financial summary" },
        { name: "Tracking Summary", icon: FileText, description: "Tracking category analysis" }
      ]
    },
    {
      title: "Financial statements",
      reports: [
        { id: "balance_sheet", name: "Balance Sheet", icon: BarChart3, favorite: true, description: "Statement of financial position" }, // Added id for consistency
        { name: "Bank Report", icon: FileText, description: "Bank account reconciliation report" },
        { name: "Depreciation Schedule", icon: FileText, description: "Fixed asset depreciation details" },
        { name: "Disposal Schedule", icon: FileText, description: "Fixed asset disposal summary" },
        { name: "Fixed Asset Reconciliation", icon: FileText, description: "Fixed asset movement report" },
        { name: "Management Report", icon: BarChart3, description: "Comprehensive management reporting" },
        { name: "Movements in Equity", icon: FileText, description: "Changes in equity position" },
        { id: "profit_loss", name: "Profit and Loss", icon: TrendingUp, favorite: true, description: "Income statement" }, // Added id for consistency
        { id: "cash_flow", name: "Statement of Cash Flows - Direct Method", icon: LineChart, description: "Direct method cash flow statement" } // Added id for consistency
      ]
    },
    {
      title: "Payables and receivables",
      reports: [
        { name: "Aged Payables Detail", icon: FileText, description: "Detailed aged payables report" },
        { id: "aged_payables_summary", name: "Aged Payables Summary", icon: FileText, favorite: true, description: "Summary of outstanding payables" }, // Added id for consistency
        { name: "Aged Receivables Detail", icon: FileText, description: "Detailed aged receivables report" },
        { id: "aged_receivables", name: "Aged Receivables Summary", icon: FileText, favorite: true, description: "Summary of outstanding receivables" }, // Added id for consistency
        { name: "Bills/Expenses - Outstanding", icon: FileText, description: "Outstanding bills and expenses" },
        { name: "Contact Transactions - Summary", icon: FileText, description: "Transaction summary by contact" },
        { name: "Expense Claim Detail", icon: FileText, description: "Detailed expense claim report" },
        { name: "Income and Expenses by Contact", icon: FileText, description: "P&L by customer/supplier" },
        { name: "Payable Invoice Detail", icon: FileText, description: "Detailed payable invoice report" },
        { name: "Payable Invoice Summary", icon: FileText, description: "Summary of payable invoices" },
        { name: "Receivable Invoice Detail", icon: FileText, description: "Detailed receivable invoice report" },
        { name: "Receivable Invoice Summary", icon: FileText, description: "Summary of receivable invoices" }
      ]
    },
    {
      title: "Payroll",
      reports: [
        { name: "Pay Run by Employee", icon: FileText, description: "Individual employee pay details" },
        { name: "Pay Run by Pay Item", icon: FileText, description: "Pay details by pay item" },
        { name: "Pay Run Summary", icon: FileText, description: "Summary of payroll runs" }
      ]
    },
    {
      title: "Projects",
      reports: [
        { name: "Detailed Time", icon: FileText, description: "Detailed time tracking report" },
        { name: "Project Details", icon: FileText, description: "Comprehensive project analysis" },
        { name: "Project Financials", icon: BarChart3, description: "Project financial performance" },
        { name: "Project Summary", icon: FileText, description: "Summary of all projects" }
      ]
    },
    {
      title: "Reconciliations",
      reports: [
        { name: "Account Summary", icon: FileText, description: "Summary of all accounts" },
        { name: "Bank Reconciliation", icon: FileText, description: "Bank reconciliation details" },
        { name: "Bank Summary", icon: FileText, description: "Bank account summary" },
        { name: "Cash Validation Customer Report", icon: FileText, description: "Customer payment validation" },
        { name: "Inventory Item List", icon: FileText, description: "Current inventory listing" },
        { name: "Reconciliation Reports", icon: FileText, description: "Various reconciliation reports" },
        { name: "Unreconciled Statement Lines", icon: FileText, description: "Outstanding bank statement lines" }
      ]
    },
    {
      title: "Taxes and balances",
      reports: [
        { name: "Foreign Currency Gains and Losses", icon: FileText, description: "Currency exchange impact" },
        { name: "General Ledger Detail", icon: FileText, description: "Detailed general ledger report" },
        { name: "General Ledger Exceptions", icon: FileText, description: "General ledger discrepancies" },
        { name: "General Ledger Summary", icon: FileText, description: "Summary general ledger" },
        { name: "Journal Report", icon: FileText, description: "Manual journal entries" },
        { name: "Sales Tax Report", icon: FileText, favorite: true, description: "Sales tax liability report" },
        { name: "Tax Reconciliation", icon: FileText, description: "Tax reconciliation details" },
        { name: "Trial Balance", icon: BarChart3, description: "Trial balance report" }
      ]
    },
    {
      title: "Transactions",
      reports: [
        { id: "account_transactions", name: "Account Transactions", icon: FileText, favorite: true, description: "Detailed account transaction listing" }, // Added id for consistency
        { name: "Duplicate Statement Lines", icon: FileText, description: "Potential duplicate transactions" },
        { name: "Inventory Item Details", icon: FileText, description: "Inventory movement details" },
        { name: "Sales by Item", icon: FileText, description: "Sales analysis by product/service" }
      ]
    }
  ];

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setReportData(prev => ({ ...prev, loading: true }));
    try {
      const [invoices, bills, accounts, transactions] = await Promise.all([
        Invoice.list('-issue_date').catch(() => []),
        Bill.list('-issue_date').catch(() => []),
        Account.list('code').catch(() => []),
        Transaction.list('-date').catch(() => [])
      ]);

      setReportData({
        invoices: invoices || [],
        bills: bills || [],
        accounts: accounts || [],
        transactions: transactions || [],
        loading: false
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      setReportData({
        invoices: [],
        bills: [],
        accounts: [],
        transactions: [],
        loading: false
      });
    }
  };

  const getDateRange = () => {
    const today = new Date();
    switch(dateRange) {
      case "this_month":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case "last_month":
        const lastMonth = subMonths(today, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "this_year":
        return { start: new Date(today.getFullYear(), 0, 1), end: new Date(today.getFullYear(), 11, 31) };
      case "last_year":
        return { start: new Date(today.getFullYear() - 1, 0, 1), end: new Date(today.getFullYear() - 1, 11, 31) };
      default:
        return { start: startOfMonth(today), end: endOfMonth(today) };
    }
  };

  const renderReport = () => {
    const { start, end } = getDateRange();
    
    switch(selectedReport) {
      case "profit_loss":
        return <ProfitLossReport data={reportData} dateRange={{ start, end }} />;
      case "balance_sheet":
        return <BalanceSheetReport data={reportData} dateRange={{ start, end }} />;
      case "cash_flow":
        return <CashFlowReport data={reportData} dateRange={{ start, end }} />;
      case "aged_receivables":
        return <AgedReceivablesReport data={reportData} />;
      case "aged_payables_summary":
        return <AgedPayablesReport data={reportData} />; // Added
      case "financial_ratios":
        return <FinancialRatios />;
      case "account_transactions":
        // This is handled via Link component now, so no complex render here
        return <div className="text-center py-12 text-slate-500">Redirecting to Account Transactions...</div>;
      default:
        return <div className="text-center py-12 text-slate-500">Report coming soon...</div>;
    }
  };

  const handleReportClick = (report) => {
      // If the report specifies a page other than "Reports", let the Link component handle navigation.
      // Otherwise, update the selectedReport state to render the report on this page.
      if (report.page && report.page !== "Reports") {
          return;
      }
      setSelectedReport(report.id || report.name.toLowerCase().replace(/\s+/g, '_'));
  }

  const filteredCategories = reportCategories.map(category => ({
    ...category,
    reports: category.reports.filter(report => 
      report.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.reports.length > 0);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">Comprehensive business insights and analytics</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Find a report"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Report Browser */}
        <div className="lg:col-span-1 space-y-6">
          {/* Favorites */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                Favourites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {favoriteReports.map(report => (
                <Link to={createPageUrl(report.page)} key={report.id} onClick={() => handleReportClick(report)}>
                  <div
                    className={`w-full text-left p-2 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer ${
                      selectedReport === report.id ? 'bg-emerald-100 text-emerald-800' : 'text-slate-700'
                    }`}
                  >
                    <report.icon className="w-4 h-4" />
                    <span className="text-sm">{report.name}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Show Descriptions Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium">Show descriptions</span>
            <Switch
              checked={showDescriptions}
              onCheckedChange={setShowDescriptions}
            />
          </div>

          {/* All Reports */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">All reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {filteredCategories.map(category => (
                <div key={category.title}>
                  <h3 className="font-semibold text-slate-900 mb-3">{category.title}</h3>
                  <div className="space-y-1">
                    {category.reports.map(report => {
                      // Prioritize 'id' if available, otherwise derive from 'name'
                      const reportId = report.id || report.name.toLowerCase().replace(/\s+/g, '_');
                      // Default to "Reports" page if no specific page is defined
                      const pageUrl = createPageUrl(report.page || "Reports"); 
                      
                      return (
                        <Link to={pageUrl} key={report.name} onClick={() => handleReportClick(report)}>
                          <div className={`w-full text-left p-2 rounded hover:bg-slate-100 text-slate-700 cursor-pointer ${
                              selectedReport === reportId ? 'bg-emerald-100' : ''
                          }`}>
                            <div className="flex items-center gap-2">
                              <report.icon className="w-4 h-4" />
                              <span className="text-sm flex-1">{report.name}</span>
                              {report.favorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                              {report.badge && (
                                <Badge variant="secondary" className="text-xs">{report.badge}</Badge>
                              )}
                            </div>
                            {showDescriptions && report.description && (
                              <p className="text-xs text-slate-500 mt-1 ml-6">{report.description}</p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-900">
                  {favoriteReports.find(r => r.id === selectedReport)?.name || 
                   reportCategories.flatMap(c => c.reports).find(r => (r.id === selectedReport || r.name.toLowerCase().replace(/\s+/g, '_') === selectedReport))?.name ||
                   'Financial Report'}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {renderReport()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
