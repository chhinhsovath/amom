
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { Account } from "@/api/entities";
import FileUpload from "../common/FileUpload"; // Added import

export default function QuoteForm({ quote, contacts, onSave, onCancel }) {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    quote_number: quote?.quote_number || `QUO-${Date.now()}`,
    contact_id: quote?.contact_id || "",
    contact_name: quote?.contact_name || "",
    issue_date: quote?.issue_date || format(new Date(), 'yyyy-MM-dd'),
    expiry_date: quote?.expiry_date || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    line_items: quote?.line_items || [{ description: "", quantity: 1, unit_price: 0, total: 0, account_id: "" }],
    notes: quote?.notes || "",
    terms: quote?.terms || "",
    status: quote?.status || "draft",
    organization_id: quote?.organization_id || "default_org"
  });
  const [attachments, setAttachments] = useState(quote?.attachments || []); // Added state for attachments

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountsData = await Account.list('code');
      setAccounts(accountsData.filter(acc => acc.type === 'revenue'));
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };
  
  const handleContactChange = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setFormData(prev => ({ ...prev, contact_id: contactId, contact_name: contact?.name || "" }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      newLineItems[index].total = (newLineItems[index].quantity || 0) * (newLineItems[index].unit_price || 0);
    }
    setFormData(prev => ({ ...prev, line_items: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({ ...prev, line_items: [...prev.line_items, { description: "", quantity: 1, unit_price: 0, total: 0, account_id: "" }]}));
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== index) }));
  };

  const calculateTotals = () => {
    const subtotal = formData.line_items.reduce((sum, item) => sum + item.total, 0);
    const tax_amount = subtotal * 0.1;
    const total = subtotal + tax_amount;
    return { subtotal, tax_amount, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    onSave({ ...formData, ...totals, total_amount: totals.total, attachments }); // Passed attachments
  };

  const totals = calculateTotals();

  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader><CardTitle>{quote ? "Edit Quote" : "New Quote"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div><Label>Customer</Label><Select value={formData.contact_id} onValueChange={handleContactChange} required><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Quote Number</Label><Input value={formData.quote_number} onChange={e => setFormData({...formData, quote_number: e.target.value})} /></div>
            <div><Label>Issue Date</Label><Input type="date" value={formData.issue_date} onChange={e => setFormData({...formData, issue_date: e.target.value})} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} /></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center"><h3 className="font-semibold">Line Items</h3><Button type="button" variant="outline" size="sm" onClick={addLineItem}><Plus className="w-4 h-4 mr-2" />Add</Button></div>
            {formData.line_items.map((item, index) => (
              <div key={index} className="grid md:grid-cols-6 gap-2 p-2 bg-slate-50 rounded">
                <Input className="md:col-span-2" placeholder="Description" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} />
                <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))} />
                <Input type="number" placeholder="Unit Price" value={item.unit_price} onChange={e => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value))} />
                <Select value={item.account_id} onValueChange={val => handleLineItemChange(index, 'account_id', val)}><SelectTrigger><SelectValue placeholder="Account"/></SelectTrigger><SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select>
                <div className="flex items-center justify-between"><span>${item.total.toFixed(2)}</span><Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)}><Trash2 className="w-4 h-4 text-red-500"/></Button></div>
              </div>
            ))}
          </div>

          <div className="flex justify-end"><div className="w-full md:w-1/3 space-y-2"><div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Tax (10%)</span><span>${totals.tax_amount.toFixed(2)}</span></div><div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>${totals.total.toFixed(2)}</span></div></div></div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
            <div><Label>Terms</Label><Textarea value={formData.terms} onChange={e => setFormData({...formData, terms: e.target.value})} /></div>
          </div>

          {/* Added Attachments section */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <FileUpload attachments={attachments} onAttachmentsChange={setAttachments} />
          </div>

          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2"/>Cancel</Button><Button type="submit"><Save className="w-4 h-4 mr-2"/>Save Quote</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
