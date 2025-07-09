import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import { format } from 'date-fns';

export default function TaxReportForm({ report, taxes, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    report_name: report?.report_name || '',
    report_type: report?.report_type || 'gst',
    period_start: report?.period_start || format(new Date(), 'yyyy-MM-dd'),
    period_end: report?.period_end || format(new Date(), 'yyyy-MM-dd'),
    status: report?.status || 'draft',
    total_sales: report?.total_sales || 0,
    total_purchases: report?.total_purchases || 0,
    gst_on_sales: report?.gst_on_sales || 0,
    gst_on_purchases: report?.gst_on_purchases || 0,
    net_gst: report?.net_gst || 0,
    due_date: report?.due_date || '',
    organization_id: report?.organization_id || 'default_org'
  });

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate net GST when sales or purchases change
      if (field === 'gst_on_sales' || field === 'gst_on_purchases') {
        updated.net_gst = (updated.gst_on_sales || 0) - (updated.gst_on_purchases || 0);
      }
      
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle>{report ? 'Edit' : 'New'} Tax Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="report_name">Report Name</Label>
              <Input
                id="report_name"
                value={formData.report_name}
                onChange={e => handleChange('report_name', e.target.value)}
                required
                placeholder="e.g., Q1 2024 GST Return"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report_type">Report Type</Label>
              <Select value={formData.report_type} onValueChange={val => handleChange('report_type', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gst">GST Return</SelectItem>
                  <SelectItem value="bas">BAS Report</SelectItem>
                  <SelectItem value="vat">VAT Return</SelectItem>
                  <SelectItem value="sales_tax">Sales Tax</SelectItem>
                  <SelectItem value="payroll_tax">Payroll Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_start">Period Start</Label>
              <Input
                id="period_start"
                type="date"
                value={formData.period_start}
                onChange={e => handleChange('period_start', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end">Period End</Label>
              <Input
                id="period_end"
                type="date"
                value={formData.period_end}
                onChange={e => handleChange('period_end', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={e => handleChange('due_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={val => handleChange('status', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="filed">Filed</SelectItem>
                  <SelectItem value="amended">Amended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tax Calculation Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Tax Calculations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="total_sales">Total Sales</Label>
                <Input
                  id="total_sales"
                  type="number"
                  step="0.01"
                  value={formData.total_sales}
                  onChange={e => handleChange('total_sales', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_purchases">Total Purchases</Label>
                <Input
                  id="total_purchases"
                  type="number"
                  step="0.01"
                  value={formData.total_purchases}
                  onChange={e => handleChange('total_purchases', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst_on_sales">GST on Sales</Label>
                <Input
                  id="gst_on_sales"
                  type="number"
                  step="0.01"
                  value={formData.gst_on_sales}
                  onChange={e => handleChange('gst_on_sales', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst_on_purchases">GST on Purchases</Label>
                <Input
                  id="gst_on_purchases"
                  type="number"
                  step="0.01"
                  value={formData.gst_on_purchases}
                  onChange={e => handleChange('gst_on_purchases', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Net GST:</span>
                <span className={`text-xl font-bold ${formData.net_gst >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ${Math.abs(formData.net_gst).toFixed(2)} {formData.net_gst >= 0 ? 'Payable' : 'Refundable'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Report
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}