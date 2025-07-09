
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Building2 } from "lucide-react";
import { Contact } from "@/api/entities";
import ContactForm from "../components/contacts/ContactForm";
import ContactList from "../components/contacts/ContactList";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExportMenu from "../components/common/ExportMenu";
import { useLocation, useNavigate } from "react-router-dom";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContactForDelete, setSelectedContactForDelete] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { 
    loadContacts(); 
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setShowForm(true);
      setEditingContact(null);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate, location.pathname]); // Added dependencies for useEffect

  const loadContacts = async () => {
    setLoading(true);
    try {
      const contactsData = await Contact.list('-created_date');
      setContacts(contactsData);
    } catch (error) { console.error('Error loading contacts:', error); }
    setLoading(false);
  };

  const handleSaveContact = async (contactData) => {
    try {
      if (editingContact) {
        await Contact.update(editingContact.id, contactData);
      } else {
        await Contact.create(contactData);
      }
      setShowForm(false);
      setEditingContact(null);
      loadContacts();
    } catch (error) { console.error('Error saving contact:', error); }
  };
  
  const handleDeleteRequest = (contact) => {
    setSelectedContactForDelete(contact);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContactForDelete) return;
    try {
      await Contact.delete(selectedContactForDelete.id);
      loadContacts();
    } catch (error) { console.error("Error deleting contact:", error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedContactForDelete(null);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: contacts.length,
    customers: contacts.filter(c => c.type === 'customer' || c.type === 'both').length,
    suppliers: contacts.filter(c => c.type === 'supplier' || c.type === 'both').length,
  };

  const contactColumns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Phone', accessorKey: 'phone' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 mt-1">Manage your customers and suppliers</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu data={filteredContacts} columns={contactColumns} filename="contacts" />
          <Button onClick={() => { setEditingContact(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 mr-2" />New Contact</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><Users className="w-8 h-8 text-slate-500" /><div className="text-2xl font-bold text-slate-900">{stats.total}</div><div className="text-sm text-slate-500">Total</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><Building2 className="w-8 h-8 text-emerald-500" /><div className="text-2xl font-bold text-emerald-600">{stats.customers}</div><div className="text-sm text-slate-500">Customers</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-4"><Building2 className="w-8 h-8 text-blue-500" /><div className="text-2xl font-bold text-blue-600">{stats.suppliers}</div><div className="text-sm text-slate-500">Suppliers</div></CardContent></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="all">All Types</option><option value="customer">Customers</option><option value="supplier">Suppliers</option><option value="both">Both</option>
        </select>
      </div>

      {showForm && <ContactForm contact={editingContact} onSave={handleSaveContact} onCancel={() => { setShowForm(false); setEditingContact(null); }} />}
      
      <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} title="Are you sure?" description={`This will permanently delete contact ${selectedContactForDelete?.name}. This action cannot be undone.`} />

      <ContactList contacts={filteredContacts} loading={loading} onEdit={(contact) => { setEditingContact(contact); setShowForm(true); }} onDelete={handleDeleteRequest} />
    </div>
  );
}
