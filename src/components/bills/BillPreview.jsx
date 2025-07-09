import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Check } from "lucide-react";
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

export default function BillPreview({ bill, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Bill Preview
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Bill Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">BILL</h1>
              <div className="text-slate-600">
                <p className="font-semibold">Bill #: {bill.bill_number || 'N/A'}</p>
                <p>Issue Date: {safeFormatDate(bill.issue_date)}</p>
                <p>Due Date: {safeFormatDate(bill.due_date)}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`text-sm px-3 py-1 ${
                bill.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                bill.status === 'awaiting_payment' ? 'bg-blue-100 text-blue-800' :
                bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {(bill.status || 'draft').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">From:</h3>
              <div className="text-slate-600">
                <p className="font-semibold">{bill.contact_name || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">To:</h3>
              <div className="text-slate-600">
                <p className="font-semibold">Your Company Name</p>
                <p>123 Business Street</p>
                <p>City, State 12345</p>
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
                  <th className="text-right py-3 text-slate-900 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {(bill.line_items || []).map((item, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-3 text-slate-700">{item.description || 'N/A'}</td>
                    <td className="text-right py-3 text-slate-700">{item.quantity || 0}</td>
                    <td className="text-right py-3 text-slate-700">${(item.unit_price || 0).toFixed(2)}</td>
                    <td className="text-right py-3 text-slate-700">${(item.total || 0).toFixed(2)}</td>
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
                <span className="font-semibold">${(bill.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax:</span>
                <span className="font-semibold">${(bill.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${(bill.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-2">Notes:</h3>
              <p className="text-slate-600">{bill.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}