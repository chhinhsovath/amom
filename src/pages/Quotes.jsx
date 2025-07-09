
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { Quote, Contact, Account } from '@/api/entities';
import QuoteForm from '../components/quotes/QuoteForm';
import QuoteList from '../components/quotes/QuoteList';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ExportMenu from '../components/common/ExportMenu';
import { useLocation, useNavigate } from "react-router-dom";

export default function Quotes() {
    const [quotes, setQuotes] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingQuote, setEditingQuote] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedQuoteForDelete, setSelectedQuoteForDelete] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => { 
        loadData(); 
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'new') {
            setShowForm(true);
            setEditingQuote(null);
            navigate(location.pathname, { replace: true });
        }
    }, [location.search]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [quotesData, contactsData, accountsData] = await Promise.all([
                Quote.list('-created_date'),
                Contact.filter({ type: 'customer' }),
                Account.list('code')
            ]);
            setQuotes(quotesData);
            setContacts(contactsData);
            setAccounts(accountsData);
        } catch (error) { console.error('Error loading quotes data:', error); }
        setLoading(false);
    };

    const handleSaveQuote = async (quoteData) => {
        try {
            if (editingQuote) {
                await Quote.update(editingQuote.id, quoteData);
            } else {
                await Quote.create(quoteData);
            }
            setShowForm(false);
            setEditingQuote(null);
            loadData();
        } catch (error) { console.error('Error saving quote:', error); }
    };

    const handleDeleteRequest = (quote) => {
        setSelectedQuoteForDelete(quote);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedQuoteForDelete) return;
        try {
            await Quote.delete(selectedQuoteForDelete.id);
            loadData();
        } catch (error) { console.error("Error deleting quote:", error); } 
        finally {
            setDeleteDialogOpen(false);
            setSelectedQuoteForDelete(null);
        }
    };

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch = (quote.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (quote.quote_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const quoteColumns = [
        { header: 'Quote #', accessorKey: 'quote_number' },
        { header: 'Customer', accessorKey: 'contact_name' },
        { header: 'Issue Date', accessorKey: 'issue_date' },
        { header: 'Expiry Date', accessorKey: 'expiry_date' },
        { header: 'Amount', accessorKey: 'total_amount' },
        { header: 'Status', accessorKey: 'status' }
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Quotes</h1>
                <div className="flex gap-2">
                    <ExportMenu data={filteredQuotes} columns={quoteColumns} filename="quotes" />
                    <Button onClick={() => { setEditingQuote(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />New Quote</Button>
                </div>
            </div>
            {showForm && <QuoteForm quote={editingQuote} contacts={contacts} accounts={accounts} onSave={handleSaveQuote} onCancel={() => { setShowForm(false); setEditingQuote(null); }} />}
            <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} title="Are you sure?" description={`This will permanently delete quote ${selectedQuoteForDelete?.quote_number}. This action cannot be undone.`} />
            <QuoteList quotes={filteredQuotes} loading={loading} onEdit={(quote) => { setEditingQuote(quote); setShowForm(true); }} onDelete={handleDeleteRequest} />
        </div>
    );
}
