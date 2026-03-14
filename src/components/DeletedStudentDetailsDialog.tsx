import { User, Phone, MapPin, BookOpen, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCRMData } from './hooks/useCRMData';
import { Separator } from './ui/separator';

interface DeletedStudentDetailsDialogProps {
  trashItem: any;
  open: boolean;
  onClose: () => void;
}

export default function DeletedStudentDetailsDialog({ trashItem, open, onClose }: DeletedStudentDetailsDialogProps) {
  const { batches } = useCRMData();
  
  const student = trashItem.data;
  const attendanceRecords = trashItem.relatedData?.attendance || [];
  const feeRecords = trashItem.relatedData?.fees || [];
  
  const studentBatches = student.batchIds?.map((id: string) => batches.find(b => b.id === id)).filter(Boolean) || [];
  
  // Calculate attendance
  const totalClasses = attendanceRecords.length;
  const presentClasses = attendanceRecords.filter((r: any) => r.status === 'present').length;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
  
  // Get fee records
  const totalPaid = feeRecords
    .filter((r: any) => r.status === 'paid')
    .reduce((sum: number, r: any) => sum + r.amount, 0);
  const totalDue = feeRecords
    .filter((r: any) => r.status === 'due')
    .reduce((sum: number, r: any) => sum + r.amount, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Deleted Student Details
          </DialogTitle>
          <DialogDescription>
            This student was deleted on {formatDate(trashItem.deletedDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This student has been deleted and is currently in trash. You can restore this student from the trash to make them active again.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-gray-100">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Roll Number</p>
                  <p className="text-gray-900 dark:text-gray-100">{student.rollNo}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Phone Numbers</p>
                <div className="flex flex-wrap gap-2">
                  {student.phoneNumbers?.map((phone: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 dark:text-gray-100">{phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {student.address && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <p className="text-gray-900 dark:text-gray-100">{student.address}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Enrolled Batches</p>
                <div className="flex flex-wrap gap-2">
                  {studentBatches.length > 0 ? (
                    studentBatches.map((batch: any, index: number) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        {batch.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No batches</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Classes</p>
                  <p className="text-2xl text-blue-900 dark:text-blue-100">{totalClasses}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Present</p>
                  <p className="text-2xl text-green-900 dark:text-green-100">{presentClasses}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Attendance</p>
                  <p className="text-2xl text-purple-900 dark:text-purple-100">{attendancePercentage.toFixed(1)}%</p>
                </div>
              </div>

              {attendanceRecords.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recent Attendance Records</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {attendanceRecords.slice(-5).reverse().map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(record.date)}</span>
                        <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fee Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Fee Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Total Paid</p>
                  <p className="text-2xl text-green-900 dark:text-green-100">₹{totalPaid}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Total Due</p>
                  <p className="text-2xl text-red-900 dark:text-red-100">₹{totalDue}</p>
                </div>
              </div>

              {feeRecords.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Fee Records</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {feeRecords.map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">{record.month}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {record.status === 'paid' ? `Paid on ${formatDate(record.paymentDate)}` : 'Payment pending'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 dark:text-gray-100">₹{record.amount}</p>
                          <Badge variant={record.status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
