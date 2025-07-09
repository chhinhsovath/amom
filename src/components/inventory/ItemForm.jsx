import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';

export default function ItemForm({ item, accounts, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    description: item?.description || '',
    sales_price: item?.sales_price || 0,
    purchase_price: item?.purchase_price || 0,
    sales_account_id: item?.sales_account_id || '',
    purchase_account_id: item?.purchase_account_id || '',
    inventory_account_id: item?.inventory_account_id || '',
    cogs_account_id: item?.cogs_account_id || '',
    is_tracked: item?.is_tracked || false,
    quantity_on_hand: item?.quantity_on_hand || 0,
    organization_id: item?.organization_id || 'default_org'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const salesAccounts = accounts.filter(a => a.type === 'revenue');
  const expenseAccounts = accounts.filter(a => a.type === 'expense');
  const assetAccounts = accounts.filter(a => a.type === 'asset');

  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader><CardTitle>{item ? 'Edit' : 'New'} Item</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div><Label>Item Code</Label><Input value={formData.code} onChange={e => handleChange('code', e.target.value)} /></div>
            <div><Label>Item Name</Label><Input value={formData.name} onChange={e => handleChange('name', e.target.value)} required /></div>
          </div>
          <div><Label>Description</Label><Textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} /></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div><Label>Sales Price</Label><Input type="number" step="0.01" value={formData.sales_price} onChange={e => handleChange('sales_price', parseFloat(e.target.value))} /></div>
            <div><Label>Sales Account</Label><Select value={formData.sales_account_id} onValueChange={val => handleChange('sales_account_id', val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{salesAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Purchase Price</Label><Input type="number" step="0.01" value={formData.purchase_price} onChange={e => handleChange('purchase_price', parseFloat(e.target.value))} /></div>
            <div><Label>Purchase Account</Label><Select value={formData.purchase_account_id} onValueChange={val => handleChange('purchase_account_id', val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{expenseAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_tracked" checked={formData.is_tracked} onCheckedChange={val => handleChange('is_tracked', val)} />
            <Label htmlFor="is_tracked">Track inventory for this item</Label>
          </div>
          {formData.is_tracked && (
            <div className="grid md:grid-cols-3 gap-6 p-4 border rounded-lg">
                <div><Label>Inventory Account</Label><Select value={formData.inventory_account_id} onValueChange={val => handleChange('inventory_account_id', val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{assetAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>COGS Account</Label><Select value={formData.cogs_account_id} onValueChange={val => handleChange('cogs_account_id', val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{expenseAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Opening Quantity</Label><Input type="number" value={formData.quantity_on_hand} onChange={e => handleChange('quantity_on_hand', parseInt(e.target.value))} /></div>
            </div>
          )}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2"/>Cancel</Button><Button type="submit"><Save className="w-4 h-4 mr-2"/>Save Item</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}