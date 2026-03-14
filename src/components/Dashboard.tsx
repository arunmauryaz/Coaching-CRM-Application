import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, BookOpen, DollarSign, TrendingUp, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useCRMData } from './hooks/useCRMData';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import RemindersPanel from './RemindersPanel';

interface DashboardProps {
  onViewStudent: (studentId: string) => void;
}

export default function Dashboard({ onViewStudent }: DashboardProps) {
  const { students, batches, feeRecords, attendanceRecords } = useCRMData();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    totalRevenue: 0,
    averageAttendance: 0,
  });

  useEffect(() => {
    const totalStudents = students.length;
    const totalBatches = batches.length;
    
    const totalRevenue = feeRecords.reduce((sum, record) => {
      if (record.status === 'paid') {
        return sum + record.amount;
      }
      return sum;
    }, 0);

    // Calculate average attendance
    const attendancePercentages = students.map(student => {
      const studentAttendance = attendanceRecords.filter(
        record => record.studentId === student.id
      );
      if (studentAttendance.length === 0) return 0;
      const present = studentAttendance.filter(record => record.status === 'present').length;
      return (present / studentAttendance.length) * 100;
    });
    
    const averageAttendance = attendancePercentages.length > 0
      ? attendancePercentages.reduce((sum, val) => sum + val, 0) / attendancePercentages.length
      : 0;

    setStats({
      totalStudents,
      totalBatches,
      totalRevenue,
      averageAttendance,
    });
  }, [students, batches, feeRecords, attendanceRecords]);

  // Revenue by month
  const revenueByMonth = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  // Students by batch
  const studentsByBatch = batches.map(batch => ({
    name: batch.name,
    students: students.filter(s => s.batchIds.includes(batch.id)).length,
  }));

  // Search functionality
  const searchResults = searchQuery.trim() === '' ? [] : [
    ...students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phoneNumbers.some(phone => phone.includes(searchQuery))
    ).map(student => ({
      type: 'student' as const,
      data: student,
    })),
    ...batches.filter(batch =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(batch => ({
      type: 'batch' as const,
      data: batch,
    })),
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your business overview.</p>
        </div>
        <RemindersPanel />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search students by name, roll number, phone or search batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Search Results */}
        {searchQuery.trim() !== '' && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No results found</p>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                      {result.type === 'student' ? (
                        <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg -m-3" onClick={() => onViewStudent(result.data.id)}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Student</Badge>
                              <span className="text-gray-900 dark:text-gray-100">{result.data.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-400 text-sm">Roll: {result.data.rollNo}</span>
                              <Button variant="ghost" size="sm">View Details</Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>Phone: {result.data.phoneNumbers.join(', ')}</div>
                            <div className="flex gap-1 mt-1">
                              Batches: {result.data.batchIds.map((batchId: string) => {
                                const batch = batches.find(b => b.id === batchId);
                                return batch ? (
                                  <Badge key={batchId} variant="outline" className="text-xs">
                                    {batch.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>Batch</Badge>
                            <span className="text-gray-900 dark:text-gray-100">{result.data.name}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{result.data.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Students: {students.filter(s => s.batchIds.includes(result.data.id)).length}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-400">Total Students</CardTitle>
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{stats.totalStudents}</div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-400">Total Batches</CardTitle>
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{stats.totalBatches}</div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Running courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-400">Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-gray-500 mt-1">Total collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600">Avg Attendance</CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{stats.averageAttendance.toFixed(1)}%</div>
            <p className="text-gray-500 mt-1">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students by Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studentsByBatch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#10b981" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
