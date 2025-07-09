import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function BudgetList({ budgets, loading, onEdit, onAnalyze }) {

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-orange-100 text-orange-800">Draft</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Budget List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Budget Name</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.length > 0 ? budgets.map(budget => (
              <TableRow key={budget.id}>
                <TableCell className="font-medium">{budget.name}</TableCell>
                <TableCell>{format(new Date(budget.start_date), 'MMM yyyy')} - {format(new Date(budget.end_date), 'MMM yyyy')}</TableCell>
                <TableCell>{getStatusBadge(budget.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onAnalyze(budget)}><BarChart2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(budget)}><Edit className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan="4" className="text-center py-8 text-slate-500">
                        No budgets found. Create one to get started.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}