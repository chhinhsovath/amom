import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OnlinePayment } from '@/api/entities';
import { format, isValid, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function OnlinePayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const paymentsData = await OnlinePayment.list('-payment_date');
            setPayments(paymentsData);
        } catch (error) {
            console.error("Error loading online payments", error);
        } finally {
            setLoading(false);
        }
    };
    
    const safeFormatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'MMM d, yyyy, h:mm a') : 'N/A';
    };
    
    const statusColors = {
        successful: 'bg-emerald-100 text-emerald-800',
        pending: 'bg-orange-100 text-orange-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-slate-100 text-slate-800',
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Online Payments</h1>
            <Card>
                <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Gateway</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-6" /></TableCell>)}
                                    </TableRow>
                                ))
                            ) : payments.length > 0 ? (
                                payments.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{safeFormatDate(p.payment_date)}</TableCell>
                                        <TableCell>{p.contact_name}</TableCell>
                                        <TableCell>{p.invoice_id}</TableCell>
                                        <TableCell className="capitalize">{p.gateway}</TableCell>
                                        <TableCell>${(p.amount || 0).toFixed(2)}</TableCell>
                                        <TableCell><Badge className={statusColors[p.status]}>{p.status}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan="6" className="text-center p-8">No online payments found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}