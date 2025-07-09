import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import { Tax } from '@/api/entities';

export default function TaxSettings({ taxes, onClose, onUpdate }) {
  const [taxList, setTaxList] = useState(taxes || []);
  const [newTax, setNewTax] = useState({
    name: '',
    rate: 0,
    type: 'sales',
    account_id: '',
    organization_id: 'default_org'
  });

  const handleAddTax = async () => {
    try {
      await Tax.create(newTax);
      setNewTax({ name: '', rate: 0, type: 'sales', account_id: '', organization_id: 'default_org' });
      onUpdate();
    } catch (error) {
      console.error('Error adding tax:', error);
    }
  };

  const handleDeleteTax = async (taxId) => {
    try {
      await Tax.delete(taxId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting tax:', error);
    }
  };

  const handleUpdateTax = async (taxId, field, value) => {
    try {
      const tax = taxList.find(t => t.id === taxId);
      await Tax.update(taxId, { ...tax, [field]: value });
      onUpdate();
    } catch (error) {
      console.error('Error updating tax:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tax Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          {/* Add New Tax */}
          <div className="mb-6 p-4 border rounded-lg bg-slate-50">
            <h3 className="font-semibold mb-4">Add New Tax</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="tax_name">Tax Name</Label>
                <Input
                  id="tax_name"
                  value={newTax.name}
                  onChange={e => setNewTax(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., GST"
                />
              </div>
              <div>
                <Label htmlFor="tax_rate">Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  value={newTax.rate}
                  onChange={e => setNewTax(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="tax_type">Type</Label>
                <Select value={newTax.type} onValueChange={val => setNewTax(prev => ({ ...prev, type: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Tax</SelectItem>
                    <SelectItem value="purchase">Purchase Tax</SelectItem>
                    <SelectItem value="withholding">Withholding Tax</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddTax} disabled={!newTax.name || newTax.rate <= 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tax
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Taxes */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Name</TableHead>
                <TableHead>Rate (%)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxList.length > 0 ? taxList.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell>
                    <Input
                      value={tax.name}
                      onChange={e => handleUpdateTax(tax.id, 'name', e.target.value)}
                      className="border-0 bg-transparent"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={tax.rate}
                      onChange={e => handleUpdateTax(tax.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="border-0 bg-transparent w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={tax.type} onValueChange={val => handleUpdateTax(tax.id, 'type', val)}>
                      <SelectTrigger className="border-0 bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="withholding">Withholding</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTax(tax.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan="4" className="text-center py-8 text-slate-500">
                    No taxes configured. Add your first tax above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}