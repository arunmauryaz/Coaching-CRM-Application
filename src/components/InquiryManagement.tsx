import { useState, useMemo } from 'react';
import { UserPlus, GraduationCap, Plane, AlertCircle, Search, Plus, X, Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';
import { cn } from './ui/utils';
import * as XLSX from 'xlsx';

export default function InquiryManagement() {
  const {
    inquiries,
    demoStudents,
    holidays,
    students,
    batches,
    addInquiry,
    updateInquiry,
    deleteInquiry,
    addDemoStudent,
    updateDemoStudent,
    deleteDemoStudent,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    addStudent,
    getNextRollNumber,
  } = useCRMData();

  const [activeTab, setActiveTab] = useState<'inquiries' | 'demo' | 'holidays' | 'alerts'>('inquiries');
  
  // Inquiry state
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [inquiryFormData, setInquiryFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
  });
  const [inquirySearchTerm, setInquirySearchTerm] = useState('');

  // Demo student state
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    name: '',
    phoneNumber: '',
    place: '',
    batchId: '',
    durationType: 'days' as 'days' | 'fixed-date',
    durationDays: '4',
    startDate: new Date(),
    endDate: new Date(),
  });
  const [demoSearchTerm, setDemoSearchTerm] = useState('');
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Holiday state
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [holidayFormData, setHolidayFormData] = useState({
    selectedBatch: '',
    studentId: '',
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
  });
  const [holidaySearchTerm, setHolidaySearchTerm] = useState('');
  const [holidayStartDateOpen, setHolidayStartDateOpen] = useState(false);
  const [holidayEndDateOpen, setHolidayEndDateOpen] = useState(false);

  // Admit from inquiry dialog
  const [admitInquiryDialogOpen, setAdmitInquiryDialogOpen] = useState(false);
  const [selectedInquiryForAdmit, setSelectedInquiryForAdmit] = useState<string | null>(null);
  const [admitBatchIds, setAdmitBatchIds] = useState<string[]>([]);

  // Admit from demo dialog
  const [admitDemoDialogOpen, setAdmitDemoDialogOpen] = useState(false);
  const [selectedDemoForAdmit, setSelectedDemoForAdmit] = useState<string | null>(null);

  // Format date to string
  const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateDisplay = (date: string) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Check if date is expired
  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  // Get alerts
  const alerts = useMemo(() => {
    const expiredDemos = demoStudents.filter(ds => ds.status === 'active' && isExpired(ds.endDate));
    const expiredHolidays = holidays.filter(h => h.status === 'active' && isExpired(h.endDate));
    return {
      expiredDemos,
      expiredHolidays,
      total: expiredDemos.length + expiredHolidays.length,
    };
  }, [demoStudents, holidays]);

  // Handle add inquiry
  const handleAddInquiry = () => {
    if (!inquiryFormData.name || !inquiryFormData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    addInquiry({
      name: inquiryFormData.name,
      phoneNumber: inquiryFormData.phoneNumber,
      address: inquiryFormData.address,
      status: 'pending',
    });

    setInquiryFormData({ name: '', phoneNumber: '', address: '' });
    setInquiryDialogOpen(false);
    toast.success('Inquiry added successfully');
  };

  // Handle admit from inquiry
  const handleAdmitFromInquiry = () => {
    if (!selectedInquiryForAdmit || admitBatchIds.length === 0) {
      toast.error('Please select at least one batch');
      return;
    }

    const inquiry = inquiries.find(i => i.id === selectedInquiryForAdmit);
    if (!inquiry) return;

    const rollNo = getNextRollNumber();
    addStudent({
      name: inquiry.name,
      phoneNumbers: [inquiry.phoneNumber],
      rollNo,
      batchIds: admitBatchIds,
      address: inquiry.address,
      status: 'active',
    });

    updateInquiry(selectedInquiryForAdmit, { status: 'admitted' });
    
    setAdmitInquiryDialogOpen(false);
    setSelectedInquiryForAdmit(null);
    setAdmitBatchIds([]);
    toast.success(`Student admitted with Roll No: ${rollNo}`);
  };

  // Handle add demo student
  const handleAddDemoStudent = () => {
    if (!demoFormData.name || !demoFormData.phoneNumber || !demoFormData.batchId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = formatDateToString(demoFormData.startDate);
    let endDate: string;

    if (demoFormData.durationType === 'days') {
      const days = parseInt(demoFormData.durationDays) || 4;
      const end = new Date(demoFormData.startDate);
      end.setDate(end.getDate() + days - 1);
      endDate = formatDateToString(end);
    } else {
      endDate = formatDateToString(demoFormData.endDate);
    }

    addDemoStudent({
      name: demoFormData.name,
      phoneNumber: demoFormData.phoneNumber,
      place: demoFormData.place,
      batchId: demoFormData.batchId,
      durationType: demoFormData.durationType,
      durationDays: demoFormData.durationType === 'days' ? parseInt(demoFormData.durationDays) : undefined,
      startDate,
      endDate,
      status: 'active',
    });

    setDemoFormData({
      name: '',
      phoneNumber: '',
      place: '',
      batchId: '',
      durationType: 'days',
      durationDays: '4',
      startDate: new Date(),
      endDate: new Date(),
    });
    setDemoDialogOpen(false);
    toast.success('Demo student added successfully');
  };

  // Handle assign demo from inquiry
  const handleAssignDemoFromInquiry = (inquiryId: string) => {
    const inquiry = inquiries.find(i => i.id === inquiryId);
    if (!inquiry) return;

    // Pre-fill demo form with inquiry data
    setDemoFormData({
      name: inquiry.name,
      phoneNumber: inquiry.phoneNumber,
      place: inquiry.address,
      batchId: '',
      durationType: 'days',
      durationDays: '4',
      startDate: new Date(),
      endDate: new Date(),
    });
    setDemoDialogOpen(true);
  };

  // Handle admit from demo
  const handleAdmitFromDemo = () => {
    if (!selectedDemoForAdmit) return;

    const demo = demoStudents.find(ds => ds.id === selectedDemoForAdmit);
    if (!demo) return;

    const rollNo = getNextRollNumber();
    addStudent({
      name: demo.name,
      phoneNumbers: [demo.phoneNumber],
      rollNo,
      batchIds: [demo.batchId],
      address: demo.place,
      status: 'active',
    });

    updateDemoStudent(selectedDemoForAdmit, { status: 'admitted' });
    
    setAdmitDemoDialogOpen(false);
    setSelectedDemoForAdmit(null);
    toast.success(`Student admitted with Roll No: ${rollNo}`);
  };

  // Handle add holiday
  const handleAddHoliday = () => {
    if (!holidayFormData.studentId) {
      toast.error('Please select a student');
      return;
    }

    addHoliday({
      studentId: holidayFormData.studentId,
      startDate: formatDateToString(holidayFormData.startDate),
      endDate: formatDateToString(holidayFormData.endDate),
      reason: holidayFormData.reason,
      status: 'active',
    });

    setHolidayFormData({
      selectedBatch: '',
      studentId: '',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
    });
    setHolidayDialogOpen(false);
    toast.success('Holiday added successfully');
  };

  // Mark expired items
  const handleMarkDemoExpired = (id: string) => {
    updateDemoStudent(id, { status: 'expired' });
    toast.success('Demo class marked as expired');
  };

  const handleMarkHolidayCompleted = (id: string) => {
    updateHoliday(id, { status: 'completed' });
    toast.success('Holiday marked as completed');
  };

  // Filter data
  const filteredInquiries = inquiries.filter(i =>
    i.status !== 'admitted' && (
      i.name.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
      i.phoneNumber.includes(inquirySearchTerm)
    )
  );

  const filteredDemoStudents = demoStudents.filter(ds =>
    ds.status !== 'admitted' && (
      ds.name.toLowerCase().includes(demoSearchTerm.toLowerCase()) ||
      ds.phoneNumber.includes(demoSearchTerm)
    )
  );

  const filteredHolidays = holidays.filter(h => {
    const student = students.find(s => s.id === h.studentId);
    return student && (
      student.name.toLowerCase().includes(holidaySearchTerm.toLowerCase()) ||
      student.rollNo.includes(holidaySearchTerm)
    );
  });

  // Get students for selected batch in holiday form
  const holidayBatchStudents = holidayFormData.selectedBatch
    ? students.filter(s => s.batchIds.includes(holidayFormData.selectedBatch))
    : [];

  // Export data to Excel
  const exportDataToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, fileName);
  };

  // Export functions for each tab
  const handleExportInquiries = () => {
    const exportData = filteredInquiries.map(inquiry => ({
      Name: inquiry.name,
      'Phone Number': inquiry.phoneNumber,
      Address: inquiry.address || '',
      Status: inquiry.status,
      'Added Date': formatDateDisplay(inquiry.createdAt),
    }));
    
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    exportDataToExcel(exportData, `Inquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`Exported ${exportData.length} inquiries`);
  };

  const handleExportDemoStudents = () => {
    const exportData = filteredDemoStudents.map(demo => {
      const batch = batches.find(b => b.id === demo.batchId);
      return {
        Name: demo.name,
        'Phone Number': demo.phoneNumber,
        Place: demo.place,
        Batch: batch?.name || '',
        'Start Date': formatDateDisplay(demo.startDate),
        'End Date': formatDateDisplay(demo.endDate),
        Duration: demo.durationType === 'days' ? `${demo.durationDays} days` : 'Fixed date',
        Status: demo.status,
        Expired: isExpired(demo.endDate) && demo.status === 'active' ? 'Yes' : 'No',
      };
    });
    
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    exportDataToExcel(exportData, `DemoClasses_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`Exported ${exportData.length} demo students`);
  };

  const handleExportHolidays = () => {
    const exportData = filteredHolidays.map(holiday => {
      const student = students.find(s => s.id === holiday.studentId);
      return {
        'Student Name': student?.name || '',
        'Roll Number': student?.rollNo || '',
        'Start Date': formatDateDisplay(holiday.startDate),
        'End Date': formatDateDisplay(holiday.endDate),
        Reason: holiday.reason || '',
        Status: holiday.status,
        Expired: isExpired(holiday.endDate) && holiday.status === 'active' ? 'Yes' : 'No',
      };
    });
    
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    exportDataToExcel(exportData, `Holidays_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`Exported ${exportData.length} holidays`);
  };

  const handleExportAlerts = () => {
    const demoData = alerts.expiredDemos.map(demo => {
      const batch = batches.find(b => b.id === demo.batchId);
      return {
        Type: 'Demo Class',
        Name: demo.name,
        'Phone Number': demo.phoneNumber,
        Batch: batch?.name || '',
        'End Date': formatDateDisplay(demo.endDate),
        Status: 'Expired',
      };
    });

    const holidayData = alerts.expiredHolidays.map(holiday => {
      const student = students.find(s => s.id === holiday.studentId);
      return {
        Type: 'Holiday',
        Name: student?.name || '',
        'Roll Number': student?.rollNo || '',
        'End Date': formatDateDisplay(holiday.endDate),
        Reason: holiday.reason || '',
        Status: 'Expired',
      };
    });

    const exportData = [...demoData, ...holidayData];
    
    if (exportData.length === 0) {
      toast.error('No alerts to export');
      return;
    }
    
    exportDataToExcel(exportData, `Alerts_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`Exported ${exportData.length} alerts`);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-gray-900">Inquiry Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inquiries">
            Inquiries
            {inquiries.filter(i => i.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {inquiries.filter(i => i.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="demo">
            Demo Classes
            {demoStudents.filter(ds => ds.status === 'active').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {demoStudents.filter(ds => ds.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="holidays">
            Holidays
            {holidays.filter(h => h.status === 'active').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {holidays.filter(h => h.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts.total > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inquiries by name or phone..."
                value={inquirySearchTerm}
                onChange={(e) => setInquirySearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setInquiryDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Inquiry
            </Button>
            <Button onClick={handleExportInquiries}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInquiries.map((inquiry) => (
              <Card key={inquiry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                      <CardDescription>{inquiry.phoneNumber}</CardDescription>
                    </div>
                    <Badge variant={inquiry.status === 'pending' ? 'default' : 'secondary'}>
                      {inquiry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{inquiry.address || 'No address provided'}</p>
                  <p className="text-xs text-gray-400 mb-4">Added: {formatDateDisplay(inquiry.createdAt)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInquiryForAdmit(inquiry.id);
                        setAdmitInquiryDialogOpen(true);
                      }}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Admit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignDemoFromInquiry(inquiry.id)}
                    >
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Demo
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateInquiry(inquiry.id, { status: 'rejected' });
                        toast.success('Inquiry rejected');
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        deleteInquiry(inquiry.id);
                        toast.success('Inquiry deleted');
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInquiries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No inquiries found
            </div>
          )}
        </TabsContent>

        {/* Demo Classes Tab */}
        <TabsContent value="demo" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search demo students by name or phone..."
                value={demoSearchTerm}
                onChange={(e) => setDemoSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setDemoDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Demo Student
            </Button>
            <Button onClick={handleExportDemoStudents}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDemoStudents.map((demo) => {
              const batch = batches.find(b => b.id === demo.batchId);
              const expired = isExpired(demo.endDate);
              
              return (
                <Card key={demo.id} className={expired ? 'border-orange-300 bg-orange-50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{demo.name}</CardTitle>
                        <CardDescription>{demo.phoneNumber}</CardDescription>
                      </div>
                      <Badge variant={demo.status === 'active' ? (expired ? 'destructive' : 'default') : 'secondary'}>
                        {expired && demo.status === 'active' ? 'Expired' : demo.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm"><span className="text-gray-500">Place:</span> {demo.place}</p>
                      <p className="text-sm"><span className="text-gray-500">Batch:</span> {batch?.name}</p>
                      <p className="text-sm"><span className="text-gray-500">Period:</span> {formatDateDisplay(demo.startDate)} - {formatDateDisplay(demo.endDate)}</p>
                      {demo.durationType === 'days' && (
                        <p className="text-sm"><span className="text-gray-500">Duration:</span> {demo.durationDays} days</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDemoForAdmit(demo.id);
                          setAdmitDemoDialogOpen(true);
                        }}
                        disabled={demo.status !== 'active'}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Admit
                      </Button>
                      {expired && demo.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkDemoExpired(demo.id)}
                        >
                          Mark Expired
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteDemoStudent(demo.id);
                          toast.success('Demo student deleted');
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDemoStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No demo students found
            </div>
          )}
        </TabsContent>

        {/* Holidays Tab */}
        <TabsContent value="holidays" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name or roll number..."
                value={holidaySearchTerm}
                onChange={(e) => setHolidaySearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setHolidayDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </Button>
            <Button onClick={handleExportHolidays}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHolidays.map((holiday) => {
              const student = students.find(s => s.id === holiday.studentId);
              const expired = isExpired(holiday.endDate);
              
              if (!student) return null;
              
              return (
                <Card key={holiday.id} className={expired ? 'border-orange-300 bg-orange-50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>Roll No: {student.rollNo}</CardDescription>
                      </div>
                      <Badge variant={holiday.status === 'active' ? (expired ? 'destructive' : 'default') : 'secondary'}>
                        {expired && holiday.status === 'active' ? 'Expired' : holiday.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm"><span className="text-gray-500">Period:</span> {formatDateDisplay(holiday.startDate)} - {formatDateDisplay(holiday.endDate)}</p>
                      {holiday.reason && (
                        <p className="text-sm"><span className="text-gray-500">Reason:</span> {holiday.reason}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {expired && holiday.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkHolidayCompleted(holiday.id)}
                        >
                          Mark Completed
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteHoliday(holiday.id);
                          toast.success('Holiday deleted');
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredHolidays.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No holidays found
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.total > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleExportAlerts}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          )}
          
          {alerts.total === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No alerts at this time
            </div>
          ) : (
            <>
              {alerts.expiredDemos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Expired Demo Classes ({alerts.expiredDemos.length})
                    </CardTitle>
                    <CardDescription>
                      The following demo class periods have ended
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.expiredDemos.map((demo) => {
                        const batch = batches.find(b => b.id === demo.batchId);
                        return (
                          <div key={demo.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div>
                              <p className="font-medium">{demo.name}</p>
                              <p className="text-sm text-gray-600">{demo.phoneNumber} • {batch?.name}</p>
                              <p className="text-xs text-gray-500">Ended: {formatDateDisplay(demo.endDate)}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedDemoForAdmit(demo.id);
                                  setAdmitDemoDialogOpen(true);
                                }}
                              >
                                Admit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkDemoExpired(demo.id)}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {alerts.expiredHolidays.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Expired Holidays ({alerts.expiredHolidays.length})
                    </CardTitle>
                    <CardDescription>
                      The following student holidays have ended
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.expiredHolidays.map((holiday) => {
                        const student = students.find(s => s.id === holiday.studentId);
                        if (!student) return null;
                        
                        return (
                          <div key={holiday.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div>
                              <p className="font-medium">{student.name} (Roll: {student.rollNo})</p>
                              {holiday.reason && <p className="text-sm text-gray-600">{holiday.reason}</p>}
                              <p className="text-xs text-gray-500">Ended: {formatDateDisplay(holiday.endDate)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleMarkHolidayCompleted(holiday.id)}
                            >
                              Mark Completed
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inquiry</DialogTitle>
            <DialogDescription>
              Add a new inquiry to follow up later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inquiry-name">Name *</Label>
              <Input
                id="inquiry-name"
                value={inquiryFormData.name}
                onChange={(e) => setInquiryFormData({ ...inquiryFormData, name: e.target.value })}
                placeholder="Student name"
              />
            </div>
            <div>
              <Label htmlFor="inquiry-phone">Phone Number *</Label>
              <Input
                id="inquiry-phone"
                value={inquiryFormData.phoneNumber}
                onChange={(e) => setInquiryFormData({ ...inquiryFormData, phoneNumber: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="inquiry-address">Address</Label>
              <Textarea
                id="inquiry-address"
                value={inquiryFormData.address}
                onChange={(e) => setInquiryFormData({ ...inquiryFormData, address: e.target.value })}
                placeholder="Address"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInquiryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInquiry}>Add Inquiry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admit from Inquiry Dialog */}
      <Dialog open={admitInquiryDialogOpen} onOpenChange={setAdmitInquiryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admit Student</DialogTitle>
            <DialogDescription>
              Select batch(es) to admit this student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Batches *</Label>
              <div className="space-y-2 mt-2">
                {batches.map((batch) => (
                  <label key={batch.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={admitBatchIds.includes(batch.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAdmitBatchIds([...admitBatchIds, batch.id]);
                        } else {
                          setAdmitBatchIds(admitBatchIds.filter(id => id !== batch.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span>{batch.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdmitInquiryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdmitFromInquiry}>Admit Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Demo Student Dialog */}
      <Dialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Demo Student</DialogTitle>
            <DialogDescription>
              Add a student for demo class
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="demo-name">Name *</Label>
              <Input
                id="demo-name"
                value={demoFormData.name}
                onChange={(e) => setDemoFormData({ ...demoFormData, name: e.target.value })}
                placeholder="Student name"
              />
            </div>
            <div>
              <Label htmlFor="demo-phone">Phone Number *</Label>
              <Input
                id="demo-phone"
                value={demoFormData.phoneNumber}
                onChange={(e) => setDemoFormData({ ...demoFormData, phoneNumber: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="demo-place">Place</Label>
              <Input
                id="demo-place"
                value={demoFormData.place}
                onChange={(e) => setDemoFormData({ ...demoFormData, place: e.target.value })}
                placeholder="Place/Address"
              />
            </div>
            <div>
              <Label htmlFor="demo-batch">Batch *</Label>
              <Select value={demoFormData.batchId} onValueChange={(value) => setDemoFormData({ ...demoFormData, batchId: value })}>
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
            <div>
              <Label>Duration Type</Label>
              <Select value={demoFormData.durationType} onValueChange={(value: any) => setDemoFormData({ ...demoFormData, durationType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Number of Days</SelectItem>
                  <SelectItem value="fixed-date">Fixed End Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(formatDateToString(demoFormData.startDate))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={demoFormData.startDate}
                    onSelect={(date) => {
                      if (date) {
                        setDemoFormData({ ...demoFormData, startDate: date });
                        setStartDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {demoFormData.durationType === 'days' ? (
              <div>
                <Label htmlFor="demo-days">Number of Days</Label>
                <Input
                  id="demo-days"
                  type="number"
                  value={demoFormData.durationDays}
                  onChange={(e) => setDemoFormData({ ...demoFormData, durationDays: e.target.value })}
                  placeholder="e.g., 4"
                  min="1"
                />
              </div>
            ) : (
              <div>
                <Label>End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateDisplay(formatDateToString(demoFormData.endDate))}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={demoFormData.endDate}
                      onSelect={(date) => {
                        if (date) {
                          setDemoFormData({ ...demoFormData, endDate: date });
                          setEndDateOpen(false);
                        }
                      }}
                      disabled={(date) => date < demoFormData.startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDemoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDemoStudent}>Add Demo Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admit from Demo Dialog */}
      <Dialog open={admitDemoDialogOpen} onOpenChange={setAdmitDemoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admit Demo Student</DialogTitle>
            <DialogDescription>
              Confirm admission of this demo student
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This student will be admitted to their demo batch and assigned a roll number.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdmitDemoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdmitFromDemo}>Confirm Admission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Holiday Dialog */}
      <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Grant Holiday</DialogTitle>
            <DialogDescription>
              Grant a holiday period to a student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Batch *</Label>
              <Select value={holidayFormData.selectedBatch} onValueChange={(value) => setHolidayFormData({ ...holidayFormData, selectedBatch: value, studentId: '' })}>
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
            {holidayFormData.selectedBatch && (
              <div>
                <Label>Select Student *</Label>
                <Select value={holidayFormData.studentId} onValueChange={(value) => setHolidayFormData({ ...holidayFormData, studentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {holidayBatchStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.rollNo} - {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Start Date</Label>
              <Popover open={holidayStartDateOpen} onOpenChange={setHolidayStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(formatDateToString(holidayFormData.startDate))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={holidayFormData.startDate}
                    onSelect={(date) => {
                      if (date) {
                        setHolidayFormData({ ...holidayFormData, startDate: date });
                        setHolidayStartDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover open={holidayEndDateOpen} onOpenChange={setHolidayEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(formatDateToString(holidayFormData.endDate))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={holidayFormData.endDate}
                    onSelect={(date) => {
                      if (date) {
                        setHolidayFormData({ ...holidayFormData, endDate: date });
                        setHolidayEndDateOpen(false);
                      }
                    }}
                    disabled={(date) => date < holidayFormData.startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="holiday-reason">Reason (Optional)</Label>
              <Textarea
                id="holiday-reason"
                value={holidayFormData.reason}
                onChange={(e) => setHolidayFormData({ ...holidayFormData, reason: e.target.value })}
                placeholder="Reason for holiday"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHolidayDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHoliday}>Grant Holiday</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}