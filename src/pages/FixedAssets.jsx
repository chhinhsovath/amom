import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calculator } from "lucide-react";
import { FixedAsset, Account } from "@/api/entities";
import FixedAssetForm from "../components/assets/FixedAssetForm";
import FixedAssetList from "../components/assets/FixedAssetList";
import DepreciationCalculator from "../components/assets/DepreciationCalculator";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExportMenu from "../components/common/ExportMenu";

export default function FixedAssets() {
  const [assets, setAssets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetsData, accountsData] = await Promise.all([
        FixedAsset.list('-purchase_date'),
        Account.list('code')
      ]);
      setAssets(assetsData);
      setAccounts(accountsData);
    } catch (error) { console.error('Error loading fixed assets:', error); }
    setLoading(false);
  };

  const handleSaveAsset = async (assetData) => {
    try {
      if (editingAsset) {
        await FixedAsset.update(editingAsset.id, assetData);
      } else {
        await FixedAsset.create(assetData);
      }
      setShowForm(false);
      setEditingAsset(null);
      loadData();
    } catch (error) { console.error('Error saving asset:', error); }
  };
  
  const handleDeleteRequest = (asset) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAsset) return;
    try {
      await FixedAsset.delete(selectedAsset.id);
      loadData();
    } catch (error) { console.error("Error deleting asset:", error); } 
    finally {
        setDeleteDialogOpen(false);
        setSelectedAsset(null);
    }
  };

  const assetColumns = [
    { header: 'Asset Name', accessorKey: 'asset_name' },
    { header: 'Asset Number', accessorKey: 'asset_number' },
    { header: 'Purchase Date', accessorKey: 'purchase_date' },
    { header: 'Purchase Price', accessorKey: 'purchase_price' },
    { header: 'Book Value', accessorKey: 'book_value' },
    { header: 'Status', accessorKey: 'status' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Fixed Assets</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCalculator(true)}><Calculator className="w-4 h-4 mr-2" />Depreciation Calculator</Button>
            <ExportMenu data={assets} columns={assetColumns} filename="fixed-assets" />
            <Button onClick={() => { setEditingAsset(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />New Asset</Button>
        </div>
      </div>
      
      {showForm && <FixedAssetForm asset={editingAsset} accounts={accounts} onSave={handleSaveAsset} onCancel={() => { setShowForm(false); setEditingAsset(null); }} />}
      {showCalculator && <DepreciationCalculator onClose={() => setShowCalculator(false)} />}
      <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} title="Are you sure?" description={`This will permanently delete asset ${selectedAsset?.asset_name}.`} />
      
      <FixedAssetList assets={assets} loading={loading} onEdit={(asset) => { setEditingAsset(asset); setShowForm(true); }} onDelete={handleDeleteRequest} />
    </div>
  );
}