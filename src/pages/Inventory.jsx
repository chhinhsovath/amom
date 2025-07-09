import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { Item, Account } from '@/api/entities';
import ItemForm from '../components/inventory/ItemForm';
import ItemList from '../components/inventory/ItemList';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ExportMenu from '../components/common/ExportMenu';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [itemsData, accountsData] = await Promise.all([
                Item.list('code'),
                Account.list('code')
            ]);
            setItems(itemsData);
            setAccounts(accountsData);
        } catch (error) { console.error('Error loading data:', error); }
        setLoading(false);
    };

    const handleSaveItem = async (itemData) => {
        try {
            if (editingItem) {
                await Item.update(editingItem.id, itemData);
            } else {
                await Item.create(itemData);
            }
            setShowForm(false);
            setEditingItem(null);
            loadData();
        } catch (error) { console.error('Error saving item:', error); }
    };

    const handleDeleteRequest = (item) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedItem) return;
        try {
            await Item.delete(selectedItem.id);
            loadData();
        } catch (error) { console.error("Error deleting item:", error); } 
        finally {
            setDeleteDialogOpen(false);
            setSelectedItem(null);
        }
    };

    const itemColumns = [
        { header: 'Code', accessorKey: 'code' },
        { header: 'Name', accessorKey: 'name' },
        { header: 'Sales Price', accessorKey: 'sales_price' },
        { header: 'Purchase Price', accessorKey: 'purchase_price' },
        { header: 'Qty On Hand', accessorKey: 'quantity_on_hand' },
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Products & Services</h1>
                <div className="flex gap-2">
                    <ExportMenu data={items} columns={itemColumns} filename="inventory-items" />
                    <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />New Item</Button>
                </div>
            </div>
            {showForm && <ItemForm item={editingItem} accounts={accounts} onSave={handleSaveItem} onCancel={() => { setShowForm(false); setEditingItem(null); }} />}
            <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} title="Are you sure?" description={`This will permanently delete item ${selectedItem?.name}.`} />
            <ItemList items={items} loading={loading} onEdit={(item) => { setEditingItem(item); setShowForm(true); }} onDelete={handleDeleteRequest} />
        </div>
    );
}