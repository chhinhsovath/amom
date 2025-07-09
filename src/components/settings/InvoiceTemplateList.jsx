import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Star } from 'lucide-react';

export default function InvoiceTemplateList({ templates, loading, onEdit, onDelete, onSetDefault }) {
  if (loading) {
    return <div className="animate-pulse h-40 bg-slate-200 rounded-lg"></div>;
  }
  
  if (templates.length === 0) {
      return (
        <Card className="border-dashed">
            <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold">No branding themes found</h3>
                <p className="text-slate-500">Click "New Branding Theme" to create your first invoice template.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <div className="space-y-6">
      {templates.map(template => (
        <Card key={template.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Side: Preview */}
              <div className="w-full md:w-2/3 border rounded-lg p-4 bg-slate-50">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold" style={{color: template.theme_color}}>{template.invoice_title || 'Invoice'}</h2>
                        <p className="text-sm text-slate-500">INV-001</p>
                    </div>
                    {template.logo_url && <img src={template.logo_url} alt="logo" className="max-h-12 max-w-[150px]" />}
                 </div>
                 <div className="mt-8 text-xs text-slate-400">
                    <p>Bill To: Customer Name</p>
                    <div className="mt-4 h-16 border-t border-b border-dashed flex items-center">Line Items Preview...</div>
                    <div className="mt-4 flex justify-end">
                        <div className="w-1/3">
                            <div className="flex justify-between"><span>Subtotal:</span><span>$100.00</span></div>
                            <div className="flex justify-between"><span>Tax:</span><span>$10.00</span></div>
                            <div className="flex justify-between font-bold"><span>Total:</span><span>$110.00</span></div>
                        </div>
                    </div>
                 </div>
              </div>
              
              {/* Right Side: Details & Actions */}
              <div className="w-full md:w-1/3">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{template.name}</h3>
                    {template.is_default && <Badge>Default</Badge>}
                 </div>
                 <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p><span className="font-semibold">Quote title:</span> {template.quote_title}</p>
                    <p><span className="font-semibold">Statement title:</span> {template.statement_title}</p>
                    <p><span className="font-semibold">Credit Note title:</span> {template.credit_note_title}</p>
                 </div>
                 <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(template)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
                    {!template.is_default && <Button variant="outline" size="sm" onClick={() => onSetDefault(template.id)}><Star className="w-4 h-4 mr-2" />Set as default</Button>}
                    <Button variant="destructive-outline" size="sm" onClick={() => onDelete(template.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}