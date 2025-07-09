import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import { format } from 'date-fns';

export default function BudgetForm({ budget, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    period_type: budget?.period_type || 'monthly',
    start_date: budget?.start_date || format(new Date(), 'yyyy-MM-dd'),
    end_date: budget?.end_date || '',
    status: budget?.status || 'draft',
    description: budget?.description || '',
    organization_id: budget?.organization_id || 'default_org'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle>{budget ? 'Edit' : 'New'} Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name</Label>
              <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required placeholder="e.g., 2024 Marketing Budget" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={val => handleChange('status', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" value={formData.start_date} onChange={e => handleChange('start_date', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" value={formData.end_date} onChange={e => handleChange('end_date', e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="period_type">Period Type</Label>
              <Select value={formData.period_type} onValueChange={val => handleChange('period_type', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Description of the budget's purpose." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
            <Button type="submit"><Save className="w-4 h-4 mr-2" />Save Budget</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}