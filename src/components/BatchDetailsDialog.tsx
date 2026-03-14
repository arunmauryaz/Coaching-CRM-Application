import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useCRMData } from './hooks/useCRMData';
import { UserMinus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BatchDetailsDialogProps {
  batchId: string;
  onClose: () => void;
}

export default function BatchDetailsDialog({ batchId, onClose }: BatchDetailsDialogProps) {
  const { batches, students, removeStudentFromBatch } = useCRMData();
  
  const batch = batches.find(b => b.id === batchId);
  const batchStudents = students.filter(s => s.batchIds.includes(batchId));

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to remove ${studentName} from this batch?`)) {
      removeStudentFromBatch(studentId, batchId);
      toast.success('Student removed from batch');
    }
  };

  if (!batch) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>{batch.name}</DialogTitle>
          <DialogDescription>
            {batch.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-900">Students in this batch</h3>
            <Badge variant="outline">{batchStudents.length} Students</Badge>
          </div>

          {batchStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students in this batch yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Roll No</TableHead>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Phone Numbers</TableHead>
                    <TableHead className="whitespace-nowrap">Other Batches</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchStudents.map((student) => {
                    const otherBatches = student.batchIds
                      .filter(id => id !== batchId)
                      .map(id => batches.find(b => b.id === id)?.name)
                      .filter(Boolean);

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="whitespace-nowrap">{student.rollNo}</TableCell>
                        <TableCell className="whitespace-nowrap">{student.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {student.phoneNumbers.map((phone, index) => (
                              <span key={index} className="text-gray-600">{phone}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {otherBatches.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {otherBatches.map((batchName, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {batchName}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudent(student.id, student.name)}
                          >
                            <UserMinus className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
