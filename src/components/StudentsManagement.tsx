import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, Phone, UserX, Download, Filter, UserCheck, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';
import { Textarea } from './ui/textarea';

interface StudentsManagementProps {
  onViewStudent: (studentId: string) => void;
}

export default function StudentsManagement({ onViewStudent }: StudentsManagementProps) {
  const { students, batches, addStudent, updateStudent, deleteStudent, markStudentAsLeft, reAdmitStudent, getNextRollNumber } = useCRMData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    address: '',
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.rollNo.trim()) {
      toast.error('Please fill in name and roll number');
      return;
    }

    const validPhoneNumbers = phoneNumbers.filter(p => p.trim() !== '');
    if (validPhoneNumbers.length === 0) {
      toast.error('Please add at least one phone number');
      return;
    }

    if (selectedBatches.length === 0) {
      toast.error('Please select at least one batch');
      return;
    }

    const studentData = {
      ...formData,
      phoneNumbers: validPhoneNumbers,
      batchIds: selectedBatches,
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
      toast.success('Student updated successfully');
    } else {
      addStudent(studentData);
      toast.success('Student added successfully');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      address: student.address || '',
    });
    setPhoneNumbers(student.phoneNumbers.length > 0 ? student.phoneNumbers : ['']);
    setSelectedBatches(student.batchIds);
    setIsDialogOpen(true);
  };

  const handleDelete = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteStudent(studentId);
      toast.success('Student deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', rollNo: '', address: '' });
    setPhoneNumbers(['']);
    setSelectedBatches([]);
    setEditingStudent(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleMarkAsLeft = (studentId: string, studentName: string) => {
    if (confirm(`Mark "${studentName}" as left?`)) {
      markStudentAsLeft(studentId);
      toast.success('Student marked as left');
    }
  };

  const handleReAdmit = (studentId: string, studentName: string) => {
    if (confirm(`Re-admit "${studentName}"? This will mark them as active again.`)) {
      reAdmitStudent(studentId);
      toast.success('Student re-admitted successfully');
    }
  };

  // Auto-populate roll number when opening add dialog
  useEffect(() => {
    if (isDialogOpen && !editingStudent) {
      const nextRoll = getNextRollNumber();
      setFormData(prev => ({ ...prev, rollNo: nextRoll }));
    }
  }, [isDialogOpen, editingStudent]);

  const addPhoneField = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const removePhoneField = (index: number) => {
    const updated = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(updated.length > 0 ? updated : ['']);
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const updated = [...phoneNumbers];
    updated[index] = value;
    setPhoneNumbers(updated);
  };

  const addBatch = (batchId: string) => {
    if (!selectedBatches.includes(batchId)) {
      setSelectedBatches([...selectedBatches, batchId]);
    }
  };

  const removeBatch = (batchId: string) => {
    setSelectedBatches(selectedBatches.filter(id => id !== batchId));
  };

  const getBatchNames = (batchIds: string[]) => {
    return batchIds.map(id => batches.find(b => b.id === id)?.name).filter(Boolean);
  };

  // Filter students by batch
  const filteredStudents = batchFilter === 'all' 
    ? students 
    : students.filter(student => student.batchIds.includes(batchFilter));

  // Export students as CSV
  const exportStudentsCSV = () => {
    const csvHeaders = ['Roll No', 'Name', 'Phone Numbers', 'Address', 'Batches', 'Status'];
    const csvRows = filteredStudents.map(student => [
      student.rollNo,
      student.name,
      student.phoneNumbers.join('; '),
      student.address || '',
      getBatchNames(student.batchIds).join('; '),
      student.status || 'active'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Students exported successfully');
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100 mb-2">Students Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage student registrations and details</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={exportStudentsCSV} variant="outline" className="flex-1 sm:flex-initial">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="flex-1 sm:flex-initial">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Batch Filter */}
      <div className="mb-4 flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <Label htmlFor="batch-filter" className="text-gray-700 dark:text-gray-300">Filter by Batch:</Label>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger id="batch-filter" className="w-64">
            <SelectValue placeholder="All Batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map(batch => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {batchFilter !== 'all' && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Roll No</TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Phone Numbers</TableHead>
              <TableHead className="whitespace-nowrap">Batches</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {batchFilter === 'all' 
                    ? 'No students added yet. Click "Add Student" to get started.'
                    : 'No students found in this batch.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className={student.status === 'left' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                  <TableCell className="whitespace-nowrap">
                    {student.rollNo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {student.name}
                      {student.status === 'left' && (
                        <Badge variant="destructive" className="text-xs">Left</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {student.phoneNumbers.slice(0, 2).map((phone, index) => (
                        <span key={index} className="text-gray-600 text-sm">{phone}</span>
                      ))}
                      {student.phoneNumbers.length > 2 && (
                        <span className="text-gray-400 text-xs">+{student.phoneNumbers.length - 2} more</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getBatchNames(student.batchIds).map((batchName, index) => (
                        <Badge key={index} variant="outline" className="whitespace-nowrap">
                          {batchName}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewStudent(student.id)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(student)}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {student.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsLeft(student.id, student.name)}
                          title="Mark as Left"
                        >
                          <UserX className="w-4 h-4 text-orange-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReAdmit(student.id, student.name)}
                          title="Re-admit Student"
                        >
                          <UserCheck className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Update student information' : 'Add a new student to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Student name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="rollNo">Roll Number *</Label>
                <Input
                  id="rollNo"
                  placeholder="Auto-generated"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                />
                {!editingStudent && (
                  <p className="text-xs text-gray-500 mt-1">
                    Next available: {formData.rollNo}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Student's address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label>Phone Numbers *</Label>
              <div className="space-y-2">
                {phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., +91 9876543210"
                      value={phone}
                      onChange={(e) => updatePhoneNumber(index, e.target.value)}
                    />
                    {phoneNumbers.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePhoneField(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addPhoneField}>
                  <Phone className="w-4 h-4 mr-2" />
                  Add Phone Number
                </Button>
              </div>
            </div>

            <div>
              <Label>Batches * (Select one or more)</Label>
              
              {/* Selected Batches as Tags */}
              {selectedBatches.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
                  {selectedBatches.map((batchId) => {
                    const batch = batches.find(b => b.id === batchId);
                    return (
                      <Badge key={batchId} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                        {batch?.name}
                        <button
                          type="button"
                          onClick={() => removeBatch(batchId)}
                          className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Batch Selector Dropdown */}
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (value && !selectedBatches.includes(value)) {
                    addBatch(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batches to add" />
                </SelectTrigger>
                <SelectContent>
                  {batches
                    .filter(batch => !selectedBatches.includes(batch.id))
                    .map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  {batches.filter(batch => !selectedBatches.includes(batch.id)).length === 0 && (
                    <div className="text-sm text-gray-500 p-2 text-center">
                      All batches selected
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingStudent ? 'Update' : 'Add'} Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}
