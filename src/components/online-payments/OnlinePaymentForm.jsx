import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { format } from "date-fns";

export default function OnlinePaymentForm({ payment, invoices, contacts, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    reference: payment?.reference || `PAY-${Date.now()}`,
    contact_id: payment?.contact_id || "",
    contact_name: payment?.contact_name || "",
    invoice_id: payment?.invoice_id || "",
    amount: payment?.amount || 0,
    gateway: payment?.gateway || "stripe",
    status: payment?.status || "successful",
    payment_date: payment?.payment_date || format(new Date(), 'yyyy-MM-dd'),
    transaction_id: payment?.transaction_id || "",
    organization_id: payment?.organization_id || "default_org"
  });

  const handleContactChange = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setFormData(prev => ({
      ...prev,
      contact_id: contactId,
      contact_name: contact?.name || ""
    }));
  };
  
  const handleInvoiceChange = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        setFormData(prev => ({
            ...prev,
            invoice_id: invoiceId,
            amount: invoice.total_amount,
            contact_id: invoice.contact_id,
            contact_name: invoice.contact_name
        }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          {payment ? "Edit Payment Record" : "Record New Payment"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference *</Label>
              <Input id="reference" value={formData.reference} onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Customer *</Label>
              <Select value={formData.contact_id} onValueChange={handleContactChange} required>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice">Related Invoice (Optional)</Label>
              <Select value={formData.invoice_id} onValueChange={handleInvoiceChange}>
                <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                <SelectContent>{invoices.filter(i => i.contact_id === formData.contact_id).map(i => <SelectItem key={i.id} value={i.id}>{i.invoice_number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input id="payment_date" type="date" value={formData.payment_date} onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway">Gateway *</Label>
              <Select value={formData.gateway} onValueChange={(val) => setFormData(prev => ({ ...prev, gateway: val }))} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="braintree">Braintree</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_id">Transaction ID</Label>
              <Input id="transaction_id" value={formData.transaction_id} onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700"><Save className="w-4 h-4 mr-2" />Save Payment</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}