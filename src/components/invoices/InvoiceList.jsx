
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, DollarSign, Paperclip } from "lucide-react";
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

export default function InvoiceList({ invoices, loading, onEdit, onPreview, onDelete }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="text-slate-400 mb-4">
            <DollarSign className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Invoices Found</h3>
          <p className="text-slate-500">Create your first invoice to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-semibold text-lg text-slate-900">
                    {invoice.invoice_number || 'N/A'}
                  </h3>
                  {invoice.attachments && invoice.attachments.length > 0 && <Paperclip className="w-4 h-4 text-slate-400" />}
                  <Badge className={`${
                    invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {(invoice.status || 'draft').toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Customer</div>
                    <div className="font-medium">{invoice.contact_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Amount</div>
                    <div className="font-semibold text-slate-900">${(invoice.total_amount || invoice.total || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Issue Date</div>
                    <div className="font-medium">
                      {safeFormatDate(invoice.issue_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Due Date</div>
                    <div className={`font-medium ${
                      invoice.status === 'overdue' ? 'text-red-600' : ''
                    }`}>
                      {safeFormatDate(invoice.due_date)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreview(invoice)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(invoice)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(invoice)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
