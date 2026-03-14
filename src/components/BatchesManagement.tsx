import { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';
import BatchDetailsDialog from './BatchDetailsDialog';

export default function BatchesManagement() {
  const { batches, addBatch, updateBatch, deleteBatch, students } = useCRMData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [viewingBatchId, setViewingBatchId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter batch name');
      return;
    }

    if (editingBatch) {
      updateBatch(editingBatch.id, formData);
      toast.success('Batch updated successfully');
    } else {
      addBatch(formData);
      toast.success('Batch created successfully');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (batch: any) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      description: batch.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (batchId: string) => {
    if (confirm('Are you sure you want to delete this batch?')) {
      deleteBatch(batchId);
      toast.success('Batch deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingBatch(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getBatchStudentCount = (batchId: string) => {
    return students.filter(s => s.batchIds.includes(batchId)).length;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Batches Management</h1>
          <p className="text-gray-600">Create and manage your coaching batches</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {batches.map((batch) => {
          const studentCount = getBatchStudentCount(batch.id);
          return (
            <Card key={batch.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{batch.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(batch);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(batch.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => setViewingBatchId(batch.id)}>
                <p className="text-gray-600 mb-4">{batch.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{studentCount} Students</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
            <DialogDescription>
              {editingBatch ? 'Update batch information' : 'Create a new batch for your coaching'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Batch Name</Label>
              <Input
                id="name"
                placeholder="e.g., C++ Study Batch"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the batch"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingBatch ? 'Update' : 'Create'} Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Details Dialog */}
      {viewingBatchId && (
        <BatchDetailsDialog
          batchId={viewingBatchId}
          onClose={() => setViewingBatchId(null)}
        />
      )}
    </div>
  );
}
