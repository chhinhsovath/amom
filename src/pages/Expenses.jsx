import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { Expense, User } from '@/api/entities';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ExportMenu from '../components/common/ExportMenu';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [expensesData, usersData] = await Promise.all([
                Expense.list('-created_date'),
                User.list()
            ]);
            setExpenses(expensesData);
            setUsers(usersData);
        } catch (error) { console.error('Error loading data:', error); }
        setLoading(false);
    };

    const handleSaveExpense = async (expenseData) => {
        try {
            const me = await User.me();
            const dataToSave = { ...expenseData, submitted_by: me.id };
            
            if (editingExpense) {
                await Expense.update(editingExpense.id, dataToSave);
            } else {
                await Expense.create(dataToSave);
            }
            setShowForm(false);
            setEditingExpense(null);
            loadData();
        } catch (error) { console.error('Error saving expense:', error); }
    };
    
    const handleDeleteRequest = (expense) => {
        setSelectedExpense(expense);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedExpense) return;
        try {
            await Expense.delete(selectedExpense.id);
            loadData();
        } catch (error) { console.error("Error deleting expense:", error); } 
        finally {
            setDeleteDialogOpen(false);
            setSelectedExpense(null);
        }
    };

    const expenseColumns = [
        { header: 'Description', accessorKey: 'description' },
        { header: 'Submitted By', accessorKey: 'submitted_by' },
        { header: 'Amount', accessorKey: 'amount' },
        { header: 'Status', accessorKey: 'status' }
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Expense Claims</h1>
                <div className="flex gap-2">
                    <ExportMenu data={expenses} columns={expenseColumns} filename="expenses" />
                    <Button onClick={() => { setEditingExpense(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />New Expense</Button>
                </div>
            </div>
            {showForm && <ExpenseForm expense={editingExpense} onSave={handleSaveExpense} onCancel={() => { setShowForm(false); setEditingExpense(null); }} />}
            <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} title="Are you sure?" description={`This will permanently delete the expense claim. This action cannot be undone.`} />
            <ExpenseList expenses={expenses} users={users} loading={loading} onEdit={(expense) => { setEditingExpense(expense); setShowForm(true); }} onDelete={handleDeleteRequest} />
        </div>
    );
}