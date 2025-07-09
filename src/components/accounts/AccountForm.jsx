import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";

const accountCategories = {
  asset: ["current_asset", "fixed_asset", "other_asset"],
  liability: ["current_liability", "long_term_liability", "other_liability"],
  equity: ["equity"],
  revenue: ["operating_revenue", "other_revenue"],
  expense: ["operating_expense", "other_expense"]
};

export default function AccountForm({ account, accounts, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    code: account?.code || "",
    name: account?.name || "",
    type: account?.type || "asset",
    category: account?.category || "current_asset",
    parent_account_id: account?.parent_account_id || "",
    description: account?.description || "",
    is_active: account?.is_active ?? true,
    organization_id: account?.organization_id || "default_org"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset category when type changes
    if (field === 'type') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        category: accountCategories[value][0]
      }));
    }
  };

  const availableParentAccounts = accounts.filter(acc => 
    acc.type === formData.type && acc.id !== account?.id
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          {account ? "Edit Account" : "New Account"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="code">Account Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                required
                placeholder="e.g., 1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="e.g., Cash and Cash Equivalents"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Account Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountCategories[formData.type]?.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_account">Parent Account (Optional)</Label>
              <Select value={formData.parent_account_id} onValueChange={(value) => handleChange('parent_account_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {availableParentAccounts.map(parentAccount => (
                    <SelectItem key={parentAccount.id} value={parentAccount.id}>
                      {parentAccount.code} - {parentAccount.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Account Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                />
                <span className="text-sm text-slate-600">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of this account's purpose..."
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
              Save Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}