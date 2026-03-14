import { useState } from 'react';
import { Plus, Eye, Settings, DollarSign, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface BillingManagementProps {
  onCreateReceipt: () => void;
  onViewReceipt: (receiptId: string) => void;
  onEditReceipt: (receiptId: string) => void;
  onManageTemplate: () => void;
}

export default function BillingManagement({ 
  onCreateReceipt, 
  onViewReceipt,
  onEditReceipt,
  onManageTemplate 
}: BillingManagementProps) {
  const { receipts, deleteReceipt } = useCRMData();
  const [deleteReceiptId, setDeleteReceiptId] = useState<string | null>(null);

  const getTotalRevenue = () => {
    return receipts.reduce((sum, receipt) => sum + receipt.amountPaid, 0);
  };

  const getTotalDue = () => {
    return receipts.reduce((sum, receipt) => sum + (receipt.dueAmount > 0 ? receipt.dueAmount : 0), 0);
  };

  const getTotalBatchValue = () => {
    return receipts.reduce((sum, receipt) => sum + receipt.batchPrice, 0);
  };

  // Export receipts as CSV
  const exportReceiptsCSV = () => {
    const csvHeaders = ['Receipt No', 'Date', 'Student Name', 'Roll No', 'Batch', 'Batch Price', 'Amount Paid', 'Due Amount'];
    const csvRows = receipts.map(receipt => [
      receipt.receiptNumber,
      new Date(receipt.date).toLocaleDateString(),
      receipt.studentName,
      receipt.studentRoll,
      receipt.batchName,
      receipt.batchPrice,
      receipt.amountPaid,
      receipt.dueAmount
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fee-receipts-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Receipts exported successfully');
  };

  const handleDeleteReceipt = (receiptId: string) => {
    deleteReceipt(receiptId);
    toast.success('Receipt deleted successfully');
    setDeleteReceiptId(null);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100 mb-2">Billing & Fee Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage fee receipts and payment records</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={onManageTemplate} variant="outline" className="flex-1 sm:flex-initial">
            <Settings className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button onClick={exportReceiptsCSV} variant="outline" className="flex-1 sm:flex-initial">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={onCreateReceipt} className="flex-1 sm:flex-initial">
            <Plus className="w-4 h-4 mr-2" />
            Create Receipt
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-400">Total Collected</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">₹{getTotalRevenue().toLocaleString()}</div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Amount received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-400">Total Due</CardTitle>
            <DollarSign className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">₹{getTotalDue().toLocaleString()}</div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-400">Total Receipts</CardTitle>
            <FileText className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{receipts.length}</div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Fee receipts created</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Receipt #</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Student</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">Roll No</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">Batch</TableHead>
                  <TableHead className="whitespace-nowrap">Paid</TableHead>
                  <TableHead className="whitespace-nowrap">Due</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No fee receipts created yet. Click "Create Receipt" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="whitespace-nowrap">{receipt.receiptNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(receipt.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{receipt.studentName}</TableCell>
                      <TableCell className="whitespace-nowrap hidden sm:table-cell">
                        {receipt.studentRoll}
                      </TableCell>
                      <TableCell className="whitespace-nowrap hidden md:table-cell">
                        <Badge variant="outline" className="whitespace-nowrap">
                          {receipt.batchName}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-green-600 dark:text-green-400">
                        ₹{receipt.amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {receipt.dueAmount > 0 ? (
                          <span className="text-red-600 dark:text-red-400">₹{receipt.dueAmount.toLocaleString()}</span>
                        ) : (
                          <Badge variant="default" className="bg-green-600">Paid</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewReceipt(receipt.id)}
                            title="View Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditReceipt(receipt.id)}
                            title="Edit Receipt"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteReceiptId(receipt.id)}
                            title="Delete Receipt"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteReceiptId} onOpenChange={(open) => !open && setDeleteReceiptId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this receipt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteReceiptId && handleDeleteReceipt(deleteReceiptId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
