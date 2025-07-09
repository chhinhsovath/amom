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
    active: 'bg-emerald-100 text-emerald-800',
    disposed: 'bg-slate-100 text-slate-800',
    fully_depreciated: 'bg-blue-100 text-blue-800',
};

export default function FixedAssetList({ assets, loading, onEdit, onDelete }) {
    if (loading) {
        return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
    }

    if (assets.length === 0) {
        return <Card><CardContent className="p-12 text-center text-slate-500">No fixed assets found.</CardContent></Card>;
    }

    return (
        <div className="space-y-4">
            {assets.map((asset) => (
                <Card key={asset.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                                <div>
                                    <div className="font-semibold text-slate-900">{asset.asset_name}</div>
                                    <div className="text-sm text-slate-500">{asset.asset_number}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Purchase Date</div>
                                    <div>{safeFormatDate(asset.purchase_date)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Purchase Price</div>
                                    <div className="font-semibold">${(asset.purchase_price || 0).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Book Value</div>
                                    <div className="font-semibold">${(asset.book_value || 0).toFixed(2)}</div>
                                </div>
                                <div><Badge className={`${statusColors[asset.status]}`}>{asset.status}</Badge></div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button variant="outline" size="icon" onClick={() => onEdit(asset)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="destructive" size="icon" onClick={() => onDelete(asset)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}