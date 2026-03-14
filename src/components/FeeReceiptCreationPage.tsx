import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Printer, Save, Search, ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';

interface FeeReceiptCreationPageProps {
  onBack: () => void;
  onReceiptCreated: () => void;
  receiptId?: string; // For editing existing receipt
}

export default function FeeReceiptCreationPage({ onBack, onReceiptCreated, receiptId }: FeeReceiptCreationPageProps) {
  const { students, batches, addReceipt, updateReceipt, getNextReceiptNumber, receiptTemplate, receipts } = useCRMData();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Initialize form data - either from existing receipt or new
  const existingReceipt = receiptId ? receipts.find(r => r.id === receiptId) : null;
  
  const [formData, setFormData] = useState({
    receiptNumber: existingReceipt?.receiptNumber || getNextReceiptNumber(),
    studentId: existingReceipt?.studentId || '',
    batchId: existingReceipt?.batchId || '',
    batchPrice: existingReceipt?.batchPrice.toString() || '',
    amountPaid: existingReceipt?.amountPaid.toString() || '',
    date: existingReceipt?.date || new Date().toISOString().split('T')[0],
    notes: existingReceipt?.notes || '',
  });

  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setStudentSearchOpen(false);
      }
    };

    if (studentSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [studentSearchOpen]);

  const handleSave = () => {
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }

    if (!formData.batchId) {
      toast.error('Please select a batch');
      return;
    }

    if (!formData.batchPrice || parseFloat(formData.batchPrice) <= 0) {
      toast.error('Please enter a valid batch price');
      return;
    }

    if (!formData.amountPaid || parseFloat(formData.amountPaid) < 0) {
      toast.error('Please enter a valid amount paid');
      return;
    }

    const student = students.find(s => s.id === formData.studentId);
    const batch = batches.find(b => b.id === formData.batchId);
    const batchPrice = parseFloat(formData.batchPrice);
    const amountPaid = parseFloat(formData.amountPaid);
    const dueAmount = batchPrice - amountPaid;

    if (!student || !batch) {
      toast.error('Invalid student or batch selected');
      return;
    }

    const receipt = {
      receiptNumber: formData.receiptNumber,
      studentId: formData.studentId,
      studentName: student.name,
      studentRoll: student.rollNo,
      batchId: formData.batchId,
      batchName: batch.name,
      batchPrice,
      amountPaid,
      dueAmount,
      date: formData.date,
      notes: formData.notes,
    };

    if (receiptId) {
      updateReceipt(receiptId, receipt);
      toast.success('Fee receipt updated successfully');
    } else {
      addReceipt(receipt);
      toast.success('Fee receipt created successfully');
    }
    onReceiptCreated();
  };

  const handlePrint = () => {
    if (!formData.studentId || !formData.batchId) {
      toast.error('Please fill in all required fields before printing');
      return;
    }
    window.print();
  };

  const selectedStudent = students.find(s => s.id === formData.studentId);
  const selectedBatch = batches.find(b => b.id === formData.batchId);
  const batchPrice = parseFloat(formData.batchPrice) || 0;
  const amountPaid = parseFloat(formData.amountPaid) || 0;
  const dueAmount = batchPrice - amountPaid;

  // Filter students by selected batch first, then by search query
  const studentsInSelectedBatch = formData.batchId 
    ? students.filter(student => student.batchIds.includes(formData.batchId))
    : [];

  const filteredStudents = studentsInSelectedBatch.filter(student =>
    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const handleStudentSelect = (studentId: string) => {
    setFormData({ ...formData, studentId });
    setStudentSearchOpen(false);
    setStudentSearchQuery('');
  };

  const handleClearStudent = () => {
    setFormData({ ...formData, studentId: '' });
    setStudentSearchQuery('');
  };

  const handleBatchChange = (batchId: string) => {
    // Clear student selection when batch changes
    setFormData({ ...formData, batchId, studentId: '' });
    setStudentSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - No Print */}
      <div className="print:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Billing
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Receipt Form - No Print */}
      <div className="print:hidden max-w-5xl mx-auto p-4 md:p-8">
        <h1 className="text-gray-900 dark:text-gray-100 mb-6">
          {receiptId ? 'Edit Fee Receipt' : 'Create Fee Receipt'}
        </h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Receipt Number */}
              <div>
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                />
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* Batch Selection - FIRST */}
              <div>
                <Label htmlFor="batch">Batch to Purchase *</Label>
                <Select value={formData.batchId} onValueChange={handleBatchChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student Selection with Search - SECOND (disabled until batch selected) */}
              <div className="relative" ref={searchDropdownRef}>
                <Label>Student (Search by Name or Roll) *</Label>
                {!formData.batchId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Please select a batch first
                  </p>
                )}
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => formData.batchId && setStudentSearchOpen(!studentSearchOpen)}
                    disabled={!formData.batchId}
                  >
                    {selectedStudent
                      ? `${selectedStudent.rollNo} - ${selectedStudent.name}`
                      : formData.batchId 
                        ? "Select student from this batch..." 
                        : "Select a batch first..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  {selectedStudent && (
                    <button
                      type="button"
                      onClick={handleClearStudent}
                      className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {studentSearchOpen && formData.batchId && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search by name or roll number..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="pl-9"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Student List */}
                    <div className="max-h-64 overflow-y-auto">
                      {studentsInSelectedBatch.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No students enrolled in this batch
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No students found matching "{studentSearchQuery}"
                        </div>
                      ) : (
                        filteredStudents.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => handleStudentSelect(student.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="flex flex-col">
                              <span className="text-gray-900 dark:text-gray-100">{student.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Roll: {student.rollNo}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Batch Price */}
              <div>
                <Label htmlFor="batchPrice">Batch Price (₹) *</Label>
                <Input
                  id="batchPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 10000"
                  value={formData.batchPrice}
                  onChange={(e) => setFormData({ ...formData, batchPrice: e.target.value })}
                />
              </div>

              {/* Amount Paid */}
              <div>
                <Label htmlFor="amountPaid">Amount Paid (₹) *</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                />
              </div>

              {/* Due Amount - Calculated */}
              <div className="md:col-span-2">
                <Label>Due Amount (Auto-calculated)</Label>
                <div className="text-2xl text-gray-900 dark:text-gray-100 mt-2">
                  ₹{dueAmount.toFixed(2)}
                  {dueAmount > 0 && (
                    <span className="text-sm text-red-600 dark:text-red-400 ml-2">(Pending)</span>
                  )}
                  {dueAmount === 0 && (
                    <span className="text-sm text-green-600 dark:text-green-400 ml-2">(Fully Paid)</span>
                  )}
                  {dueAmount < 0 && (
                    <span className="text-sm text-orange-600 dark:text-orange-400 ml-2">(Overpaid by ₹{Math.abs(dueAmount).toFixed(2)})</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or payment terms"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Preview */}
      <div ref={printRef} className="hidden print:block print-preview max-w-4xl mx-auto bg-white p-8">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-preview, .print-preview * {
              visibility: visible;
            }
            .print-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>

        {/* Receipt Layout Based on Template */}
        {receiptTemplate?.layout === 'centered' ? (
          // Centered Layout
          <>
            <div className="text-center mb-8 pb-4 border-b-2 border-gray-200">
              {receiptTemplate?.logo && (
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded overflow-hidden">
                    <img src={receiptTemplate.logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              <h1 className="text-3xl text-blue-900 mb-2">{receiptTemplate?.businessName || 'Coaching CRM'}</h1>
              {receiptTemplate?.address && (
                <p className="text-sm text-gray-600 mb-1">{receiptTemplate.address}</p>
              )}
              {receiptTemplate?.phone && (
                <p className="text-sm text-gray-600 mb-1">Phone: {receiptTemplate.phone}</p>
              )}
              {receiptTemplate?.email && (
                <p className="text-sm text-gray-600">Email: {receiptTemplate.email}</p>
              )}
            </div>

            <h2 className="text-2xl text-center mb-8">Fee Receipt</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Receipt No.</p>
                <p className="text-lg">{formData.receiptNumber}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-lg">{new Date(formData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </>
        ) : (
          // Left-aligned Layout (Default)
          <>
            <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-gray-200">
              <div className="flex items-start gap-4">
                {receiptTemplate?.logo && (
                  <div className="w-16 h-16 rounded overflow-hidden">
                    <img src={receiptTemplate.logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                )}
                {!receiptTemplate?.logo && (
                  <div className="w-16 h-16 bg-blue-900 rounded flex items-center justify-center">
                    <span className="text-white text-2xl">
                      {(receiptTemplate?.businessName || 'CRM')[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl text-blue-900 mb-1">{receiptTemplate?.businessName || 'Coaching CRM'}</h2>
                  {receiptTemplate?.address && (
                    <p className="text-sm text-gray-600">{receiptTemplate.address}</p>
                  )}
                  {receiptTemplate?.phone && (
                    <p className="text-sm text-gray-600">Phone: {receiptTemplate.phone}</p>
                  )}
                  {receiptTemplate?.email && (
                    <p className="text-sm text-gray-600">Email: {receiptTemplate.email}</p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-2xl mb-8">Fee Receipt</h3>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Receipt No.</p>
                <p className="text-lg">{formData.receiptNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-lg">{new Date(formData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </>
        )}

        {/* Student Details - Same for both layouts */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h4 className="text-sm text-gray-600 mb-3">Student Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg">{selectedStudent?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Roll Number</p>
              <p className="text-lg">{selectedStudent?.rollNo || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Fee Details */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 text-gray-600">Description</th>
              <th className="text-right py-3 text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-3">
                <div>
                  <p className="font-medium">Batch: {selectedBatch?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Total Batch Fee</p>
                </div>
              </td>
              <td className="text-right py-3">₹ {batchPrice.toFixed(2)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3">Amount Paid</td>
              <td className="text-right py-3 text-green-600">₹ {amountPaid.toFixed(2)}</td>
            </tr>
            <tr className="border-b-2 border-gray-300">
              <td className="py-3 font-medium">Due Amount</td>
              <td className="text-right py-3 font-medium text-red-600">₹ {dueAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {formData.notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h4 className="text-sm text-gray-600 mb-2">Notes</h4>
            <p className="text-sm text-gray-700">{formData.notes}</p>
          </div>
        )}

        <div className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your payment!</p>
        </div>
      </div>
    </div>
  );
}
