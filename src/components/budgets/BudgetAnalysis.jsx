import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2, Save, BarChartHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BudgetLine, Account } from '@/api/entities';
import { Bar } from 'recharts';

export default function BudgetAnalysis({ budget, onClose }) {
  const [lines, setLines] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgetLines();
    loadAccounts();
  }, [budget.id]);

  const loadBudgetLines = async () => {
    setLoading(true);
    try {
      const budgetLines = await BudgetLine.filter({ budget_id: budget.id });
      // Fetch actuals here from transactions/journal entries if needed
      setLines(budgetLines.map(line => ({
        ...line,
        actual_amount: line.actual_amount || 0, // Placeholder
        variance: (line.actual_amount || 0) - line.budgeted_amount,
      })));
    } catch (error) {
      console.error("Error loading budget lines:", error);
    }
    setLoading(false);
  };
  
  const loadAccounts = async () => {
      const allAccounts = await Account.list('code');
      setAccounts(allAccounts);
  }

  const handleAddLine = async () => {
      try {
          await BudgetLine.create({
              budget_id: budget.id,
              account_id: '',
              period: new Date().toISOString().slice(0, 10),
              budgeted_amount: 0,
          });
          loadBudgetLines();
      } catch (error) {
          console.error("Error adding budget line:", error);
      }
  };
  
  const handleUpdateLine = async (lineId, field, value) => {
    const updatedLines = lines.map(line => {
      if (line.id === lineId) {
        return { ...line, [field]: value };
      }
      return line;
    });
    setLines(updatedLines);
  };

  const handleSaveLine = async (lineId) => {
    const lineToSave = lines.find(line => line.id === lineId);
    if (lineToSave) {
        const { id, ...dataToSave } = lineToSave;
        await BudgetLine.update(id, dataToSave);
        loadBudgetLines(); // to re-calculate variance
    }
  };

  const handleDeleteLine = async (lineId) => {
      await BudgetLine.delete(lineId);
      loadBudgetLines();
  };

  const getAccountName = (accountId) => {
      return accounts.find(a => a.id === accountId)?.name || 'N/A';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Budget Analysis: {budget.name}</CardTitle>
            <CardDescription>Manage budget lines and track performance.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          {loading ? <Skeleton className="w-full h-64" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Budgeted</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Select value={line.account_id} onValueChange={(val) => handleUpdateLine(line.id, 'account_id', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Account">{getAccountName(line.account_id)}</SelectValue></SelectTrigger>
                        <SelectContent>
                            {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={line.budgeted_amount} onChange={e => handleUpdateLine(line.id, 'budgeted_amount', parseFloat(e.target.value))} className="text-right" />
                    </TableCell>
                    <TableCell className="text-right font-mono">${line.actual_amount.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-mono ${line.variance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${line.variance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleSaveLine(line.id)}><Save className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLine(line.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           <Button onClick={handleAddLine} variant="outline" className="mt-4"><Plus className="w-4 h-4 mr-2"/>Add Line</Button>
        </CardContent>
      </Card>
    </div>
  );
}