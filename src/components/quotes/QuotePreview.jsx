import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Send, FileText } from "lucide-react";
import { format } from "date-fns";

export default function QuotePreview({ quote, onClose, onConvertToInvoice }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Quote Preview
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Quote Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">QUOTE</h1>
              <div className="text-slate-600">
                <p className="font-semibold">Quote #: {quote.quote_number}</p>
                <p>Issue Date: {format(new Date(quote.issue_date), "MMM d, yyyy")}</p>
                <p>Expiry Date: {format(new Date(quote.expiry_date), "MMM d, yyyy")}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`text-sm px-3 py-1 ${
                quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                quote.status === 'declined' ? 'bg-red-100 text-red-800' :
                quote.status === 'expired' ? 'bg-slate-100 text-slate-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {quote.status.toUpperCase()}
              </Badge>
              {quote.converted_to_invoice && (
                <div className="mt-2">
                  <Badge variant="outline">
                    Converted to Invoice
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">From:</h3>
              <div className="text-slate-600">
                <p className="font-semibold">Your Company Name</p>
                <p>123 Business Street</p>
                <p>City, State 12345</p>
                <p>contact@yourcompany.com</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Quote To:</h3>
              <div className="text-slate-600">
                <p className="font-semibold">{quote.contact_name}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 text-slate-900 font-semibold">Description</th>
                  <th className="text-right py-3 text-slate-900 font-semibold">Qty</th>
                  <th className="text-right py-3 text-slate-900 font-semibold">Unit Price</th>
                  <th className="text-right py-3 text-slate-900 font-semibold">Discount</th>
                  <th className="text-right py-3 text-slate-900 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.line_items?.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-3 text-slate-700">{item.description}</td>
                    <td className="text-right py-3 text-slate-700">{item.quantity}</td>
                    <td className="text-right py-3 text-slate-700">${item.unit_price?.toFixed(2)}</td>
                    <td className="text-right py-3 text-slate-700">{item.discount_rate}%</td>
                    <td className="text-right py-3 text-slate-700">${item.total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">${quote.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax:</span>
                <span className="font-semibold">${quote.tax_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${quote.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {quote.terms && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Terms & Conditions:</h3>
                <p className="text-slate-600">{quote.terms}</p>
              </div>
            )}
            {quote.notes && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Notes:</h3>
                <p className="text-slate-600">{quote.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Send Quote
            </Button>
            {quote.status === 'accepted' && !quote.converted_to_invoice && (
              <Button 
                onClick={onConvertToInvoice}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Convert to Invoice
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}