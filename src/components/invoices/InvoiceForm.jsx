import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { Account, InvoiceTemplate, Tax } from "@/api/entities";
import FileUpload from "../common/FileUpload";
import TaxRateForm from "../tax/TaxRateForm"; // Import the new form

export default function InvoiceForm({ invoice, contacts, onSave, onCancel }) {
  const [accounts, setAccounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [showNewTaxForm, setShowNewTaxForm] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: invoice?.invoice_number || `INV-${Date.now()}`,
    contact_id: invoice?.contact_id || "",
    contact_name: invoice?.contact_name || "",
    issue_date: invoice?.issue_date || format(new Date(), 'yyyy-MM-dd'),
    due_date: invoice?.due_date || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    line_items: invoice?.line_items || [
      { description: "", quantity: 1, unit_price: 0, account_id: "", tax_rate_id: "" }
    ],
    notes: invoice?.notes || "",
    status: invoice?.status || "draft",
    organization_id: invoice?.organization_id || "default_org",
    template_id: invoice?.template_id || ""
  });
  const [attachments, setAttachments] = useState(invoice?.attachments || []);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [accountsData, templatesData, taxesData] = await Promise.all([
        Account.list('code'),
        InvoiceTemplate.list(),
        Tax.list()
      ]);
      setAccounts(accountsData.filter(acc => acc.type === 'revenue'));
      setTemplates(templatesData);
      setTaxes(taxesData.filter(t => t.type === 'sales'));
      
      if (!invoice?.template_id && templatesData.length > 0) {
          const defaultTemplate = templatesData.find(t => t.is_default);
          if (defaultTemplate) {
              setFormData(prev => ({...prev, template_id: defaultTemplate.id}));
          }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
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
      const taxesData = await Tax.list();
      setTaxes(taxesData.filter(t => t.type === 'sales'));
  }

  const totals = calculateTotals();

  if (showNewTaxForm) {
      return <TaxRateForm onSave={handleNewTaxRateSaved} onCancel={() => setShowNewTaxForm(false)} />
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          {invoice ? "Edit Invoice" : "New Invoice"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact">Customer</Label>
              <Select value={formData.contact_id} onValueChange={(val) => setFormData(prev => ({ ...prev, contact_id: val, contact_name: contacts.find(c=>c.id===val)?.name }))} required>
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
              <Input id="issue_date" type="date" value={formData.issue_date} onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input id="invoice_number" value={formData.invoice_number} onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" value={formData.reference} onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Branding Theme</Label>
              <Select value={formData.template_id} onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}>
                <SelectTrigger id="template"><SelectValue placeholder="Select a branding theme" /></SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>{template.name} {template.is_default && '(Default)'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item</th>
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
                          <Input placeholder="Item" />
                        </td>
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
                            <SelectContent>{accounts.map(account => (<SelectItem key={account.id} value={account.id}>{account.code} - {account.name}</SelectItem>))}</SelectContent>
                          </Select>
                        </td>
                        <td className="p-1 w-48">
                          <Select value={item.tax_rate_id} onValueChange={(value) => value === 'new' ? setShowNewTaxForm(true) : handleLineItemChange(index, 'tax_rate_id', value)}>
                            <SelectTrigger><SelectValue placeholder="Tax" /></SelectTrigger>
                            <SelectContent>
                              {taxes.map(tax => (<SelectItem key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</SelectItem>))}
                              <SelectItem value="new" className="font-bold text-emerald-600">
                                <Plus className="w-4 h-4 mr-2 inline-block"/> Create New Tax Rate
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-1 text-right font-medium w-32">
                          ${lineAmount.toFixed(2)}
                        </td>
                        <td className="p-1">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button type="button" onClick={addLineItem} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes..." rows={3} />
                <Label>Attachments</Label>
                <FileUpload attachments={attachments} onAttachmentsChange={setAttachments} />
            </div>
            <div className="w-full space-y-2 bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Tax:</span>
                <span className="font-semibold">${totals.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}