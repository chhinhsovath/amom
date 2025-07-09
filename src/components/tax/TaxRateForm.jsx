import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';

export default function TaxRateForm({ taxRate, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: taxRate?.name || '',
    rate: taxRate?.rate || 0,
    type: taxRate?.type || 'sales',
    organization_id: 'default_org'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{taxRate ? 'Edit' : 'New'} Tax Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tax Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="rate">Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
              required
              step="0.01"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}