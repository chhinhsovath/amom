
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Send, File, Repeat, ChevronDown, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Invoice, Contact, AuditLog, User, InvoiceTemplate } from "@/api/entities";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import InvoiceForm from "../components/invoices/InvoiceForm";
import InvoiceList from "../components/invoices/InvoiceList";
import InvoicePreview from "../components/invoices/InvoicePreview";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExportMenu from "../components/common/ExportMenu";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "awaiting_approval", label: "Awaiting Approval" },
  { value: "awaiting_payment", label: "Awaiting Payment" },
  { value: "paid", label: "Paid" },
  { value: "repeating", label: "Repeating" },
];

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setShowForm(true);
      // Clean up the URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesData, contactsData, templatesData] = await Promise.all([
        Invoice.list('-created_date'),
        Contact.filter({ type: 'customer' }),
        InvoiceTemplate.list()
      ]);
      setInvoices(invoicesData);
      setContacts(contactsData);
      setTemplates(templatesData);
    } catch (error) { console.error('Error loading data:', error); }
    setLoading(false);
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      const user = await User.me();
      if (editingInvoice) {
        await Invoice.update(editingInvoice.id, invoiceData);
        await AuditLog.create({
            entity_type: "Invoice",
            entity_id: editingInvoice.id,
            action: "update",
            user_id: user.email,
            changes: invoiceData,
            timestamp: new Date().toISOString()
        });
      } else {
        const newInvoice = await Invoice.create(invoiceData);
        await AuditLog.create({
            entity_type: "Invoice",
            entity_id: newInvoice.id,
            action: "create",
            user_id: user.email,
            changes: invoiceData,
            timestamp: new Date().toISOString()
        });
      }
      setShowForm(false);
      setEditingInvoice(null);
      loadData();
    } catch (error) { console.error('Error saving invoice:', error); }
  };
  
  const handleDeleteRequest = (invoice) => {
    setSelectedInvoiceForDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoiceForDelete) return;
    try {
      const user = await User.me();
      await Invoice.delete(selectedInvoiceForDelete.id);
      await AuditLog.create({
          entity_type: "Invoice",
          entity_id: selectedInvoiceForDelete.id,
          action: "delete",
          user_id: user.email,
          changes: { id: selectedInvoiceForDelete.id, number: selectedInvoiceForDelete.invoice_number },
          timestamp: new Date().toISOString()
      });
      loadData();
    } catch (error) { console.error("Error deleting invoice:", error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedInvoiceForDelete(null);
    }
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = (invoice.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    return statusFilters.reduce((acc, filter) => {
      if (filter.value !== 'all') {
        acc[filter.value] = invoices.filter(inv => inv.status === filter.value).length;
      }
      return acc;
    }, {});
  };

  const getTemplateForInvoice = (invoice) => {
      if (invoice?.template_id) {
          return templates.find(t => t.id === invoice.template_id);
      }
      return templates.find(t => t.is_default);
  };

  const stats = getStatusStats();
  
  const invoiceColumns = [
    { header: 'Invoice #', accessorKey: 'invoice_number' },
    { header: 'Customer', accessorKey: 'contact_name' },
    { header: 'Issue Date', accessorKey: 'issue_date' },
    { header: 'Due Date', accessorKey: 'due_date' },
    { header: 'Amount', accessorKey: 'total_amount' },
    { header: 'Status', accessorKey: 'status' }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage your customer invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New...
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setEditingInvoice(null); setShowForm(true); }}>
                <File className="w-4 h-4 mr-2" /> New Invoice
              </DropdownMenuItem>
              <Link to={createPageUrl("RepeatingInvoices")}>
                <DropdownMenuItem>
                  <Repeat className="w-4 h-4 mr-2" /> New Repeating Invoice
                </DropdownMenuItem>
              </Link>
              <Link to={createPageUrl("CreditNotes")}>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" /> New Credit Note
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline"><Send className="w-4 h-4 mr-2" /> Send Statements</Button>
          <ExportMenu data={filteredInvoices} columns={invoiceColumns} filename="invoices" />
        </div>
      </div>
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {statusFilters.map(option => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
                  className={`capitalize ${statusFilter === option.value ? "bg-emerald-600 hover:bg-emerald-700" : "text-slate-600"}`}
                >
                  {option.label}
                  {option.value !== 'all' && <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">{stats[option.value]}</span>}
                </Button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          contacts={contacts}
          onSave={handleSaveInvoice}
          onCancel={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
        />
      )}

      {previewInvoice && <InvoicePreview invoice={previewInvoice} template={getTemplateForInvoice(previewInvoice)} onClose={() => setPreviewInvoice(null)} />}
      
      <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} title="Are you sure?" description={`This will permanently delete invoice ${selectedInvoiceForDelete?.invoice_number}. This action cannot be undone.`} />

      <InvoiceList
        invoices={filteredInvoices}
        loading={loading}
        onEdit={handleEditInvoice}
        onPreview={setPreviewInvoice}
        onDelete={handleDeleteRequest}
      />
    </div>
  );
}
