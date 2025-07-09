import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { Tax } from '@/api/entities';
import TaxRateForm from '../components/tax/TaxRateForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

export default function TaxRates() {
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  useEffect(() => {
    loadTaxRates();
  }, []);

  const loadTaxRates = async () => {
    setLoading(true);
    try {
      const data = await Tax.list();
      setTaxRates(data);
    } catch (error) {
      console.error('Error loading tax rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingTaxRate) {
        await Tax.update(editingTaxRate.id, data);
      } else {
        await Tax.create(data);
      }
      setShowForm(false);
      setEditingTaxRate(null);
      loadTaxRates();
    } catch (error) {
      console.error('Error saving tax rate:', error);
    }
  };

  const handleDeleteRequest = (taxRate) => {
    if (taxRate.is_system) {
      alert("System tax rates cannot be deleted.");
      return;
    }
    setSelectedForDelete(taxRate);
  };
  
  const handleDeleteConfirm = async () => {
      if(!selectedForDelete) return;
      try {
        await Tax.delete(selectedForDelete.id);
        loadTaxRates();
      } catch (error) {
         console.error('Error deleting tax rate:', error);
      } finally {
        setSelectedForDelete(null);
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tax Rates</h1>
        <Button onClick={() => { setEditingTaxRate(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Tax Rate
        </Button>
      </div>

      {showForm ? (
        <TaxRateForm
          taxRate={editingTaxRate}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan="3">Loading...</TableCell></TableRow>
                ) : (
                  taxRates.map(rate => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.name}</TableCell>
                      <TableCell className="text-right">{rate.rate}%</TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteRequest(rate)}
                            disabled={rate.is_system}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <ConfirmationDialog
        open={!!selectedForDelete}
        onOpenChange={(isOpen) => !isOpen && setSelectedForDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Are you sure?"
        description={`This will permanently delete the "${selectedForDelete?.name}" tax rate.`}
      />
    </div>
  );
}