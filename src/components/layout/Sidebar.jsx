import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Users, 
  Building2, 
  BarChart3, 
  Banknote,
  Calculator,
  Package,
  Settings,
  CreditCard,
  UserCheck
} from "lucide-react";

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
    title: "Bills",
    url: createPageUrl("Bills"),
    icon: FileText,
  },
  {
    title: "Contacts",
    url: createPageUrl("Contacts"),
    icon: Users,
  },
  {
    title: "Accounts",
    url: createPageUrl("Accounts"),
    icon: Building2,
  },
  {
    title: "Banking",
    url: createPageUrl("Banking"),
    icon: Banknote,
  },
  {
    title: "Quotes",
    url: createPageUrl("Quotes"),
    icon: CreditCard,
  },
  {
    title: "Inventory",
    url: createPageUrl("Inventory"),
    icon: Package,
  },
  {
    title: "Expenses",
    url: createPageUrl("Expenses"),
    icon: Calculator,
  },
  {
    title: "Payroll",
    url: createPageUrl("Payroll"),
    icon: UserCheck,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Sidebar({ currentPageName }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">AccounTech</h2>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPageName === item.title
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}