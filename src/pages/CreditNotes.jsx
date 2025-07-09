import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, RefreshCw } from "lucide-react";
import { CreditNote, Contact, Invoice } from "@/api/entities";

import CreditNoteForm from "../components/credit-notes/CreditNoteForm";
import CreditNoteList from "../components/credit-notes/CreditNoteList";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExportMenu from "../components/common/ExportMenu";

export default function CreditNotes() {
  const [creditNotes, setCreditNotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCreditNote, setEditingCreditNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCreditNoteForDelete, setSelectedCreditNoteForDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [creditNotesData, contactsData, invoicesData] = await Promise.all([
        CreditNote.list('-created_date'),
        Contact.filter({ type: 'customer' }),
        Invoice.list('-created_date')
      ]);
      setCreditNotes(creditNotesData);
      setContacts(contactsData);
      setInvoices(invoicesData);
    } catch (error) { 
      console.error('Error loading credit notes:', error);
      setCreditNotes([]);
      setContacts([]);
      setInvoices([]);
    }
    setLoading(false);
  };

  const handleSaveCreditNote = async (creditNoteData) => {
    try {
      if (editingCreditNote) {
        await CreditNote.update(editingCreditNote.id, creditNoteData);
      } else {
        await CreditNote.create(creditNoteData);
      }
      setShowForm(false);
      setEditingCreditNote(null);
      loadData();
    } catch (error) { console.error('Error saving credit note:', error); }
  };

  const handleDeleteRequest = (creditNote) => {
    setSelectedCreditNoteForDelete(creditNote);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCreditNoteForDelete) return;
    try {
      await CreditNote.delete(selectedCreditNoteForDelete.id);
      loadData();
    } catch (error) { console.error("Error deleting credit note:", error); }
    finally {
      setDeleteDialogOpen(false);
      setSelectedCreditNoteForDelete(null);
    }
  };

  const filteredCreditNotes = creditNotes.filter(creditNote => {
    const matchesSearch = (creditNote.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (creditNote.credit_note_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || creditNote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: creditNotes.length,
    draft: creditNotes.filter(cn => cn.status === 'draft').length,
    sent: creditNotes.filter(cn => cn.status === 'sent').length,
    applied: creditNotes.filter(cn => cn.status === 'applied').length,
    refunded: creditNotes.filter(cn => cn.status === 'refunded').length
  };

  const creditNoteColumns = [
    { header: 'Credit Note #', accessorKey: 'credit_note_number' },
    { header: 'Customer', accessorKey: 'contact_name' },
    { header: 'Date', accessorKey: 'issue_date' },
    { header: 'Amount', accessorKey: 'total_amount' },
    { header: 'Status', accessorKey: 'status' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Credit Notes</h1>
          <p className="text-slate-500 mt-1">Manage customer credit notes and refunds</p>
        </div>
        <div className="flex gap-3">
          <ExportMenu data={filteredCreditNotes} columns={creditNoteColumns} filename="credit-notes" />
          <Button onClick={() => { setEditingCreditNote(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" />New Credit Note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-slate-900">{stats.total}</div><div className="text-sm text-slate-500">Total</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-orange-600">{stats.draft}</div><div className="text-sm text-slate-500">Draft</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{stats.sent}</div><div className="text-sm text-slate-500">Sent</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-600">{stats.applied}</div><div className="text-sm text-slate-500">Applied</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-purple-600">{stats.refunded}</div><div className="text-sm text-slate-500">Refunded</div></CardContent></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input placeholder="Search credit notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="applied">Applied</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {showForm && (
        <CreditNoteForm
          creditNote={editingCreditNote}
          contacts={contacts}
          invoices={invoices}
          onSave={handleSaveCreditNote}
          onCancel={() => { setShowForm(false); setEditingCreditNote(null); }}
        />
      )}

      <ConfirmationDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Credit Note" 
        description={`This will permanently delete credit note ${selectedCreditNoteForDelete?.credit_note_number}. This action cannot be undone.`} 
      />

      <CreditNoteList
        creditNotes={filteredCreditNotes}
        loading={loading}
        onEdit={(creditNote) => { setEditingCreditNote(creditNote); setShowForm(true); }}
        onDelete={handleDeleteRequest}
      />
    </div>
  );
}