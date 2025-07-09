
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Paperclip } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors = {
    submitted: 'bg-orange-100 text-orange-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    reimbursed: 'bg-emerald-100 text-emerald-800',
};

export default function ExpenseList({ expenses, users, loading, onEdit, onDelete }) {
    if (loading) {
        return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
    }

    if (expenses.length === 0) {
        return <Card><CardContent className="p-12 text-center text-slate-500">No expense claims found.</CardContent></Card>;
    }
    
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.full_name : 'Unknown User';
    };

    return (
        <div className="space-y-4">
            {expenses.map((expense) => (
                <Card key={expense.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                <div>
                                    <div className="font-semibold text-slate-900">{expense.description}</div>
                                    <div className="text-sm text-slate-500">{getUserName(expense.submitted_by)}</div>
                                </div>
                                <div className="font-bold text-slate-900 text-lg">${(expense.amount || 0).toFixed(2)}</div>
                                <div><Badge className={`${statusColors[expense.status]}`}>{expense.status}</Badge></div>
                                <div>
                                    {expense.attachments && expense.attachments.length > 0 && (
                                        <a href={expense.attachments[0]} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm"><Paperclip className="w-4 h-4 mr-2"/>View Attachment(s)</Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button variant="outline" size="icon" onClick={() => onEdit(expense)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="destructive" size="icon" onClick={() => onDelete(expense)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
