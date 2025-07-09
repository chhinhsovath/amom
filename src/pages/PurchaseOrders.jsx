
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { PurchaseOrder, Contact, Account } from '@/api/entities';
import PurchaseOrderForm from '../components/purchase-orders/PurchaseOrderForm';
import PurchaseOrderList from '../components/purchase-orders/PurchaseOrderList';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ExportMenu from '../components/common/ExportMenu';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PurchaseOrders() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPO, setEditingPO] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPoForDelete, setSelectedPoForDelete] = useState(null); // Renamed from selectedPO

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => { 
        loadData();
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'new') {
            setShowForm(true);
            setEditingPO(null); // Ensure editingPO is null for new creation
            navigate(location.pathname, { replace: true }); // Clean up the URL
        }
    }, [location.search]); // Depend on location.search to react to URL changes

    const loadData = async () => {
        setLoading(true);
        try {
            const [posData, contactsData, accountsData] = await Promise.all([
                PurchaseOrder.list('-created_date'),
                Contact.filter({ type: 'supplier' }),
                Account.list('code')
            ]);
            setPurchaseOrders(posData);
            setContacts(contactsData);
            setAccounts(accountsData);
        } catch (error) { console.error('Error loading data:', error); }
        setLoading(false);
    };

    const handleSavePO = async (poData) => {
        try {
            if (editingPO) {
                await PurchaseOrder.update(editingPO.id, poData);
            } else {
                await PurchaseOrder.create(poData);
            }
            setShowForm(false);
            setEditingPO(null);
            loadData();
        } catch (error) { console.error('Error saving purchase order:', error); }
    };
    
    const handleDeleteRequest = (po) => {
        setSelectedPoForDelete(po); // Use new state variable
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPoForDelete) return; // Use new state variable
        try {
            await PurchaseOrder.delete(selectedPoForDelete.id); // Use new state variable
            loadData();
        } catch (error) { console.error("Error deleting purchase order:", error); } 
        finally {
            setDeleteDialogOpen(false);
            setSelectedPoForDelete(null); // Use new state variable
        }
    };
    
    const poColumns = [
        { header: 'PO #', accessorKey: 'po_number' },
        { header: 'Supplier', accessorKey: 'contact_name' },
        { header: 'Issue Date', accessorKey: 'issue_date' },
        { header: 'Delivery Date', accessorKey: 'delivery_date' },
        { header: 'Amount', accessorKey: 'total_amount' },
        { header: 'Status', accessorKey: 'status' }
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Purchase Orders</h1>
                <div className="flex gap-2">
                    <ExportMenu data={purchaseOrders} columns={poColumns} filename="purchase-orders" />
                    <Button onClick={() => { setEditingPO(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />New Purchase Order</Button>
                </div>
            </div>
            {showForm && <PurchaseOrderForm purchaseOrder={editingPO} contacts={contacts} accounts={accounts} onSave={handleSavePO} onCancel={() => { setShowForm(false); setEditingPO(null); }} />}
            <ConfirmationDialog 
                open={deleteDialogOpen} 
                onOpenChange={setDeleteDialogOpen} 
                onConfirm={handleDeleteConfirm} 
                title="Are you sure?" 
                description={`This will permanently delete PO ${selectedPoForDelete?.po_number}. This action cannot be undone.`} // Use new state variable
            />
            <PurchaseOrderList purchaseOrders={purchaseOrders} loading={loading} onEdit={(po) => { setEditingPO(po); setShowForm(true); }} onDelete={handleDeleteRequest} />
        </div>
    );
}
