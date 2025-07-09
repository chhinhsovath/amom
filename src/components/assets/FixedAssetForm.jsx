import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { format } from 'date-fns';

export default function FixedAssetForm({ asset, accounts, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    asset_name: asset?.asset_name || '',
    asset_number: asset?.asset_number || '',
    purchase_date: asset?.purchase_date || format(new Date(), 'yyyy-MM-dd'),
    purchase_price: asset?.purchase_price || 0,
    depreciation_method: asset?.depreciation_method || 'straight_line',
    useful_life_years: asset?.useful_life_years || 5,
    depreciation_rate: asset?.depreciation_rate || 20,
    status: asset?.status || 'active',
    asset_account_id: asset?.asset_account_id || '',
    accumulated_depreciation_account_id: asset?.accumulated_depreciation_account_id || '',
    depreciation_account_id: asset?.depreciation_account_id || '',
    organization_id: asset?.organization_id || 'default_org',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const assetAccounts = accounts.filter(a => a.category === 'fixed_asset');
  const expenseAccounts = accounts.filter(a => a.type === 'expense');

  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle>{asset ? 'Edit' : 'New'} Fixed Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="asset_name">Asset Name</Label>
              <Input id="asset_name" value={formData.asset_name} onChange={e => handleChange('asset_name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset_number">Asset Number</Label>
              <Input id="asset_number" value={formData.asset_number} onChange={e => handleChange('asset_number', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={e => handleChange('purchase_date', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input id="purchase_price" type="number" step="0.01" value={formData.purchase_price} onChange={e => handleChange('purchase_price', parseFloat(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depreciation_method">Depreciation Method</Label>
              <Select value={formData.depreciation_method} onValueChange={val => handleChange('depreciation_method', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight_line">Straight-line</SelectItem>
                  <SelectItem value="declining_balance">Declining Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.depreciation_method === 'straight_line' ? (
                <div className="space-y-2">
                    <Label htmlFor="useful_life_years">Useful Life (Years)</Label>
                    <Input id="useful_life_years" type="number" value={formData.useful_life_years} onChange={e => handleChange('useful_life_years', parseInt(e.target.value))} />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="depreciation_rate">Depreciation Rate (%)</Label>
                    <Input id="depreciation_rate" type="number" value={formData.depreciation_rate} onChange={e => handleChange('depreciation_rate', parseFloat(e.target.value))} />
                </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="asset_account_id">Asset Account</Label>
              <Select value={formData.asset_account_id} onValueChange={val => handleChange('asset_account_id', val)}><SelectTrigger><SelectValue placeholder="Select asset account" /></SelectTrigger><SelectContent>{assetAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="depreciation_account_id">Depreciation Expense Account</Label>
              <Select value={formData.depreciation_account_id} onValueChange={val => handleChange('depreciation_account_id', val)}><SelectTrigger><SelectValue placeholder="Select expense account" /></SelectTrigger><SelectContent>{expenseAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
            <Button type="submit"><Save className="w-4 h-4 mr-2" />Save Asset</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}