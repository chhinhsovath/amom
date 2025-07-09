
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Users, 
  CreditCard,
  Banknote,
  FileText,
  Mail,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const settingCategories = [
  {
    title: "General",
    key: "general",
    settings: [
      { name: "Organization details", description: "Address, logo and basic financial information", icon: Building2, link: createPageUrl("Settings") },
      { name: "Users", description: "Add, remove or modify users of this organization", icon: Users, link: createPageUrl("UserManagement") },
      { name: "Currencies", description: "Manage the currencies your business uses", icon: Banknote, link: "" },
    ]
  },
  {
    title: "Features",
    key: "features",
    settings: [
      { name: "Invoice settings", description: "Create branding themes, add payment services", icon: FileText, link: createPageUrl("InvoiceSettings") },
      { name: "Tax rates", description: "Set up and manage tax rates for transactions", icon: FileText, link: createPageUrl("TaxRates") },
      { name: "Payment services", description: "Add and manage online payment options", icon: CreditCard, link: createPageUrl("OnlinePayments") },
      { name: "Email settings", description: "Set a reply-to email address and templates", icon: Mail, link: "" },
      { name: "Expenses", description: "Manage your expense settings", icon: Receipt, link: createPageUrl("Expenses") },
    ]
  }
];

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState("general");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-slate-700" />
        <h1 className="text-3xl font-bold text-slate-900">Organization Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Navigation */}
        <div className="md:col-span-1">
          <ul className="space-y-1">
            {settingCategories.map(cat => (
              <li key={cat.key}>
                <button
                  onClick={() => setActiveCategory(cat.key)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Content */}
        <div className="md:col-span-3">
          <div className="space-y-4">
            {settingCategories
              .find(cat => cat.key === activeCategory)
              .settings.map(setting => (
                <Link to={setting.link || '#'} key={setting.name} className="block group">
                  <Card className="hover:border-emerald-500 hover:bg-emerald-50/50 transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border shadow-sm">
                         <setting.icon className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-emerald-800">{setting.name}</h3>
                        <p className="text-sm text-slate-500">{setting.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
