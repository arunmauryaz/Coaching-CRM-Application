import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCRMData } from './hooks/useCRMData';
import { User, Phone, Mail, BookOpen, Calendar, DollarSign } from 'lucide-react';

interface StudentDetailsDialogProps {
  student: any;
  onClose: () => void;
}

export default function StudentDetailsDialog({ student, onClose }: StudentDetailsDialogProps) {
  const { batches, attendanceRecords, feeRecords } = useCRMData();
  
  const studentBatches = student.batchIds.map((id: string) => batches.find(b => b.id === id)).filter(Boolean);
  
  // Calculate attendance
  const studentAttendanceRecords = attendanceRecords.filter(r => r.studentId === student.id);
  const totalClasses = studentAttendanceRecords.length;
  const presentClasses = studentAttendanceRecords.filter(r => r.status === 'present').length;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
  
  // Get monthly attendance
  const getMonthlyAttendance = () => {
    const monthlyData: Record<string, { present: number; total: number }> = {};
    
    studentAttendanceRecords.forEach(record => {
      const date = new Date(record.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { present: 0, total: 0 };
      }
      
      monthlyData[monthYear].total++;
      if (record.status === 'present') {
        monthlyData[monthYear].present++;
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      percentage: ((data.present / data.total) * 100).toFixed(1),
      present: data.present,
      total: data.total,
    }));
  };
  
  const monthlyAttendance = getMonthlyAttendance();
  
  // Get fee records
  const studentFeeRecords = feeRecords.filter(r => r.studentId === student.id);
  const totalPaid = studentFeeRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalDue = studentFeeRecords
    .filter(r => r.status === 'due')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            Complete information about the selected student including attendance and fee records
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 text-gray-900">{student.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-fit">Roll No: {student.rollNo}</Badge>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-gray-500">Phone Numbers:</span>
                  <div className="ml-2 space-y-1">
                    {student.phoneNumbers.map((phone: string, index: number) => (
                      <div key={index} className="text-gray-900">{phone}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-gray-500">Batches:</span>
                  <div className="ml-2 flex flex-wrap gap-1 mt-1">
                    {studentBatches.map((batch: any) => (
                      <Badge key={batch.id}>{batch.name}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Attendance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Overall Attendance</span>
                  <Badge
                    variant={attendancePercentage >= 75 ? 'default' : attendancePercentage >= 60 ? 'outline' : 'destructive'}
                  >
                    {attendancePercentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Present: {presentClasses}</span>
                  <span>Total Classes: {totalClasses}</span>
                </div>
              </div>

              {monthlyAttendance.length > 0 && (
                <div>
                  <h4 className="text-gray-700 mb-3">Monthly Report</h4>
                  <div className="space-y-2">
                    {monthlyAttendance.map((record) => (
                      <div key={record.month} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{record.month}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{record.present}/{record.total}</span>
                          <Badge variant="outline">{record.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fee Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-600 mb-1">Total Paid</p>
                  <p className="text-green-600">₹{totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-gray-600 mb-1">Total Due</p>
                  <p className="text-red-600">₹{totalDue.toLocaleString()}</p>
                </div>
              </div>

              {studentFeeRecords.length > 0 && (
                <div>
                  <h4 className="text-gray-700 mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {studentFeeRecords.map((record) => (
                      <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-gray-700">{record.month}</p>
                          <p className="text-gray-500">{record.paymentDate}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-900">₹{record.amount.toLocaleString()}</span>
                          <Badge variant={record.status === 'paid' ? 'default' : 'destructive'}>
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
