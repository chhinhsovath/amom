import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { format } from "date-fns";

export default function RepeatingInvoiceForm({ recurringInvoice, contacts, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    schedule_name: recurringInvoice?.schedule_name || "",
    contact_id: recurringInvoice?.contact_id || "",
    contact_name: recurringInvoice?.contact_name || "",
    frequency: recurringInvoice?.frequency || "monthly",
    start_date: recurringInvoice?.start_date || format(new Date(), 'yyyy-MM-dd'),
    end_date: recurringInvoice?.end_date || "",
    invoice_prefix: recurringInvoice?.invoice_prefix || "INV-",
    status: recurringInvoice?.status || "active",
    organization_id: recurringInvoice?.organization_id || "default_org"
  });

  const handleContactChange = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setFormData(prev => ({
      ...prev,
      contact_id: contactId,
      contact_name: contact?.name || ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const saveData = {
        ...formData,
        end_date: formData.end_date || null,
        // The backend would calculate the initial next_scheduled_date based on start_date
        next_scheduled_date: formData.start_date 
    };
    onSave(saveData);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          {recurringInvoice ? "Edit Repeating Invoice" : "New Repeating Invoice"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="schedule_name">Schedule Name *</Label>
              <Input
                id="schedule_name"
                value={formData.schedule_name}
                onChange={(e) => setFormData(prev => ({ ...prev, schedule_name: e.target.value }))}
                required
                placeholder="e.g., Monthly Retainer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Customer *</Label>
              <Select value={formData.contact_id} onValueChange={handleContactChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
              <Input
                id="invoice_prefix"
                value={formData.invoice_prefix}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                placeholder="INV-"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Schedule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}