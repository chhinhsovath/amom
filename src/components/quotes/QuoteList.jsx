
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Paperclip } from 'lucide-react';
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
    accepted: 'bg-emerald-100 text-emerald-800',
    declined: 'bg-red-100 text-red-800',
    expired: 'bg-slate-100 text-slate-800',
};

export default function QuoteList({ quotes, loading, onEdit, onDelete }) {
    if (loading) {
        return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
    }

    if (quotes.length === 0) {
        return <Card><CardContent className="p-12 text-center text-slate-500">No quotes found.</CardContent></Card>;
    }

    return (
        <div className="space-y-4">
            {quotes.map((quote) => (
                <Card key={quote.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                                <div>
                                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                                        {quote.quote_number}
                                        {quote.attachments && quote.attachments.length > 0 && <Paperclip className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <div className="text-sm text-slate-500">{quote.contact_name}</div>
                                </div>
                                <div className="font-bold text-slate-900 text-lg">${(quote.total_amount || 0).toFixed(2)}</div>
                                <div>
                                    <div className="text-xs text-slate-400">Issued</div>
                                    <div>{safeFormatDate(quote.issue_date)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Expires</div>
                                    <div>{safeFormatDate(quote.expiry_date)}</div>
                                </div>
                                <div>
                                    <Badge className={`${statusColors[quote.status]}`}>{quote.status}</Badge>
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button variant="outline" size="icon" onClick={() => onEdit(quote)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="destructive" size="icon" onClick={() => onDelete(quote)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
