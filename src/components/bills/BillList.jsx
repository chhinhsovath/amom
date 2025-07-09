
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Paperclip } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return isValid(date) ? format(date, formatStr) : 'N/A';
  } catch (e) { return 'N/A'; }
};

const statusStyles = {
  draft: "bg-orange-100 text-orange-800",
  awaiting_payment: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
};

export default function BillList({ bills, loading, onEdit, onPreview, onDelete }) {
  if (loading) {
    return <Card className="border-0 shadow-lg"><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader><CardTitle className="text-xl font-semibold text-slate-900">All Bills ({bills.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="bg-slate-50">
                <TableHead>Bill #</TableHead><TableHead>Supplier</TableHead><TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium flex items-center gap-2">
                    {bill.bill_number || 'N/A'}
                    {bill.attachments && bill.attachments.length > 0 && <Paperclip className="w-4 h-4 text-slate-400" />}
                  </TableCell>
                  <TableCell>{bill.contact_name || 'N/A'}</TableCell>
                  <TableCell>{safeFormatDate(bill.issue_date)}</TableCell>
                  <TableCell>{safeFormatDate(bill.due_date)}</TableCell>
                  <TableCell className="font-semibold">${(bill.total_amount || 0).toFixed(2)}</TableCell>
                  <TableCell><Badge className={statusStyles[bill.status] || ''}>{(bill.status || 'draft').replace('_', ' ').toUpperCase()}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onPreview(bill)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(bill)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => onDelete(bill)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
