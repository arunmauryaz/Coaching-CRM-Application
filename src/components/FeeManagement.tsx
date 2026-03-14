import { useState } from 'react';
import { Plus, DollarSign, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';

export default function FeeManagement() {
  const { students, batches, feeRecords, addFeeRecord } = useCRMData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    month: '',
    status: 'paid' as 'paid' | 'due',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = () => {
    if (!formData.studentId || !formData.amount || !formData.month) {
      toast.error('Please fill in all required fields');
      return;
    }

    addFeeRecord({
      ...formData,
      amount: parseFloat(formData.amount),
    });

    toast.success('Fee record added successfully');
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      amount: '',
      month: '',
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
    });
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'N/A';
  };

  const getStudentRollNo = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.rollNo || 'N/A';
  };

  const getBatchNames = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    return student.batchIds
      .map(id => batches.find(b => b.id === id)?.name)
      .filter(Boolean);
  };

  const getTotalRevenue = () => {
    return feeRecords
      .filter(r => r.status === 'paid')
      .reduce((sum, record) => sum + record.amount, 0);
  };

  const getTotalDue = () => {
    return feeRecords
      .filter(r => r.status === 'due')
      .reduce((sum, record) => sum + record.amount, 0);
  };

  // Export fees as CSV
  const exportFeesCSV = () => {
    const csvHeaders = ['Roll No', 'Student Name', 'Batches', 'Month', 'Amount', 'Payment Date', 'Status'];
    const csvRows = feeRecords.map(record => [
      getStudentRollNo(record.studentId),
      getStudentName(record.studentId),
      getBatchNames(record.studentId).join('; '),
      record.month,
      record.amount,
      record.paymentDate,
      record.status
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fee-records-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Fee records exported successfully');
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100 mb-2">Fee Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track student fee payments and dues</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={exportFeesCSV} variant="outline" className="flex-1 sm:flex-initial">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="flex-1 sm:flex-initial">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">₹{getTotalRevenue().toLocaleString()}</div>
            <p className="text-gray-500 mt-1">Total collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600">Total Due</CardTitle>
            <DollarSign className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">₹{getTotalDue().toLocaleString()}</div>
            <p className="text-gray-500 mt-1">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600">Total Records</CardTitle>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{feeRecords.length}</div>
            <p className="text-gray-500 mt-1">Payment entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Roll No</TableHead>
                  <TableHead className="whitespace-nowrap">Student Name</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">Batch</TableHead>
                  <TableHead className="whitespace-nowrap">Month</TableHead>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">Payment Date</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No fee records added yet. Click "Add Payment" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  feeRecords.map((record) => {
                    const batchNames = getBatchNames(record.studentId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="whitespace-nowrap">{getStudentRollNo(record.studentId)}</TableCell>
                        <TableCell className="whitespace-nowrap">{getStudentName(record.studentId)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {batchNames.map((name, index) => (
                              <Badge key={index} variant="outline" className="whitespace-nowrap text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{record.month}</TableCell>
                        <TableCell className="whitespace-nowrap">₹{record.amount.toLocaleString()}</TableCell>
                        <TableCell className="whitespace-nowrap hidden md:table-cell">{record.paymentDate}</TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'paid' ? 'default' : 'destructive'} className="whitespace-nowrap">
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fee Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="student">Student *</Label>
              <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.rollNo} - {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 5000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="month">Month *</Label>
              <Input
                id="month"
                placeholder="e.g., January 2025"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: 'paid' | 'due') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
