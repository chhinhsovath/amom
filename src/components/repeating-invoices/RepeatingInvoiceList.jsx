import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Play, Pause, StopCircle } from "lucide-react";
import { format, parseISO, isValid } from 'date-fns';

const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  return isValid(date) ? format(date, formatStr) : 'N/A';
};

export default function RepeatingInvoiceList({ recurringInvoices, loading, onEdit, onDelete, onStatusChange }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-slate-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (recurringInvoices.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Repeating Invoices</h3>
          <p className="text-slate-500">Create a schedule to automate your invoicing.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recurringInvoices.map((recurring) => (
        <Card key={recurring.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <div className="font-semibold text-slate-900">{recurring.schedule_name}</div>
                <div className="text-sm text-slate-500">{recurring.contact_name}</div>
              </div>
              <div className="text-sm text-slate-600 capitalize">{recurring.frequency}</div>
              <div className="text-sm text-slate-600">
                Next: {safeFormatDate(recurring.next_scheduled_date)}
              </div>
              <div>
                <Badge className={getStatusColor(recurring.status)}>
                  {recurring.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-4">
              {recurring.status === 'active' && (
                <Button variant="ghost" size="sm" onClick={() => onStatusChange(recurring, 'paused')} title="Pause">
                  <Pause className="w-4 h-4 text-orange-600" />
                </Button>
              )}
              {recurring.status === 'paused' && (
                <Button variant="ghost" size="sm" onClick={() => onStatusChange(recurring, 'active')} title="Resume">
                  <Play className="w-4 h-4 text-emerald-600" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => onEdit(recurring)} title="Edit">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(recurring)} title="Delete">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}