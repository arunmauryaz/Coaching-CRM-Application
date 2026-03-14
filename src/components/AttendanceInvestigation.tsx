import { useState, useMemo } from 'react';
import { ArrowLeft, TrendingDown, TrendingUp, UserX, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useCRMData } from './hooks/useCRMData';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';

interface AttendanceInvestigationProps {
  onBack: () => void;
}

export default function AttendanceInvestigation({ onBack }: AttendanceInvestigationProps) {
  const { students, batches, attendanceRecords } = useCRMData();
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [calendarType, setCalendarType] = useState<'from' | 'to' | null>(null);

  const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter students by batch
  const filteredStudents = selectedBatch === 'all'
    ? students.filter(s => s.status === 'active')
    : students.filter(s => s.batchIds.includes(selectedBatch) && s.status === 'active');

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const stats = filteredStudents.map(student => {
      // Get all attendance records for this student in the date range
      const studentRecords = attendanceRecords.filter(record => {
        if (record.studentId !== student.id) return false;
        const recordDate = new Date(record.date);
        return recordDate >= dateRange.from && recordDate <= dateRange.to;
      });

      const totalDays = studentRecords.length;
      const presentDays = studentRecords.filter(r => r.status === 'present').length;
      const absentDays = studentRecords.filter(r => r.status === 'absent').length;
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      // Check if student has been completely absent
      const isCompletelyAbsent = totalDays > 0 && presentDays === 0;

      return {
        student,
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage,
        isCompletelyAbsent,
      };
    });

    return stats;
  }, [filteredStudents, attendanceRecords, dateRange]);

  // Sort functions
  const mostPresent = [...attendanceStats].sort((a, b) => b.attendancePercentage - a.attendancePercentage);
  const mostAbsent = [...attendanceStats].sort((a, b) => a.attendancePercentage - b.attendancePercentage);
  const completelyAbsent = attendanceStats.filter(s => s.isCompletelyAbsent);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-gray-900">Attendance Investigation</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analyze attendance patterns and trends
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Batch Filter */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Batch
              </label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
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
            </div>

            {/* From Date */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                From Date
              </label>
              <Popover open={calendarType === 'from'} onOpenChange={(open) => setCalendarType(open ? 'from' : null)}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(dateRange.from)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange({ ...dateRange, from: date });
                        setCalendarType(null);
                      }
                    }}
                    disabled={(date) => date > new Date() || date > dateRange.to}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                To Date
              </label>
              <Popover open={calendarType === 'to'} onOpenChange={(open) => setCalendarType(open ? 'to' : null)}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(dateRange.to)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange({ ...dateRange, to: date });
                        setCalendarType(null);
                      }
                    }}
                    disabled={(date) => date > new Date() || date < dateRange.from}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Most Present */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              Most Present
            </CardTitle>
            <CardDescription>Top 5 students by attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostPresent.slice(0, 5).map((stat, idx) => (
                <div key={stat.student.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">#{idx + 1}</span>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{stat.student.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Roll: {stat.student.rollNo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 dark:text-green-400">
                      {stat.attendancePercentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.presentDays}/{stat.totalDays}
                    </p>
                  </div>
                </div>
              ))}
              {mostPresent.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Absent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <TrendingDown className="h-5 w-5" />
              Most Absent
            </CardTitle>
            <CardDescription>Students with lowest attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostAbsent.slice(0, 5).map((stat, idx) => (
                <div key={stat.student.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">#{idx + 1}</span>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{stat.student.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Roll: {stat.student.rollNo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 dark:text-orange-400">
                      {stat.attendancePercentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.presentDays}/{stat.totalDays}
                    </p>
                  </div>
                </div>
              ))}
              {mostAbsent.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completely Absent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <UserX className="h-5 w-5" />
              Not Attending
            </CardTitle>
            <CardDescription>Students with 0% attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completelyAbsent.slice(0, 5).map((stat) => (
                <div key={stat.student.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{stat.student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Roll: {stat.student.rollNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 dark:text-red-400">0%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      0/{stat.totalDays}
                    </p>
                  </div>
                </div>
              ))}
              {completelyAbsent.length === 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 text-center py-4">
                  All students have attended!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            Showing {attendanceStats.length} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100">Roll No</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100">Student Name</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">Total Days</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">Present</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">Absent</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceStats.map((stat) => (
                  <tr
                    key={stat.student.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {stat.student.rollNo}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {stat.student.name}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-900 dark:text-gray-100">
                      {stat.totalDays}
                    </td>
                    <td className="py-3 px-4 text-center text-green-600 dark:text-green-400">
                      {stat.presentDays}
                    </td>
                    <td className="py-3 px-4 text-center text-red-600 dark:text-red-400">
                      {stat.absentDays}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          'inline-block px-2 py-1 rounded',
                          stat.attendancePercentage >= 75
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : stat.attendancePercentage >= 50
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}
                      >
                        {stat.attendancePercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendanceStats.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No students found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
