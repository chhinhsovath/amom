
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Send, DollarSign } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

// Helper function to safely format dates
const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isValid(date)) {
      return format(date, formatStr);
    }
    return 'N/A';
  } catch (error) {
    console.warn('Invalid date:', dateString);
    return 'N/A';
  }
};

export default function InvoicePreview({ invoice, template, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  const currentTemplate = template || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:bg-white print:z-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-xl print:shadow-none print:border-0 print:max-h-full">
        <CardHeader className="border-b border-slate-200 print:hidden">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Invoice Preview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Print/Download
              </Button>
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8" style={{ fontFamily: currentTemplate.font_family || 'Inter, sans-serif' }}>
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{color: currentTemplate.theme_color || '#000'}}>
                {currentTemplate.invoice_title || 'INVOICE'}
              </h1>
              <div className="text-slate-600">
                <div>Invoice Number: <span className="font-semibold">{invoice.invoice_number}</span></div>
                <div>Issue Date: <span className="font-semibold">{safeFormatDate(invoice.issue_date)}</span></div>
                <div>Due Date: <span className="font-semibold">{safeFormatDate(invoice.due_date)}</span></div>
              </div>
            </div>
            <div className="text-right">
              {currentTemplate.logo_url ? (
                  <img src={currentTemplate.logo_url} alt="Company Logo" className="max-h-20 max-w-[200px] object-contain ml-auto" />
              ) : (
                <Badge className={`${
                  invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                } text-lg px-4 py-2`}>
                  {(invoice.status || 'draft').toUpperCase()}
                </Badge>
              )}
            </div>
          </div>

          {/* Company and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">From:</h3>
              <div className="text-slate-600">
                <div className="font-semibold">Your Company Name</div>
                <div>123 Business Street</div>
                <div>City, State 12345</div>
                <div>Phone: (555) 123-4567</div>
                <div>Email: info@company.com</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Bill To:</h3>
              <div className="text-slate-600">
                <div className="font-semibold">{invoice.contact_name}</div>
                <div>Customer Address</div>
                <div>City, State 12345</div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{backgroundColor: currentTemplate.theme_color ? `${currentTemplate.theme_color}20` : '#f8fafc'}}>
                  <th className="border border-slate-200 px-4 py-3 text-left" style={{color: currentTemplate.theme_color}}>Description</th>
                  <th className="border border-slate-200 px-4 py-3 text-center" style={{color: currentTemplate.theme_color}}>Qty</th>
                  <th className="border border-slate-200 px-4 py-3 text-right" style={{color: currentTemplate.theme_color}}>Unit Price</th>
                  <th className="border border-slate-200 px-4 py-3 text-right" style={{color: currentTemplate.theme_color}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.line_items || []).map((item, index) => (
                  <tr key={index}>
                    <td className="border border-slate-200 px-4 py-3">{item.description}</td>
                    <td className="border border-slate-200 px-4 py-3 text-center">{item.quantity}</td>
                    <td className="border border-slate-200 px-4 py-3 text-right">${(item.unit_price || 0).toFixed(2)}</td>
                    <td className="border border-slate-200 px-4 py-3 text-right">${(item.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold">${(invoice.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax:</span>
                  <span className="font-semibold">${(invoice.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${(invoice.total_amount || invoice.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="mb-8 space-y-4">
            {invoice.notes && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Notes:</h3>
                <p className="text-slate-600">{invoice.notes}</p>
              </div>
            )}
            {currentTemplate.terms && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Terms & Conditions:</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{currentTemplate.terms}</p>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          {currentTemplate.payment_advice && (
             <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Payment Advice:</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{currentTemplate.payment_advice}</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
