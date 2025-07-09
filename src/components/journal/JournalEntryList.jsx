import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid, parseISO } from 'date-fns';

const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return isValid(date) ? format(date, formatStr) : 'N/A';
  } catch (e) { return 'N/A'; }
};

export default function JournalEntryList({ journals, accounts, loading }) {
  if (loading) {
    return <Card className="border-0 shadow-lg"><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  const getAccountName = (accountId) => {
    return accounts.find(a => a.id === accountId)?.name || 'N/A';
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Journal History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Narration</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journals.map(journal => {
              const total = journal.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
              return (
                <React.Fragment key={journal.id}>
                  <TableRow className="bg-slate-50">
                    <TableCell className="font-semibold">{safeFormatDate(journal.date)}</TableCell>
                    <TableCell className="font-semibold">{journal.description}</TableCell>
                    <TableCell className="text-right font-semibold">${total.toFixed(2)}</TableCell>
                  </TableRow>
                  {journal.lines.map(line => (
                     <TableRow key={line.id}>
                        <TableCell></TableCell>
                        <TableCell className="pl-8">{getAccountName(line.account_id)}: {line.description}</TableCell>
                        <TableCell className="text-right">
                           {line.debit > 0 ? `$${line.debit.toFixed(2)} (DR)` : `$${line.credit.toFixed(2)} (CR)`}
                        </TableCell>
                     </TableRow>
                  ))}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}