import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Budget, BudgetLine, Account } from "@/api/entities";

import BudgetForm from "../components/budgets/BudgetForm";
import BudgetList from "../components/budgets/BudgetList";
import BudgetAnalysis from "../components/budgets/BudgetAnalysis";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetsData, accountsData] = await Promise.all([
        Budget.list('-created_date'),
        Account.list('code')
      ]);
      setBudgets(budgetsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading budgets:', error);
      setBudgets([]);
      setAccounts([]);
    }
    setLoading(false);
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      if (editingBudget) {
        await Budget.update(editingBudget.id, budgetData);
      } else {
        await Budget.create(budgetData);
      }
      setShowForm(false);
      setEditingBudget(null);
      loadData();
    } catch (error) { console.error('Error saving budget:', error); }
  };

  const stats = {
    total: budgets.length,
    active: budgets.filter(b => b.status === 'active').length,
    draft: budgets.filter(b => b.status === 'draft').length,
    closed: budgets.filter(b => b.status === 'closed').length
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Budgets</h1>
          <p className="text-slate-500 mt-1">Plan and track your financial budgets</p>
        </div>
        <Button onClick={() => { setEditingBudget(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />New Budget
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Budgets</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
            <div className="text-sm text-slate-500">Active</div>
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
            <div className="text-2xl font-bold text-slate-600">{stats.closed}</div>
            <div className="text-sm text-slate-500">Closed</div>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      {showForm && (
        <BudgetForm
          budget={editingBudget}
          accounts={accounts}
          onSave={handleSaveBudget}
          onCancel={() => { setShowForm(false); setEditingBudget(null); }}
        />
      )}

      {/* Budget Analysis */}
      {selectedBudget && (
        <BudgetAnalysis
          budget={selectedBudget}
          onClose={() => setSelectedBudget(null)}
        />
      )}

      {/* Budgets List */}
      <BudgetList
        budgets={budgets}
        loading={loading}
        onEdit={(budget) => { setEditingBudget(budget); setShowForm(true); }}
        onAnalyze={setSelectedBudget}
      />
    </div>
  );
}