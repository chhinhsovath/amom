
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, ArrowDownLeft, ArrowUpRight, Repeat } from "lucide-react"; // Added new icons
import { format } from "date-fns";

export default function TransactionForm({ bankAccounts, accounts, initialType, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    type: initialType || 'spend', // Changed initialization
    bank_account_id: "",
    contact_id: "", // Added contact_id as per outline
    organization_id: "default_org",
    date: format(new Date(), 'yyyy-MM-dd'),
    description: "",
    reference: "",
    amount: 0,
    account_id: "",
    // tax_amount removed from state based on outline
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const expenseAccounts = accounts.filter(acc => acc.type === 'expense');
  const revenueAccounts = accounts.filter(acc => acc.type === 'revenue');

  // Determine which accounts to show in the dropdown based on transaction type
  let accountsForDropdown = accounts; // Default to all accounts for 'transfer' or if types don't match
  if (formData.type === 'spend') {
    accountsForDropdown = expenseAccounts;
  } else if (formData.type === 'receive') {
    accountsForDropdown = revenueAccounts;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"> {/* New wrapper div for overlay */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">
            New Transaction {/* Changed title as per outline */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New transaction type selection buttons */}
            <div className="p-1 bg-slate-100 rounded-lg flex gap-1">
              <Button
                type="button"
                onClick={() => handleChange('type', 'spend')}
                variant={formData.type === 'spend' ? 'default' : 'ghost'}
                className={`flex-1 ${formData.type === 'spend' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />Spend Money
              </Button>
              <Button
                type="button"
                onClick={() => handleChange('type', 'receive')}
                variant={formData.type === 'receive' ? 'default' : 'ghost'}
                className={`flex-1 ${formData.type === 'receive' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />Receive Money
              </Button>
              <Button
                type="button"
                onClick={() => handleChange('type', 'transfer')}
                variant={formData.type === 'transfer' ? 'default' : 'ghost'}
                className={`flex-1 ${formData.type === 'transfer' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
              >
                <Repeat className="w-4 h-4 mr-2" />Transfer Money
              </Button>
            </div>
            {/* End new transaction type selection buttons */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bank_account_id">Bank Account *</Label>
                <Select value={formData.bank_account_id} onValueChange={(value) => handleChange('bank_account_id', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Original 'type' select was removed here as per outline */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleChange('reference', e.target.value)}
                  placeholder="Check #, Transfer ID, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_id">Account *</Label>
                <Select value={formData.account_id} onValueChange={(value) => handleChange('account_id', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountsForDropdown.map(account => ( // Using filtered accounts based on type
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                placeholder="Describe the transaction..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                Save Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
