
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Users, 
  Building2, 
  BarChart3, 
  Banknote,
  // Additional Lucide icons for expanded Xero-style navigation items and features
  ClipboardList,    // For Purchase Orders
  CreditCard,       // For Expense Claims
  Package,          // For Products & Services
  ListChecks,       // For Chart of Accounts
  Building,         // For Fixed Assets (Building2 is already used for general Accounts)
  NotebookText,     // For Manual Journals
  Settings,         // For Settings
  HelpCircle,       // For Help
  PlusCircle,       // For the 'New' button
} from 'lucide-react';

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    url: createPageUrl("Invoices"),
    icon: Receipt,
  },
  {
    title: "Quotes", // New Xero-style item
    url: createPageUrl("Quotes"),
    icon: FileText, 
  },
  {
    title: "Bills",
    url: createPageUrl("Bills"),
    icon: FileText,
  },
  {
    title: "Purchase Orders", // New Xero-style item
    url: createPageUrl("PurchaseOrders"),
    icon: ClipboardList,
  },
  {
    title: "Expense Claims", // New Xero-style item
    url: createPageUrl("ExpenseClaims"),
    icon: CreditCard,
  },
  {
    title: "Products & Services", // New Xero-style item
    url: createPageUrl("ProductsServices"),
    icon: Package,
  },
  {
    title: "Contacts",
    url: createPageUrl("Contacts"),
    icon: Users,
  },
  {
    title: "Accounts", // Represents general accounts or bank accounts summary
    url: createPageUrl("Accounts"),
    icon: Building2,
  },
  {
    title: "Chart of Accounts", // New, more specific accounting item
    url: createPageUrl("ChartOfAccounts"),
    icon: ListChecks,
  },
  {
    title: "Fixed Assets", // New accounting item
    url: createPageUrl("FixedAssets"),
    icon: Building,
  },
  {
    title: "Manual Journals", // New accounting item
    url: createPageUrl("ManualJournals"),
    icon: NotebookText,
  },
  {
    title: "Banking",
    url: createPageUrl("Banking"),
    icon: Banknote,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: BarChart3,
  },
  {
    title: "Settings", // Common Xero top-level link for configuration
    url: createPageUrl("Settings"),
    icon: Settings,
  },
  {
    title: "Help", // Common Xero top-level link for support/documentation
    url: createPageUrl("Help"),
    icon: HelpCircle,
  },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {/* Implement 'New' button as a prominent Xero-style feature */}
      <Link
        to={createPageUrl("New")} // This path would typically lead to a quick-add modal or selection page for new transactions/contacts
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-emerald-600 text-white hover:bg-emerald-700"
      >
        <PlusCircle className="w-4 h-4" />
        <span>New</span>
      </Link>

      {navigationItems.map((item) => (
        <Link
          key={item.title}
          to={item.url}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === item.url
              ? 'bg-emerald-100 text-emerald-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}
