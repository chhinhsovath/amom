import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Repeat, Play, Pause, StopCircle } from "lucide-react";
import { RecurringInvoice, Contact } from "@/api/entities";

import RepeatingInvoiceForm from "../components/repeating-invoices/RepeatingInvoiceForm";
import RepeatingInvoiceList from "../components/repeating-invoices/RepeatingInvoiceList";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExportMenu from "../components/common/ExportMenu";

export default function RepeatingInvoices() {
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecurringForDelete, setSelectedRecurringForDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recurringData, contactsData] = await Promise.all([
        RecurringInvoice.list('-created_date'),
        Contact.filter({ type: 'customer' })
      ]);
      setRecurringInvoices(recurringData);
      setContacts(contactsData);
    } catch (error) { 
      console.error('Error loading recurring invoices:', error);
      setRecurringInvoices([]);
      setContacts([]);
    }
    setLoading(false);
  };

  const handleSaveRecurring = async (recurringData) => {
    try {
      if (editingRecurring) {
        await RecurringInvoice.update(editingRecurring.id, recurringData);
      } else {
        await RecurringInvoice.create(recurringData);
      }
      setShowForm(false);
      setEditingRecurring(null);
      loadData();
    } catch (error) { console.error('Error saving recurring invoice:', error); }
  };

  const handleStatusChange = async (recurring, newStatus) => {
    try {
      await RecurringInvoice.update(recurring.id, { ...recurring, status: newStatus });
      loadData();
    } catch (error) { console.error('Error updating status:', error); }
  };

  const handleDeleteRequest = (recurring) => {
    setSelectedRecurringForDelete(recurring);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecurringForDelete) return;
    try {
      await RecurringInvoice.delete(selectedRecurringForDelete.id);
      loadData();
    } catch (error) { console.error("Error deleting recurring invoice:", error); }
    finally {
      setDeleteDialogOpen(false);
      setSelectedRecurringForDelete(null);
    }
  };

  const filteredRecurring = recurringInvoices.filter(recurring => {
    const matchesSearch = (recurring.schedule_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (recurring.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || recurring.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: recurringInvoices.length,
    active: recurringInvoices.filter(r => r.status === 'active').length,
    paused: recurringInvoices.filter(r => r.status === 'paused').length,
    completed: recurringInvoices.filter(r => r.status === 'completed').length
  };

  const recurringColumns = [
    { header: 'Schedule Name', accessorKey: 'schedule_name' },
    { header: 'Customer', accessorKey: 'contact_name' },
    { header: 'Frequency', accessorKey: 'frequency' },
    { header: 'Next Date', accessorKey: 'next_scheduled_date' },
    { header: 'Status', accessorKey: 'status' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Repeating Invoices</h1>
          <p className="text-slate-500 mt-1">Automate your recurring billing</p>
        </div>
        <div className="flex gap-3">
          <ExportMenu data={filteredRecurring} columns={recurringColumns} filename="repeating-invoices" />
          <Button onClick={() => { setEditingRecurring(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" />New Repeating Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-slate-900">{stats.total}</div><div className="text-sm text-slate-500">Total</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-600">{stats.active}</div><div className="text-sm text-slate-500">Active</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-orange-600">{stats.paused}</div><div className="text-sm text-slate-500">Paused</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{stats.completed}</div><div className="text-sm text-slate-500">Completed</div></CardContent></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input placeholder="Search repeating invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showForm && (
        <RepeatingInvoiceForm
          recurringInvoice={editingRecurring}
          contacts={contacts}
          onSave={handleSaveRecurring}
          onCancel={() => { setShowForm(false); setEditingRecurring(null); }}
        />
      )}

      <ConfirmationDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Repeating Invoice" 
        description={`This will permanently delete the repeating invoice schedule "${selectedRecurringForDelete?.schedule_name}". This action cannot be undone.`} 
      />

      <RepeatingInvoiceList
        recurringInvoices={filteredRecurring}
        loading={loading}
        onEdit={(recurring) => { setEditingRecurring(recurring); setShowForm(true); }}
        onDelete={handleDeleteRequest}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}