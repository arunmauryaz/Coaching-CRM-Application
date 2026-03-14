import { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin, BookOpen, Calendar, DollarSign, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCRMData } from './hooks/useCRMData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface StudentDetailsPageProps {
  studentId: string;
  onBack: () => void;
}

export default function StudentDetailsPage({ studentId, onBack }: StudentDetailsPageProps) {
  const { students, batches, attendanceRecords, feeRecords } = useCRMData();
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const student = students.find(s => s.id === studentId);
  
  if (!student) {
    return (
      <div className="p-4 md:p-8">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-gray-500">Student not found</p>
      </div>
    );
  }

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

  // Get yearly attendance data
  const getYearlyAttendanceData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearRecords = studentAttendanceRecords.filter(r => {
      const recordYear = new Date(r.date).getFullYear();
      return recordYear === selectedYear;
    });

    const monthlyData = monthNames.map((month, index) => {
      const monthRecords = yearRecords.filter(r => {
        const recordMonth = new Date(r.date).getMonth();
        return recordMonth === index;
      });
      
      const present = monthRecords.filter(r => r.status === 'present').length;
      const absent = monthRecords.filter(r => r.status === 'absent').length;
      const total = monthRecords.length;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

      return {
        month,
        present,
        absent,
        total,
        percentage: parseFloat(percentage),
      };
    });

    return monthlyData;
  };

  const yearlyData = getYearlyAttendanceData();

  const exportToCSV = () => {
    const headers = ['Month', 'Present', 'Absent', 'Total', 'Percentage'];
    const rows = yearlyData.map(d => [
      d.month,
      d.present,
      d.absent,
      d.total,
      `${d.percentage}%`
    ]);

    const csvContent = [
      `Attendance Report - ${student.name} (${selectedYear})`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${student.name.replace(/\s+/g, '_')}_${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance report exported successfully');
  };

  const shareAttendance = async () => {
    const text = `Attendance Report - ${student.name} (${selectedYear})\n\n` +
      yearlyData.map(d => 
        `${d.month}: ${d.present}/${d.total} (${d.percentage}%)`
      ).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Attendance Report - ${student.name}`,
          text: text,
        });
        toast.success('Shared successfully');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Error sharing');
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">{student.name}</h1>
            <Badge variant="outline" className="text-base">Roll No: {student.rollNo}</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p className="text-gray-900">{student.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-500 text-sm">Phone Numbers</p>
                  <div className="space-y-1">
                    {student.phoneNumbers.map((phone: string, index: number) => (
                      <p key={index} className="text-gray-900">{phone}</p>
                    ))}
                  </div>
                </div>
              </div>

              {student.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500 text-sm">Address</p>
                    <p className="text-gray-900">{student.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 md:col-span-2">
                <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-500 text-sm">Batches</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {studentBatches.map((batch: any) => (
                      <Badge key={batch.id}>{batch.name}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Attendance Overview
              </CardTitle>
              <Button onClick={() => setShowAttendanceDetails(true)}>
                View Detailed Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-gray-600 mb-2">Overall Attendance</p>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={attendancePercentage >= 75 ? 'default' : attendancePercentage >= 60 ? 'outline' : 'destructive'}
                    className="text-lg px-4 py-2"
                  >
                    {attendancePercentage.toFixed(1)}%
                  </Badge>
                  <div className="text-gray-500">
                    <span>{presentClasses} present</span> / <span>{totalClasses} total classes</span>
                  </div>
                </div>
              </div>
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 mb-1">Total Paid</p>
                <p className="text-green-600 text-xl">₹{totalPaid.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-gray-600 mb-1">Total Due</p>
                <p className="text-red-600 text-xl">₹{totalDue.toLocaleString()}</p>
              </div>
            </div>

            {studentFeeRecords.length > 0 && (
              <div>
                <h4 className="text-gray-700 mb-3">Payment History</h4>
                <div className="space-y-3">
                  {studentFeeRecords.map((record) => (
                    <div key={record.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-2">
                      <div>
                        <p className="text-gray-900">{record.month}</p>
                        <p className="text-gray-500 text-sm">{record.paymentDate}</p>
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

      {/* Detailed Attendance Report Dialog */}
      <Dialog open={showAttendanceDetails} onOpenChange={setShowAttendanceDetails}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detailed Attendance Report - {student.name}</DialogTitle>
            <DialogDescription>
              View monthly and yearly attendance charts with export options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Year Selector and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedYear(selectedYear - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-gray-900 min-w-[80px] text-center">{selectedYear}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  disabled={selectedYear >= new Date().getFullYear()}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={shareAttendance}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Yearly Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Yearly Attendance Chart ({selectedYear})</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#10b981" name="Present" />
                    <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {yearlyData.map((record) => (
                    <div key={record.month} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-700">{record.month}</span>
                        <Badge 
                          variant={record.percentage >= 75 ? 'default' : record.percentage >= 60 ? 'outline' : 'destructive'}
                        >
                          {record.percentage}%
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Present: {record.present}</p>
                        <p>Absent: {record.absent}</p>
                        <p>Total: {record.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Total Classes</p>
                    <p className="text-gray-900">
                      {yearlyData.reduce((sum, d) => sum + d.total, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Total Present</p>
                    <p className="text-green-600">
                      {yearlyData.reduce((sum, d) => sum + d.present, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Total Absent</p>
                    <p className="text-red-600">
                      {yearlyData.reduce((sum, d) => sum + d.absent, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
