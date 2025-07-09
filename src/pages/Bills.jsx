
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { Bill, Contact, Account } from "@/api/entities";
import BillForm from "../components/bills/BillForm";
import BillList from "../components/bills/BillList";
import BillPreview from "../components/bills/BillPreview";
import BillApprovalWorkflow from "../components/bills/BillApprovalWorkflow";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExportMenu from "../components/common/ExportMenu";
import { useLocation, useNavigate } from "react-router-dom";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [previewBill, setPreviewBill] = useState(null);
  const [showApproval, setShowApproval] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBillForDelete, setSelectedBillForDelete] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setShowForm(true);
      setEditingBill(null);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsData, contactsData, accountsData] = await Promise.all([
        Bill.list('-created_date'),
        Contact.filter({ type: 'supplier' }),
        Account.list('code')
      ]);
      setBills(billsData);
      setContacts(contactsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading bills data:', error);
    }
    setLoading(false);
  };

  const handleSaveBill = async (billData) => {
    try {
      if (editingBill) {
        await Bill.update(editingBill.id, billData);
      } else {
        await Bill.create(billData);
      }
      setShowForm(false);
      setEditingBill(null);
      loadData();
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const handleDeleteRequest = (bill) => {
    setSelectedBillForDelete(bill);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBillForDelete) return;
    try {
      await Bill.delete(selectedBillForDelete.id);
      loadData();
    } catch (error) {
      console.error("Error deleting bill:", error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBillForDelete(null);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = (bill.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (bill.bill_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bills.length,
    draft: bills.filter(b => b.status === 'draft').length,
    awaiting_payment: bills.filter(b => b.status === 'awaiting_payment').length,
    paid: bills.filter(b => b.status === 'paid').length,
    overdue: bills.filter(b => b.status === 'overdue').length
  };

  const billColumns = [
    { header: 'Bill #', accessorKey: 'bill_number' },
    { header: 'Supplier', accessorKey: 'contact_name' },
    { header: 'Issue Date', accessorKey: 'issue_date' },
    { header: 'Due Date', accessorKey: 'due_date' },
    { header: 'Amount', accessorKey: 'total_amount' },
    { header: 'Status', accessorKey: 'status' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bills</h1>
          <p className="text-slate-500 mt-1">Manage your supplier bills and expenses</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowApproval(true)} variant="outline"><Filter className="w-4 h-4 mr-2" />Approvals</Button>
          <ExportMenu data={filteredBills} columns={billColumns} filename="bills" />
          <Button onClick={() => { setEditingBill(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 mr-2" />New Bill</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Bills</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
            <div className="text-sm text-slate-500">Draft</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.awaiting_payment}</div>
            <div className="text-sm text-slate-500">Awaiting Payment</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.paid}</div>
            <div className="text-sm text-slate-500">Paid</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-slate-500">Overdue</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input placeholder="Search bills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="awaiting_payment">Awaiting Payment</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {showForm && <BillForm bill={editingBill} contacts={contacts} accounts={accounts} onSave={handleSaveBill} onCancel={() => { setShowForm(false); setEditingBill(null); }} />}
      {previewBill && <BillPreview bill={previewBill} onClose={() => setPreviewBill(null)} />}
      {showApproval && <BillApprovalWorkflow bills={bills.filter(b => b.status === 'awaiting_approval')} onClose={() => setShowApproval(false)} onApprove={loadData} />}

      <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} title="Are you sure?" description={`This will permanently delete bill ${selectedBillForDelete?.bill_number}. This action cannot be undone.`} />

      <BillList bills={filteredBills} loading={loading} onEdit={(bill) => { setEditingBill(bill); setShowForm(true); }} onPreview={setPreviewBill} onDelete={handleDeleteRequest} />
    </div>
  );
}
