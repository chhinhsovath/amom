import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';

export default function JournalEntryForm({ journal, accounts, onSave, onCancel }) {
  const [narration, setNarration] = useState(journal?.description || '');
  const [date, setDate] = useState(journal?.date || format(new Date(), 'yyyy-MM-dd'));
  const [lines, setLines] = useState(journal?.lines || [
    { account_id: '', description: '', debit: '', credit: '' },
    { account_id: '', description: '', debit: '', credit: '' },
  ]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  useEffect(() => {
    const newTotals = lines.reduce((acc, line) => ({
      debit: acc.debit + (parseFloat(line.debit) || 0),
      credit: acc.credit + (parseFloat(line.credit) || 0),
    }), { debit: 0, credit: 0 });
    setTotals(newTotals);
  }, [lines]);

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    // Ensure only one of debit/credit has a value
    if (field === 'debit' && value !== '') newLines[index]['credit'] = '';
    if (field === 'credit' && value !== '') newLines[index]['debit'] = '';
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', description: '', debit: '', credit: '' }]);
  };

  const removeLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totals.debit !== totals.credit || totals.debit === 0) {
      alert('Totals must balance and not be zero.');
      return;
    }
    onSave({ narration, date, lines });
  };

  const isBalanced = totals.debit === totals.credit && totals.debit > 0;

  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle>{journal ? 'Edit' : 'New'} Manual Journal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="narration">Narration</Label>
              <Textarea
                id="narration"
                value={narration}
                onChange={e => setNarration(e.target.value)}
                required
                placeholder="Journal entry description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-12 gap-2 text-sm font-semibold p-2">
                <div className="col-span-4">Account</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-right">Debit</div>
                <div className="col-span-2 text-right">Credit</div>
            </div>
            {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                    <div className="col-span-4">
                        <Select value={line.account_id} onValueChange={val => handleLineChange(index, 'account_id', val)}>
                            <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-4"><Input value={line.description} onChange={e => handleLineChange(index, 'description', e.target.value)} placeholder="Line description"/></div>
                    <div className="col-span-2"><Input type="number" step="0.01" value={line.debit} onChange={e => handleLineChange(index, 'debit', e.target.value)} className="text-right" /></div>
                    <div className="col-span-1"><Input type="number" step="0.01" value={line.credit} onChange={e => handleLineChange(index, 'credit', e.target.value)} className="text-right" /></div>
                    <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => removeLine(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div>
                </div>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="w-4 h-4 mr-2" />Add new line</Button>
          </div>

          <div className="grid grid-cols-12 gap-2 p-4 bg-slate-50 rounded-lg">
            <div className="col-span-8 font-semibold">Totals</div>
            <div className={`col-span-2 text-right font-semibold ${!isBalanced ? 'text-red-500' : ''}`}>${totals.debit.toFixed(2)}</div>
            <div className={`col-span-2 text-right font-semibold ${!isBalanced ? 'text-red-500' : ''}`}>${totals.credit.toFixed(2)}</div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
            <Button type="submit" disabled={!isBalanced}><Save className="w-4 h-4 mr-2" />Save Journal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}