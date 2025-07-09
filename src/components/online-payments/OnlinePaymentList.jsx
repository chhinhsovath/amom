import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format, parseISO, isValid } from 'date-fns';

const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  return isValid(date) ? format(date, formatStr) : 'N/A';
};

export default function OnlinePaymentList({ payments, loading, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'successful': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse h-20 bg-slate-200 rounded-lg"></div>)}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="border-0 shadow-lg"><CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Online Payments Found</h3>
          <p className="text-slate-500">Recorded online payments will appear here.</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div>
                <div className="font-semibold text-slate-900">{payment.reference}</div>
                <div className="text-sm text-slate-500 capitalize">{payment.gateway}</div>
              </div>
              <div className="text-sm text-slate-600">{payment.contact_name}</div>
              <div className="font-semibold text-slate-900 text-lg">${payment.amount?.toFixed(2)}</div>
              <div className="text-sm text-slate-600">{safeFormatDate(payment.payment_date)}</div>
              <div><Badge className={getStatusColor(payment.status)}>{payment.status?.toUpperCase()}</Badge></div>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Button variant="ghost" size="sm" onClick={() => onEdit(payment)} title="Edit"><Edit className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(payment)} title="Delete"><Trash2 className="w-4 h-4 text-red-600" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}