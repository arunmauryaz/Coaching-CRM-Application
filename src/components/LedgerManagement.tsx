import { useState } from 'react';
import { Plus, Download, Edit, Trash2, ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';

interface LedgerManagementProps {
  onBack: () => void;
}

export default function LedgerManagement({ onBack }: LedgerManagementProps) {
  const { ledgerAccounts, ledgerEntries, addLedgerAccount, updateLedgerAccount, deleteLedgerAccount, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry } = useCRMData();
  
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [accountForm, setAccountForm] = useState({
    name: '',
    description: '',
  });

  const [entryForm, setEntryForm] = useState({
    accountId: '',
    type: 'credit' as 'credit' | 'debit',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const resetAccountForm = () => {
    setAccountForm({ name: '', description: '' });
    setEditingAccount(null);
  };

  const resetEntryForm = () => {
    setEntryForm({
      accountId: '',
      type: 'credit',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setEditingEntry(null);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountForm.name.trim()) {
      toast.error('Account name is required');
      return;
    }

    if (editingAccount) {
      updateLedgerAccount(editingAccount.id, accountForm);
      toast.success('Account updated successfully');
    } else {
      addLedgerAccount(accountForm);
      toast.success('Account created successfully');
    }
    
    resetAccountForm();
    setIsAddAccountDialogOpen(false);
  };

  const handleEditAccount = (account: any) => {
    setAccountForm({
      name: account.name,
      description: account.description,
    });
    setEditingAccount(account);
    setIsAddAccountDialogOpen(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    const accountEntries = ledgerEntries.filter(e => e.accountId === accountId);
    if (accountEntries.length > 0) {
      toast.error('Cannot delete account with existing entries');
      setDeleteAccountId(null);
      return;
    }
    
    deleteLedgerAccount(accountId);
    toast.success('Account deleted successfully');
    setDeleteAccountId(null);
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
    }
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entryForm.accountId) {
      toast.error('Please select an account');
      return;
    }

    if (!entryForm.amount || parseFloat(entryForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const entryData = {
      accountId: entryForm.accountId,
      type: entryForm.type,
      amount: parseFloat(entryForm.amount),
      date: entryForm.date,
      description: entryForm.description,
    };

    if (editingEntry) {
      updateLedgerEntry(editingEntry.id, entryData);
      toast.success('Entry updated successfully');
    } else {
      addLedgerEntry(entryData);
      toast.success('Entry added successfully');
    }
    
    resetEntryForm();
    setIsAddEntryDialogOpen(false);
  };

  const handleEditEntry = (entry: any) => {
    setEntryForm({
      accountId: entry.accountId,
      type: entry.type,
      amount: entry.amount.toString(),
      date: entry.date,
      description: entry.description,
    });
    setEditingEntry(entry);
    setIsAddEntryDialogOpen(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteLedgerEntry(entryId);
    toast.success('Entry deleted successfully');
    setDeleteEntryId(null);
  };

  const calculateBalance = (accountId: string) => {
    const accountEntries = ledgerEntries.filter(e => e.accountId === accountId);
    return accountEntries.reduce((balance, entry) => {
      return entry.type === 'credit' ? balance + entry.amount : balance - entry.amount;
    }, 0);
  };

  const handleExportCSV = () => {
    if (!selectedAccountId) {
      toast.error('Please select an account to export');
      return;
    }

    const account = ledgerAccounts.find(a => a.id === selectedAccountId);
    if (!account) return;

    const accountEntries = ledgerEntries
      .filter(e => e.accountId === selectedAccountId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let csv = 'Date,Type,Amount,Description,Balance\n';
    let runningBalance = 0;

    accountEntries.forEach(entry => {
      runningBalance = entry.type === 'credit' ? runningBalance + entry.amount : runningBalance - entry.amount;
      const row = [
        entry.date,
        entry.type.toUpperCase(),
        entry.amount.toFixed(2),
        `"${entry.description.replace(/"/g, '""')}"`,
        runningBalance.toFixed(2),
      ].join(',');
      csv += row + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ledger-${account.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Ledger exported successfully');
  };

  const filteredAccounts = ledgerAccounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAccount = ledgerAccounts.find(a => a.id === selectedAccountId);
  const selectedAccountEntries = selectedAccountId
    ? ledgerEntries
        .filter(e => e.accountId === selectedAccountId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const totalCredit = selectedAccountEntries.reduce((sum, e) => e.type === 'credit' ? sum + e.amount : sum, 0);
  const totalDebit = selectedAccountEntries.reduce((sum, e) => e.type === 'debit' ? sum + e.amount : sum, 0);
  const balance = totalCredit - totalDebit;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-gray-900 dark:text-gray-100">Ledger Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage organization accounts and transactions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>Manage ledger accounts</CardDescription>
              <div className="pt-4 space-y-3">
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Dialog open={isAddAccountDialogOpen} onOpenChange={(open) => {
                  setIsAddAccountDialogOpen(open);
                  if (!open) resetAccountForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                      <DialogDescription>
                        Create a ledger account for tracking transactions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddAccount} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Account Name *</Label>
                        <Input
                          id="name"
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                          placeholder="e.g., Mohan, Petty Cash"
                          autoFocus
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={accountForm.description}
                          onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingAccount ? 'Update' : 'Create'} Account
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setIsAddAccountDialogOpen(false);
                          resetAccountForm();
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredAccounts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No accounts found
                  </p>
                ) : (
                  filteredAccounts.map((account) => {
                    const accountBalance = calculateBalance(account.id);
                    const isSelected = selectedAccountId === account.id;
                    
                    return (
                      <div
                        key={account.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedAccountId(account.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {account.name}
                            </p>
                            {account.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {account.description}
                              </p>
                            )}
                            <div className={`text-sm font-medium mt-2 ${
                              accountBalance >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              Balance: ₹{accountBalance.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditAccount(account)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteAccountId(account.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Details */}
        <div className="lg:col-span-2">
          {selectedAccount ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedAccount.name}</CardTitle>
                    <CardDescription>{selectedAccount.description || 'Ledger entries'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleExportCSV} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Dialog open={isAddEntryDialogOpen} onOpenChange={(open) => {
                      setIsAddEntryDialogOpen(open);
                      if (!open) resetEntryForm();
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => {
                          setEntryForm({ ...entryForm, accountId: selectedAccountId });
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Entry
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
                          <DialogDescription>
                            Record a transaction for this account
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                          <div>
                            <Label htmlFor="entry-type">Transaction Type *</Label>
                            <Select
                              value={entryForm.type}
                              onValueChange={(value: 'credit' | 'debit') => 
                                setEntryForm({ ...entryForm, type: value })
                              }
                            >
                              <SelectTrigger id="entry-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="credit">Credit (+) - Money Given/Received</SelectItem>
                                <SelectItem value="debit">Debit (-) - Money Taken/Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="amount">Amount *</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              min="0"
                              value={entryForm.amount}
                              onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="entry-date">Date *</Label>
                            <Input
                              id="entry-date"
                              type="date"
                              value={entryForm.date}
                              onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="entry-description">Description</Label>
                            <Textarea
                              id="entry-description"
                              value={entryForm.description}
                              onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                              placeholder="Optional description"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingEntry ? 'Update' : 'Add'} Entry
                            </Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setIsAddEntryDialogOpen(false);
                              resetEntryForm();
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Total Credit</span>
                    </div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
                      ₹{totalCredit.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs font-medium">Total Debit</span>
                    </div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300 mt-1">
                      ₹{totalDebit.toFixed(2)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    balance >= 0
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-orange-50 dark:bg-orange-900/20'
                  }`}>
                    <div className={`flex items-center gap-2 ${
                      balance >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs font-medium">Balance</span>
                    </div>
                    <p className={`text-lg font-bold mt-1 ${
                      balance >= 0
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-orange-700 dark:text-orange-300'
                    }`}>
                      ₹{balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {selectedAccountEntries.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No entries yet. Click "Add Entry" to get started.
                    </p>
                  ) : (
                    selectedAccountEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-4 border rounded-lg ${
                          entry.type === 'credit'
                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                entry.type === 'credit'
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : 'bg-red-100 dark:bg-red-900/30'
                              }`}>
                                {entry.type === 'credit' ? (
                                  <TrendingUp className={`w-4 h-4 text-green-600 dark:text-green-400`} />
                                ) : (
                                  <TrendingDown className={`w-4 h-4 text-red-600 dark:text-red-400`} />
                                )}
                              </div>
                              <div>
                                <p className={`font-medium ${
                                  entry.type === 'credit'
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-red-700 dark:text-red-300'
                                }`}>
                                  {entry.type === 'credit' ? '+' : '-'} ₹{entry.amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(entry.date).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            {entry.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-12">
                                {entry.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteEntryId(entry.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an account to view ledger entries</p>
                  <p className="text-sm mt-2">or create a new account to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAccountId && handleDeleteAccount(deleteAccountId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Entry Confirmation */}
      <AlertDialog open={!!deleteEntryId} onOpenChange={(open) => !open && setDeleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteEntryId && handleDeleteEntry(deleteEntryId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
