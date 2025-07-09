

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Menu,
  X,
  ChevronDown,
  Briefcase, // Added
  BookOpen, // Added
  Plus,
  Search,
  Bell,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup, // Added
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const businessNav = [
    { title: "Invoices", url: createPageUrl("Invoices") },
    { title: "Quotes", url: createPageUrl("Quotes") },
    { title: "Online Payments", url: createPageUrl("OnlinePayments") },
    { title: "Bills to pay", url: createPageUrl("Bills") },
    { title: "Purchase orders", url: createPageUrl("PurchaseOrders") },
    { title: "Expense claims", url: createPageUrl("Expenses") },
    { title: "Products & services", url: createPageUrl("Inventory") },
    { title: "Cheques", url: createPageUrl("Cheques") },
    { title: "Pay run", url: createPageUrl("Payroll") },
];

const accountingNav = [
    { title: "Bank accounts", url: createPageUrl("Banking") },
    { title: "Reports", url: createPageUrl("Reports") },
    { isSeparator: true },
    { title: "Account Transactions", url: createPageUrl("AccountTransactions") },
    { title: "Chart of accounts", url: createPageUrl("Accounts") },
    { title: "Fixed assets", url: createPageUrl("FixedAssets") },
    { title: "Manual journals", url: createPageUrl("JournalEntries") },
    { title: "Tax Rates", url: createPageUrl("TaxRates") },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const NavItem = ({ title, url }) => (
    <Link
      to={url}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === url
          ? 'bg-emerald-100 text-emerald-800'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {title}
    </Link>
  );

  const NavDropdown = ({ title, icon, items }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                {icon}
                <span>{title}</span>
                <ChevronDown className="w-4 h-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
                {items.map((item, index) => (
                    item.isSeparator ? (
                        <DropdownMenuSeparator key={index} />
                    ) : (
                        <Link to={item.url} key={item.title}>
                            <DropdownMenuItem>{item.title}</DropdownMenuItem>
                        </Link>
                    )
                ))}
            </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
  );

  const createNav = [
    { title: "Invoice", url: createPageUrl("Invoices?action=new") },
    { title: "Bill", url: createPageUrl("Bills?action=new") },
    { title: "Contact", url: createPageUrl("Contacts?action=new") },
    { title: "Quote", url: createPageUrl("Quotes?action=new") },
    { title: "Purchase order", url: createPageUrl("PurchaseOrders?action=new") },
    { title: "Manual journal", url: createPageUrl("JournalEntries?action=new") },
    { isSeparator: true },
    { title: "Spend money", url: createPageUrl("Banking?action=new_transaction&type=spend") },
    { title: "Receive money", url: createPageUrl("Banking?action=new_transaction&type=receive") },
    { title: "Transfer money", url: createPageUrl("Banking?action=new_transaction&type=transfer") },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <style>
        {`
          :root {
            --primary: 213 94% 68%;
            --primary-foreground: 0 0% 98%;
            --secondary: 220 14% 96%;
            --secondary-foreground: 220 9% 46%;
            --accent: 220 14% 96%;
            --accent-foreground: 220 9% 46%;
            --destructive: 0 84% 60%;
            --destructive-foreground: 0 0% 98%;
            --border: 220 13% 91%;
            --input: 220 13% 91%;
            --ring: 213 94% 68%;
            --background: 0 0% 100%;
            --foreground: 222 84% 5%;
            --card: 0 0% 100%;
            --card-foreground: 222 84% 5%;
            --popover: 0 0% 100%;
            --popover-foreground: 222 84% 5%;
            --muted: 220 14% 96%;
            --muted-foreground: 220 9% 46%;
          }
        `}
      </style>
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">AccounTech</h2>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
                <NavItem title="Dashboard" url={createPageUrl("Dashboard")} />
                <NavDropdown title="Business" icon={<Briefcase className="w-4 h-4"/>} items={businessNav} />
                <NavDropdown title="Accounting" icon={<BookOpen className="w-4 h-4"/>} items={accountingNav} />
                <NavItem title="Contacts" url={createPageUrl("Contacts")} />
            </nav>

            {/* Right side: Actions, User menu & mobile toggle */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white w-9 h-9">
                    <Plus className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Create new</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {createNav.map((item, index) => (
                      item.isSeparator ? (
                          <DropdownMenuSeparator key={index} />
                      ) : (
                          <Link to={item.url} key={item.title}>
                              <DropdownMenuItem>{item.title}</DropdownMenuItem>
                          </Link>
                      )
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon"><Search className="h-5 w-5 text-slate-500" /></Button>
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-slate-500" /></Button>
              <Button variant="ghost" size="icon"><HelpCircle className="h-5 w-5 text-slate-500" /></Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto">
                    <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-slate-600 font-semibold text-sm">U</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {user?.organization_name || 'Your Business'}
                      </p>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to={createPageUrl("Profile")} className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to={createPageUrl("Billing")} className="w-full">
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to={createPageUrl("Settings")} className="w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  <span className="sr-only">Open main menu</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              <Link 
                to={createPageUrl("Dashboard")} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                    location.pathname === createPageUrl("Dashboard")
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </Link>
              
              <h3 className="px-3 pt-4 pb-1 text-xs font-semibold uppercase text-slate-500">Business</h3>
              {businessNav.map(item => (
                <Link 
                  key={item.title} 
                  to={item.url} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    location.pathname === item.url
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
              
              <h3 className="px-3 pt-4 pb-1 text-xs font-semibold uppercase text-slate-500">Accounting</h3>
              {accountingNav.filter(i => !i.isSeparator).map(item => (
                <Link 
                  key={item.title} 
                  to={item.url} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    location.pathname === item.url
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
              
              <h3 className="px-3 pt-4 pb-1 text-xs font-semibold uppercase text-slate-500">Other</h3>
              <Link 
                to={createPageUrl("Contacts")} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                    location.pathname === createPageUrl("Contacts")
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Contacts
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Page Content */}
      <main>
        {children}
      </main>
    </div>
  );
}

