
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import FileUpload from '../common/FileUpload';

export default function ExpenseForm({ expense, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    status: expense?.status || 'submitted',
    organization_id: expense?.organization_id || 'default_org'
  });
  const [attachments, setAttachments] = useState(expense?.attachments || []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // The handleAttachmentsChange function is no longer needed as setAttachments is passed directly to FileUpload
  // and receipt_url is no longer managed via formData.

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({...formData, attachments});
  };

  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle>{expense ? 'Edit' : 'New'} Expense Claim</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} required placeholder="e.g., Client lunch meeting" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={e => handleChange('amount', parseFloat(e.target.value))} required />
            </div>
          </div>
          <div>
            <Label>Receipts / Attachments</Label>
            <FileUpload attachments={attachments} onAttachmentsChange={setAttachments} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
            <Button type="submit"><Save className="w-4 h-4 mr-2" />Submit Claim</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
