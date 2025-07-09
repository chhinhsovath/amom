import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function CreditNoteList({ creditNotes, loading, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'applied':
        return 'bg-emerald-100 text-emerald-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Credit Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Credit Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {creditNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-500 text-lg mb-2">No credit notes found</div>
            <div className="text-slate-400">Create your first credit note to get started</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credit Note #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditNotes.map((creditNote) => (
                  <TableRow key={creditNote.id}>
                    <TableCell className="font-medium">
                      {creditNote.credit_note_number}
                    </TableCell>
                    <TableCell>{creditNote.contact_name}</TableCell>
                    <TableCell>{formatDate(creditNote.issue_date)}</TableCell>
                    <TableCell className="font-semibold">
                      ${(creditNote.total_amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(creditNote.status)}>
                        {creditNote.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(creditNote)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(creditNote)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}