import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Download, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function TaxReportList({ reports, loading, onEdit }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'filed':
        return <Badge className="bg-emerald-100 text-emerald-800">Filed</Badge>;
      case 'draft':
        return <Badge className="bg-orange-100 text-orange-800">Draft</Badge>;
      case 'amended':
        return <Badge className="bg-blue-100 text-blue-800">Amended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'gst': return 'GST Return';
      case 'bas': return 'BAS Report';
      case 'vat': return 'VAT Return';
      case 'sales_tax': return 'Sales Tax';
      case 'payroll_tax': return 'Payroll Tax';
      default: return type?.toUpperCase() || 'Unknown';
    }
  };

  const isOverdue = (report) => {
    if (!report.due_date || report.status === 'filed') return false;
    return new Date(report.due_date) < new Date();
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Tax Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
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
        <CardTitle>Tax Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Net GST</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? reports.map((report) => (
              <TableRow key={report.id} className={isOverdue(report) ? 'bg-red-50' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isOverdue(report) && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {report.report_name}
                  </div>
                </TableCell>
                <TableCell>{getTypeLabel(report.report_type)}</TableCell>
                <TableCell>
                  {format(new Date(report.period_start), 'MMM d')} - {format(new Date(report.period_end), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {report.due_date ? (
                    <span className={isOverdue(report) ? 'text-red-600 font-medium' : ''}>
                      {format(new Date(report.due_date), 'MMM d, yyyy')}
                    </span>
                  ) : (
                    <span className="text-slate-400">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`font-mono ${(report.net_gst || 0) >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${Math.abs(report.net_gst || 0).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(report)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan="7" className="text-center py-8 text-slate-500">
                  No tax reports found. Create your first tax report to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}