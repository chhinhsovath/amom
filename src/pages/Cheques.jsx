import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Book,
  CreditCard
} from 'lucide-react';
import { Cheque, ChequeBook, Contact, Account } from '@/services/DataService';
import { format, parseISO } from 'date-fns';

export default function Cheques() {
  const [cheques, setCheques] = useState([]);
  const [chequeBooks, setChequeBooks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCheque, setSelectedCheque] = useState(null);
  const [showNewCheque, setShowNewCheque] = useState(false);
  const [showNewBook, setShowNewBook] = useState(false);
  const [showChequeDetails, setShowChequeDetails] = useState(false);
  const [chequeTransactions, setChequeTransactions] = useState([]);

  // Form states
  const [newCheque, setNewCheque] = useState({
    cheque_book_id: '',
    payee_name: '',
    payee_contact_id: '',
    amount: '',
    memo: '',
    reference_type: 'other',
    reference_number: '',
    expense_account_id: ''
  });

  const [newBook, setNewBook] = useState({
    bank_account_id: '',
    book_number: '',
    starting_cheque_number: '',
    ending_cheque_number: '',
    bank_name: '',
    branch_name: '',
    routing_number: '',
    account_number: ''
  });

  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
    cleared_date: '',
    bank_reference: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chequesData, booksData, contactsData, accountsData] = await Promise.all([
        Cheque.list(),
        ChequeBook.list(),
        Contact.list(),
        Account.list()
      ]);
      
      setCheques(chequesData);
      setChequeBooks(booksData);
      setContacts(contactsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheque = async (e) => {
    e.preventDefault();
    try {
      const chequeData = {
        ...newCheque,
        amount: parseFloat(newCheque.amount)
      };
      
      await Cheque.create(chequeData);
      setShowNewCheque(false);
      setNewCheque({
        cheque_book_id: '',
        payee_name: '',
        payee_contact_id: '',
        amount: '',
        memo: '',
        reference_type: 'other',
        reference_number: '',
        expense_account_id: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating cheque:', error);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      const bookData = {
        ...newBook,
        starting_cheque_number: parseInt(newBook.starting_cheque_number),
        ending_cheque_number: parseInt(newBook.ending_cheque_number)
      };
      
      await ChequeBook.create(bookData);
      setShowNewBook(false);
      setNewBook({
        bank_account_id: '',
        book_number: '',
        starting_cheque_number: '',
        ending_cheque_number: '',
        bank_name: '',
        branch_name: '',
        routing_number: '',
        account_number: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating cheque book:', error);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await Cheque.updateStatus(selectedCheque.id, statusUpdate);
      setSelectedCheque(null);
      setStatusUpdate({
        status: '',
        notes: '',
        cleared_date: '',
        bank_reference: ''
      });
      loadData();
    } catch (error) {
      console.error('Error updating cheque status:', error);
    }
  };

  const handleViewDetails = async (cheque) => {
    setSelectedCheque(cheque);
    setShowChequeDetails(true);
    
    try {
      const transactions = await Cheque.getTransactions(cheque.id);
      setChequeTransactions(transactions);
    } catch (error) {
      console.error('Error loading cheque transactions:', error);
      setChequeTransactions([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'cleared': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'bounced': return 'bg-orange-100 text-orange-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'stale': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'issued': return <Clock className="w-4 h-4" />;
      case 'cleared': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'bounced': return <AlertCircle className="w-4 h-4" />;
      case 'stopped': return <XCircle className="w-4 h-4" />;
      case 'stale': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredCheques = cheques.filter(cheque => {
    const matchesSearch = cheque.payee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cheque.cheque_number?.toString().includes(searchTerm) ||
                         cheque.memo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cheque.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading cheques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Cheques</h1>
        <div className="flex gap-2">
          <Dialog open={showNewBook} onOpenChange={setShowNewBook}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Book className="w-4 h-4 mr-2" />
                New Cheque Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Cheque Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_account_id">Bank Account</Label>
                    <Select value={newBook.bank_account_id} onValueChange={(value) => setNewBook({...newBook, bank_account_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.filter(acc => acc.type === 'asset').map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="book_number">Book Number</Label>
                    <Input
                      id="book_number"
                      value={newBook.book_number}
                      onChange={(e) => setNewBook({...newBook, book_number: e.target.value})}
                      placeholder="CHQ-001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="starting_cheque_number">Starting Cheque Number</Label>
                    <Input
                      id="starting_cheque_number"
                      type="number"
                      value={newBook.starting_cheque_number}
                      onChange={(e) => setNewBook({...newBook, starting_cheque_number: e.target.value})}
                      placeholder="1001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ending_cheque_number">Ending Cheque Number</Label>
                    <Input
                      id="ending_cheque_number"
                      type="number"
                      value={newBook.ending_cheque_number}
                      onChange={(e) => setNewBook({...newBook, ending_cheque_number: e.target.value})}
                      placeholder="1100"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={newBook.bank_name}
                      onChange={(e) => setNewBook({...newBook, bank_name: e.target.value})}
                      placeholder="First National Bank"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="branch_name">Branch Name</Label>
                    <Input
                      id="branch_name"
                      value={newBook.branch_name}
                      onChange={(e) => setNewBook({...newBook, branch_name: e.target.value})}
                      placeholder="Main Branch"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routing_number">Routing Number</Label>
                    <Input
                      id="routing_number"
                      value={newBook.routing_number}
                      onChange={(e) => setNewBook({...newBook, routing_number: e.target.value})}
                      placeholder="021000021"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={newBook.account_number}
                      onChange={(e) => setNewBook({...newBook, account_number: e.target.value})}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewBook(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Book</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showNewCheque} onOpenChange={setShowNewCheque}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Cheque
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Cheque</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCheque} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cheque_book_id">Cheque Book</Label>
                    <Select value={newCheque.cheque_book_id} onValueChange={(value) => setNewCheque({...newCheque, cheque_book_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cheque book" />
                      </SelectTrigger>
                      <SelectContent>
                        {chequeBooks.map(book => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.book_number} - {book.bank_name} ({book.remaining_cheques} remaining)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payee_contact_id">Payee Contact (Optional)</Label>
                    <Select value={newCheque.payee_contact_id} onValueChange={(value) => setNewCheque({...newCheque, payee_contact_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map(contact => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payee_name">Payee Name</Label>
                    <Input
                      id="payee_name"
                      value={newCheque.payee_name}
                      onChange={(e) => setNewCheque({...newCheque, payee_name: e.target.value})}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newCheque.amount}
                      onChange={(e) => setNewCheque({...newCheque, amount: e.target.value})}
                      placeholder="1000.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference_type">Reference Type</Label>
                    <Select value={newCheque.reference_type} onValueChange={(value) => setNewCheque({...newCheque, reference_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bill_payment">Bill Payment</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      value={newCheque.reference_number}
                      onChange={(e) => setNewCheque({...newCheque, reference_number: e.target.value})}
                      placeholder="BILL-2024-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense_account_id">Expense Account</Label>
                    <Select value={newCheque.expense_account_id} onValueChange={(value) => setNewCheque({...newCheque, expense_account_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.filter(acc => acc.type === 'expense').map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="memo">Memo</Label>
                    <Textarea
                      id="memo"
                      value={newCheque.memo}
                      onChange={(e) => setNewCheque({...newCheque, memo: e.target.value})}
                      placeholder="Payment for services"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewCheque(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Cheque</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cheques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="cleared">Cleared</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="stopped">Stopped</SelectItem>
            <SelectItem value="stale">Stale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="cheques" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cheques">Cheques</TabsTrigger>
          <TabsTrigger value="books">Cheque Books</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cheques">
          <Card>
            <CardHeader>
              <CardTitle>Cheques List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cheque #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCheques.map((cheque) => (
                    <TableRow key={cheque.id}>
                      <TableCell className="font-medium">{cheque.cheque_number}</TableCell>
                      <TableCell>{formatDate(cheque.issue_date)}</TableCell>
                      <TableCell>{cheque.payee_name}</TableCell>
                      <TableCell>{formatCurrency(cheque.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(cheque.status)}>
                          {getStatusIcon(cheque.status)}
                          <span className="ml-1 capitalize">{cheque.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{cheque.bank_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(cheque)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCheque(cheque);
                              setStatusUpdate({
                                status: cheque.status,
                                notes: '',
                                cleared_date: '',
                                bank_reference: ''
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle>Cheque Books</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Number</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chequeBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.book_number}</TableCell>
                      <TableCell>{book.bank_name}</TableCell>
                      <TableCell>{book.account_name}</TableCell>
                      <TableCell>{book.starting_cheque_number} - {book.ending_cheque_number}</TableCell>
                      <TableCell>{book.remaining_cheques}</TableCell>
                      <TableCell>
                        <Badge className={book.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {book.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      <Dialog open={!!selectedCheque && !showChequeDetails} onOpenChange={() => setSelectedCheque(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Cheque Status</DialogTitle>
          </DialogHeader>
          {selectedCheque && (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <Label>Cheque #{selectedCheque.cheque_number} - {selectedCheque.payee_name}</Label>
                <p className="text-sm text-gray-600">{formatCurrency(selectedCheque.amount)}</p>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate({...statusUpdate, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                    <SelectItem value="stale">Stale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {statusUpdate.status === 'cleared' && (
                <div>
                  <Label htmlFor="cleared_date">Cleared Date</Label>
                  <Input
                    id="cleared_date"
                    type="date"
                    value={statusUpdate.cleared_date}
                    onChange={(e) => setStatusUpdate({...statusUpdate, cleared_date: e.target.value})}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="bank_reference">Bank Reference</Label>
                <Input
                  id="bank_reference"
                  value={statusUpdate.bank_reference}
                  onChange={(e) => setStatusUpdate({...statusUpdate, bank_reference: e.target.value})}
                  placeholder="CLR-20240108-001"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                  placeholder="Additional notes about this status change"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedCheque(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Status</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Cheque Details Dialog */}
      <Dialog open={showChequeDetails} onOpenChange={setShowChequeDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Cheque Details</DialogTitle>
          </DialogHeader>
          {selectedCheque && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Cheque Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Cheque Number:</strong> {selectedCheque.cheque_number}</p>
                    <p><strong>Issue Date:</strong> {formatDate(selectedCheque.issue_date)}</p>
                    <p><strong>Payee:</strong> {selectedCheque.payee_name}</p>
                    <p><strong>Amount:</strong> {formatCurrency(selectedCheque.amount)}</p>
                    <p><strong>Status:</strong> <Badge className={getStatusColor(selectedCheque.status)}>{selectedCheque.status}</Badge></p>
                    <p><strong>Memo:</strong> {selectedCheque.memo || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Bank Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Bank:</strong> {selectedCheque.bank_name}</p>
                    <p><strong>Branch:</strong> {selectedCheque.branch_name}</p>
                    <p><strong>Account:</strong> {selectedCheque.account_number}</p>
                    <p><strong>Routing:</strong> {selectedCheque.routing_number}</p>
                    <p><strong>Book:</strong> {selectedCheque.book_number}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Transaction History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Processed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chequeTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{transaction.bank_reference || 'N/A'}</TableCell>
                        <TableCell>{transaction.notes || 'N/A'}</TableCell>
                        <TableCell>{transaction.processed_by_name || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}