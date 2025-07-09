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

export default function CreditNoteForm({ creditNote, contacts, invoices, onSave, onCancel }) {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    credit_note_number: creditNote?.credit_note_number || `CN-${Date.now()}`,
    contact_id: creditNote?.contact_id || "",
    contact_name: creditNote?.contact_name || "",
    issue_date: creditNote?.issue_date || format(new Date(), 'yyyy-MM-dd'),
    line_items: creditNote?.line_items || [
      { description: "", quantity: 1, unit_price: 0, total: 0, account_id: "" }
    ],
    notes: creditNote?.notes || "",
    status: creditNote?.status || "draft",
    invoice_id: creditNote?.invoice_id || "",
    organization_id: creditNote?.organization_id || "default_org"
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountsData = await Account.list('code');
      setAccounts(accountsData.filter(acc => acc.type === 'revenue'));
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
    }
  };

  const handleContactChange = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setFormData(prev => ({
      ...prev,
      contact_id: contactId,
      contact_name: contact?.name || ""
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value
    };

    if (field === 'quantity' || field === 'unit_price') {
      newLineItems[index].total = newLineItems[index].quantity * newLineItems[index].unit_price;
    }

    setFormData(prev => ({
      ...prev,
      line_items: newLineItems
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { description: "", quantity: 1, unit_price: 0, total: 0, account_id: "" }]
    }));
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.line_items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax_amount = subtotal * 0.1;
    const total_amount = subtotal + tax_amount;
    
    return { subtotal, tax_amount, total_amount };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    onSave({
      ...formData,
      ...totals
    });
  };

  const totals = calculateTotals();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          {creditNote ? "Edit Credit Note" : "New Credit Note"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credit Note Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="credit_note_number">Credit Note Number</Label>
              <Input
                id="credit_note_number"
                value={formData.credit_note_number}
                onChange={(e) => setFormData(prev => ({ ...prev, credit_note_number: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Customer</Label>
              <Select value={formData.contact_id} onValueChange={handleContactChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.filter(c => c.type === 'customer' || c.type === 'both').map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_id">Related Invoice (Optional)</Label>
              <Select value={formData.invoice_id} onValueChange={(value) => setFormData(prev => ({ ...prev, invoice_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.filter(inv => inv.contact_id === formData.contact_id).map(invoice => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Line Items</h3>
              <Button type="button" onClick={addLineItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.line_items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unit_price}
                      onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Select 
                      value={item.account_id} 
                      onValueChange={(value) => handleLineItemChange(index, 'account_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">${(item.total || 0).toFixed(2)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax (10%):</span>
                <span className="font-semibold">${totals.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${totals.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Credit Note
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}