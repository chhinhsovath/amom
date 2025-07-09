import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { Account, Tax } from "@/api/entities";
import FileUpload from "../common/FileUpload";
import TaxRateForm from "../tax/TaxRateForm";

export default function BillForm({ bill, contacts, accounts, onSave, onCancel }) {
  const [taxes, setTaxes] = useState([]);
  const [showNewTaxForm, setShowNewTaxForm] = useState(false);
  const [formData, setFormData] = useState({
    bill_number: bill?.bill_number || `BILL-${Date.now()}`,
    contact_id: bill?.contact_id || "",
    contact_name: bill?.contact_name || "",
    issue_date: bill?.issue_date || format(new Date(), 'yyyy-MM-dd'),
    due_date: bill?.due_date || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    line_items: bill?.line_items || [
      { description: "", quantity: 1, unit_price: 0, account_id: "", tax_rate_id: "" }
    ],
    notes: bill?.notes || "",
    status: bill?.status || "draft",
    organization_id: bill?.organization_id || "default_org",
  });
  const [attachments, setAttachments] = useState(bill?.attachments || []);

  useEffect(() => {
    loadTaxes();
  }, []);

  const loadTaxes = async () => {
    try {
      const taxesData = await Tax.list();
      setTaxes(taxesData.filter(t => t.type === 'purchase'));
    } catch (error) {
      console.error('Error loading taxes:', error);
    }
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index][field] = value;
    setFormData(prev => ({ ...prev, line_items: newLineItems }));
  };
  
  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { description: "", quantity: 1, unit_price: 0, account_id: "", tax_rate_id: "" }]
    }));
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax_amount = 0;

    formData.line_items.forEach(item => {
        const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
        subtotal += lineTotal;
        const taxRate = taxes.find(t => t.id === item.tax_rate_id)?.rate || 0;
        tax_amount += lineTotal * (taxRate / 100);
    });

    const total = subtotal + tax_amount;
    return { subtotal, tax_amount, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    onSave({
      ...formData,
      subtotal: totals.subtotal,
      tax_amount: totals.tax_amount,
      total_amount: totals.total,
      attachments,
    });
  };

  const handleNewTaxRateSaved = async (data) => {
      await Tax.create(data);
      setShowNewTaxForm(false);
      loadTaxes();
  };

  const totals = calculateTotals();
  
  if (showNewTaxForm) {
      return <TaxRateForm onSave={handleNewTaxRateSaved} onCancel={() => setShowNewTaxForm(false)} />
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          {bill ? "Edit Bill" : "New Bill"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact">Supplier</Label>
              <Select value={formData.contact_id} onValueChange={(val) => setFormData(prev => ({ ...prev, contact_id: val, contact_name: contacts.find(c=>c.id===val)?.name }))} required>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {contacts.filter(c => c.type === 'supplier' || c.type === 'both').map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input id="issue_date" type="date" value={formData.issue_date} onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill_number">Bill Number</Label>
              <Input id="bill_number" value={formData.bill_number} onChange={(e) => setFormData(prev => ({ ...prev, bill_number: e.target.value }))} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" value={formData.reference} onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))} />
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Description</th>
                    <th className="text-right p-2">Qty</th>
                    <th className="text-right p-2">Price</th>
                    <th className="text-left p-2">Account</th>
                    <th className="text-left p-2">Tax Rate</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="w-12 p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.line_items.map((item, index) => {
                    const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
                    const taxRate = taxes.find(t => t.id === item.tax_rate_id)?.rate || 0;
                    const taxAmount = lineTotal * (taxRate / 100);
                    const lineAmount = lineTotal + taxAmount;
                    
                    return (
                      <tr key={index}>
                        <td className="p-1">
                           <Input placeholder="Description" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} required />
                        </td>
                        <td className="p-1 w-24">
                          <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} min="0" step="0.01" required className="text-right" />
                        </td>
                        <td className="p-1 w-32">
                          <Input type="number" placeholder="Price" value={item.unit_price} onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)} min="0" step="0.01" required className="text-right" />
                        </td>
                        <td className="p-1 w-48">
                           <Select value={item.account_id} onValueChange={(value) => handleLineItemChange(index, 'account_id', value)}>
                            <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                            <SelectContent>{accounts.filter(a => a.type === 'expense').map(account => (<SelectItem key={account.id} value={account.id}>{account.code} - {account.name}</SelectItem>))}</SelectContent>
                          </Select>
                        </td>
                        <td className="p-1 w-48">
                          <Select value={item.tax_rate_id} onValueChange={(value) => value === 'new' ? setShowNewTaxForm(true) : handleLineItemChange(index, 'tax_rate_id', value)}>
                            <SelectTrigger><SelectValue placeholder="Tax" /></SelectTrigger>
                            <SelectContent>
                              {taxes.map(tax => (<SelectItem key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</SelectItem>))}
                              <SelectItem value="new" className="font-bold text-emerald-600"><Plus className="w-4 h-4 mr-2 inline-block"/> Create New Tax Rate</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-1 text-right font-medium w-32">${lineAmount.toFixed(2)}</td>
                        <td className="p-1">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button type="button" onClick={addLineItem} variant="outline"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." rows={3} />
                <Label>Attachments</Label>
                <FileUpload attachments={attachments} onAttachmentsChange={setAttachments} />
            </div>
            <div className="w-full space-y-2 bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between"><span className="text-slate-600">Subtotal:</span><span className="font-semibold">${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Total Tax:</span><span className="font-semibold">${totals.tax_amount.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total:</span><span>${totals.total.toFixed(2)}</span></div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700"><Save className="w-4 h-4 mr-2" />Save Bill</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}