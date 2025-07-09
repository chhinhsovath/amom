import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import FileUpload from '../common/FileUpload';

export default function InvoiceTemplateForm({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    logo_url: template?.logo_url || '',
    theme_color: template?.theme_color || '#10B981',
    font_family: template?.font_family || 'Inter',
    invoice_title: template?.invoice_title || 'Invoice',
    quote_title: template?.quote_title || 'Quote',
    statement_title: template?.statement_title || 'Statement',
    credit_note_title: template?.credit_note_title || 'Credit Note',
    terms: template?.terms || '',
    payment_advice: template?.payment_advice || '',
    organization_id: template?.organization_id || 'default_org'
  });
  const [logoAttachment, setLogoAttachment] = useState(template?.logo_url ? [template.logo_url] : []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, logo_url: logoAttachment[0] || '' });
  };

  return (
    <Card className="border-0 shadow-xl fixed inset-0 bg-white z-50 overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white border-b z-10">
            <div className="flex justify-between items-center">
                <CardTitle className="text-xl">{template ? 'Edit' : 'New'} Branding Theme</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
                    <Button onClick={handleSubmit}><Save className="w-4 h-4 mr-2" />Save</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-8">
            <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Basic Info & Logo */}
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Standard" required />
                        </div>
                        <div>
                            <Label>Logo</Label>
                            <FileUpload attachments={logoAttachment} onAttachmentsChange={setLogoAttachment} />
                            <p className="text-xs text-slate-500 mt-2">Upload a logo to appear on your documents. Max file size: 5MB.</p>
                        </div>
                    </div>

                    {/* Right Column: Customization */}
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="theme_color">Theme Color</Label>
                            <div className="flex items-center gap-2">
                                <Input type="color" value={formData.theme_color} onChange={e => setFormData({...formData, theme_color: e.target.value})} className="w-12 h-10 p-1" />
                                <Input value={formData.theme_color} onChange={e => setFormData({...formData, theme_color: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="font_family">Font</Label>
                            <Input id="font_family" value={formData.font_family} onChange={e => setFormData({...formData, font_family: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Document Titles */}
                <Card>
                    <CardHeader><CardTitle>Document Titles</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="invoice_title">Invoice</Label>
                            <Input id="invoice_title" value={formData.invoice_title} onChange={e => setFormData({...formData, invoice_title: e.target.value})} />
                        </div>
                        <div>
                            <Label htmlFor="quote_title">Quote</Label>
                            <Input id="quote_title" value={formData.quote_title} onChange={e => setFormData({...formData, quote_title: e.target.value})} />
                        </div>
                        <div>
                            <Label htmlFor="credit_note_title">Credit Note</Label>
                            <Input id="credit_note_title" value={formData.credit_note_title} onChange={e => setFormData({...formData, credit_note_title: e.target.value})} />
                        </div>
                        <div>
                            <Label htmlFor="statement_title">Statement</Label>
                            <Input id="statement_title" value={formData.statement_title} onChange={e => setFormData({...formData, statement_title: e.target.value})} />
                        </div>
                    </CardContent>
                </Card>

                {/* Terms & Payment Advice */}
                <Card>
                    <CardHeader><CardTitle>Terms & Payment</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="terms">Terms & Conditions</Label>
                            <Textarea id="terms" value={formData.terms} onChange={e => setFormData({...formData, terms: e.target.value})} rows={4} placeholder="e.g., Payment due within 30 days." />
                        </div>
                         <div>
                            <Label htmlFor="payment_advice">Payment Advice</Label>
                            <Textarea id="payment_advice" value={formData.payment_advice} onChange={e => setFormData({...formData, payment_advice: e.target.value})} rows={3} placeholder="e.g., Please include invoice number as reference." />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </CardContent>
    </Card>
  );
}