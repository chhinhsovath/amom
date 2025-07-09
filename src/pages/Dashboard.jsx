
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  FileText, 
  AlertTriangle,
  Users,
  Building2
} from "lucide-react";
import { Invoice, Bill, Contact, Account, Transaction } from "@/api/entities";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, isValid, parseISO } from "date-fns"; // Added import

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

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    invoices: [],
    bills: [],
    contacts: [],
    accounts: [],
    transactions: [],
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [invoices, bills, contacts, accounts, transactions] = await Promise.all([
        Invoice.list('-created_date', 10),
        Bill.list('-created_date', 10),
        Contact.list('-created_date', 10),
        Account.list('code', 20),
        Transaction.list('-date', 50)
      ]);

      setDashboardData({
        invoices: invoices || [],
        bills: bills || [],
        contacts: contacts || [],
        accounts: accounts || [],
        transactions: transactions || [],
        loading: false
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData({
        invoices: [],
        bills: [],
        contacts: [],
        accounts: [],
        transactions: [],
        loading: false
      });
    }
  };

  const getFinancialMetrics = () => {
    const invoices = dashboardData.invoices || [];
    const bills = dashboardData.bills || [];
    
    const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalBills = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;
    const overdueBills = bills.filter(bill => bill.status === 'overdue').length;
    
    return {
      totalInvoices,
      totalBills,
      netIncome: totalInvoices - totalBills,
      pendingInvoices,
      overdueBills
    };
  };

  const getCashFlowData = () => {
    const invoices = dashboardData.invoices || [];
    const bills = dashboardData.bills || [];
    const last6Months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthInvoices = invoices.filter(inv => {
        if (!inv.issue_date) return false;
        try {
          const invDate = typeof inv.issue_date === 'string' ? parseISO(inv.issue_date) : new Date(inv.issue_date);
          if (!isValid(invDate)) return false;
          return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
        } catch (error) {
          return false;
        }
      }).reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      const monthBills = bills.filter(bill => {
        if (!bill.issue_date) return false;
        try {
          const billDate = typeof bill.issue_date === 'string' ? parseISO(bill.issue_date) : new Date(bill.issue_date);
          if (!isValid(billDate)) return false;
          return billDate.getMonth() === date.getMonth() && billDate.getFullYear() === date.getFullYear();
        } catch (error) {
          return false;
        }
      }).reduce((sum, bill) => sum + (bill.total || 0), 0);
      
      last6Months.push({
        month: monthName,
        income: monthInvoices,
        expenses: monthBills,
        net: monthInvoices - monthBills
      });
    }
    
    return last6Months;
  };

  const getAccountTypeData = () => {
    const accounts = dashboardData.accounts || [];
    const typeGroups = accounts.reduce((acc, account) => {
      if (account.type) { // Ensure account.type is not undefined before accessing it
        acc[account.type] = (acc[account.type] || 0) + Math.abs(account.balance || 0);
      }
      return acc;
    }, {});

    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return Object.entries(typeGroups).map(([type, value], index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value,
      color: colors[index % colors.length]
    }));
  };

  const metrics = getFinancialMetrics();
  const cashFlowData = getCashFlowData();
  const accountTypeData = getAccountTypeData();

  if (dashboardData.loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your business finances</p>
        </div>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-4 py-2">
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              ${metrics.totalInvoices.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              ${metrics.totalBills.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600">-5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              ${metrics.netIncome.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-600">+18% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Pending Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {metrics.pendingInvoices + metrics.overdueBills}
            </div>
            <div className="text-sm text-orange-600 mt-2">
              {metrics.pendingInvoices} invoices, {metrics.overdueBills} bills
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Cash Flow Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
                <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Account Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accountTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {accountTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">{invoice.contact_name}</div>
                    <div className="text-sm text-slate-500">#{invoice.invoice_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">${invoice.total?.toFixed(2)}</div>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.bills.slice(0, 5).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">{bill.contact_name}</div>
                    <div className="text-sm text-slate-500">#{bill.bill_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">${bill.total?.toFixed(2)}</div>
                    <Badge variant={bill.status === 'paid' ? 'default' : 'secondary'}>
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
