import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, Search } from 'lucide-react';
import { Transaction, JournalEntry, Account } from '@/api/entities';
import JournalEntryForm from '../components/journal/JournalEntryForm';
import JournalEntryList from '../components/journal/JournalEntryList';
import { useLocation, useNavigate } from 'react-router-dom';

export default function JournalEntries() {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setShowForm(true);
      setEditingJournal(null);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, accountsData, journalEntriesData] = await Promise.all([
        Transaction.filter({ type: 'manual_journal' }),
        Account.list('code'),
        JournalEntry.list()
      ]);

      const populatedJournals = transactionsData.map(t => ({
        ...t,
        lines: journalEntriesData.filter(je => je.transaction_id === t.id)
      }));

      setJournals(populatedJournals);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJournal = async ({ narration, date, lines }) => {
    try {
      // 1. Create the parent transaction
      const transaction = await Transaction.create({
        organization_id: 'default_org',
        date: date,
        description: narration,
        type: 'manual_journal'
      });

      // 2. Create the journal entry lines
      const journalLines = lines.map(line => ({
        transaction_id: transaction.id,
        account_id: line.account_id,
        debit: line.debit,
        credit: line.credit,
        description: line.description
      }));
      await JournalEntry.bulkCreate(journalLines);

      setShowForm(false);
      setEditingJournal(null);
      loadData();
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const filteredJournals = journals.filter(j => 
    (j.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><BookOpen/>Manual Journals</h1>
          <p className="text-slate-500 mt-1">Record entries that can't be entered through other modules.</p>
        </div>
        <Button onClick={() => { setEditingJournal(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          New Journal
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search by narration..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {showForm && (
        <JournalEntryForm
          journal={editingJournal}
          accounts={accounts}
          onSave={handleSaveJournal}
          onCancel={() => {
            setShowForm(false);
            setEditingJournal(null);
          }}
        />
      )}

      <JournalEntryList
        journals={filteredJournals}
        accounts={accounts}
        loading={loading}
      />
    </div>
  );
}