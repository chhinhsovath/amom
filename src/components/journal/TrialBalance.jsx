import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function TrialBalance({ accounts, onClose }) {

    // This is a mock calculation. A real implementation would query all journal entries.
    const getMockBalance = (account) => {
        const hash = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        const randomBalance = Math.abs(hash(account.id)) % 10000;
        if (account.type === 'asset' || account.type === 'expense') return { debit: randomBalance, credit: 0 };
        if (account.type === 'liability' || account.type === 'equity' || account.type === 'revenue') return { debit: 0, credit: randomBalance };
        return { debit: 0, credit: 0 };
    };

    const balances = accounts.map(acc => ({
        ...acc,
        ...getMockBalance(acc)
    }));
    
    const totalDebit = balances.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = balances.reduce((sum, acc) => sum + acc.credit, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Trial Balance</CardTitle>
                        <p className="text-sm text-slate-500">As at {format(new Date(), 'MMM d, yyyy')}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X/></Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {balances.map(acc => (
                                <TableRow key={acc.id}>
                                    <TableCell>{acc.code}</TableCell>
                                    <TableCell>{acc.name}</TableCell>
                                    <TableCell className="text-right">${acc.debit.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${acc.credit.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <div className="p-6 border-t font-bold">
                    <div className="flex justify-between">
                        <span>Totals</span>
                        <div className="flex gap-8">
                           <span className="w-24 text-right">${totalDebit.toFixed(2)}</span>
                           <span className="w-24 text-right">${totalCredit.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}