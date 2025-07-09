import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const safeFormatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
};

const statusColors = {
    draft: 'bg-orange-100 text-orange-800',
    sent: 'bg-blue-100 text-blue-800',
    received: 'bg-emerald-100 text-emerald-800',
    billed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-slate-100 text-slate-800',
};

export default function PurchaseOrderList({ purchaseOrders, loading, onEdit, onDelete }) {
    if (loading) {
        return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
    }

    if (purchaseOrders.length === 0) {
        return <Card><CardContent className="p-12 text-center text-slate-500">No purchase orders found.</CardContent></Card>;
    }

    return (
        <div className="space-y-4">
            {purchaseOrders.map((po) => (
                <Card key={po.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                                <div>
                                    <div className="font-semibold text-slate-900">{po.po_number}</div>
                                    <div className="text-sm text-slate-500">{po.contact_name}</div>
                                </div>
                                <div className="font-bold text-slate-900 text-lg">${(po.total_amount || 0).toFixed(2)}</div>
                                <div>
                                    <div className="text-xs text-slate-400">Issued</div>
                                    <div>{safeFormatDate(po.issue_date)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Delivery</div>
                                    <div>{safeFormatDate(po.delivery_date)}</div>
                                </div>
                                <div>
                                    <Badge className={`${statusColors[po.status]}`}>{po.status}</Badge>
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button variant="outline" size="icon" onClick={() => onEdit(po)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="destructive" size="icon" onClick={() => onDelete(po)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}