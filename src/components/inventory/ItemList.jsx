import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ItemList({ items, loading, onEdit, onDelete }) {
    if (loading) {
        return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
    }

    if (items.length === 0) {
        return <Card><CardContent className="p-12 text-center text-slate-500">No items found.</CardContent></Card>;
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                                <div>
                                    <div className="font-semibold text-slate-900">{item.name}</div>
                                    <div className="text-sm text-slate-500">{item.code}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Sales Price</div>
                                    <div className="font-semibold">${(item.sales_price || 0).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Purchase Price</div>
                                    <div className="font-semibold">${(item.purchase_price || 0).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Qty On Hand</div>
                                    <div className="font-semibold">{item.is_tracked ? item.quantity_on_hand : 'N/A'}</div>
                                </div>
                                <div className="text-sm truncate text-slate-500">{item.description}</div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button variant="outline" size="icon" onClick={() => onEdit(item)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="destructive" size="icon" onClick={() => onDelete(item)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}