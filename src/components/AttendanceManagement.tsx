import { useState, useEffect, useRef } from 'react';
import { CalendarIcon, Lock, Unlock, Save, Download, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';
import { cn } from './ui/utils';

interface AttendanceManagementProps {
  onInvestigate?: () => void;
}

export default function AttendanceManagement({ onInvestigate }: AttendanceManagementProps) {
  const { students, batches, attendanceRecords, addAttendanceRecord, bulkAddAttendanceRecords } = useCRMData();
  
  // Core state
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [localChanges, setLocalChanges] = useState<Record<string, 'present' | 'absent'>>({});
  
  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'day' | 'month' | 'year' | 'custom'>('day');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Track the last loaded combination to prevent unnecessary reloads
  const lastLoadRef = useRef<string>('');

  // Format date to string
  const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateString = formatDateToString(selectedDate);

  // Check if selected date is today
  const isToday = () => {
    const today = new Date();
    return formatDateToString(today) === selectedDateString;
  };

  // Check if date is in the past
  const isPastDate = !isToday();

  // Determine if attendance is locked
  const isLocked = isPastDate && !isEditMode;

  // Load attendance when date or batch changes
  useEffect(() => {
    const loadKey = `${selectedDateString}-${selectedBatch}`;
    
    // Skip if same combination as before and we're in edit mode
    if (loadKey === lastLoadRef.current && isEditMode) {
      return;
    }
    
    // Update the ref
    lastLoadRef.current = loadKey;
    
    // Clear local changes when switching date/batch
    setLocalChanges({});
    
    // Exit edit mode when switching
    setIsEditMode(false);
  }, [selectedDateString, selectedBatch]);

  // Get students for selected batch
  const batchStudents = selectedBatch 
    ? students.filter(s => s.batchIds.includes(selectedBatch))
    : [];

  // Get attendance status for a student
  const getAttendanceStatus = (studentId: string): 'present' | 'absent' | undefined => {
    // Check local changes first (for unsaved edits)
    if (localChanges[studentId]) {
      return localChanges[studentId];
    }
    
    // Then check saved records
    const record = attendanceRecords.find(
      r => r.studentId === studentId && r.date === selectedDateString
    );
    
    return record?.status;
  };

  // Handle marking attendance
  const handleAttendanceMark = (studentId: string, status: 'present' | 'absent') => {
    if (!selectedBatch) {
      toast.error('Please select a batch first');
      return;
    }

    if (isLocked) {
      toast.error('Please unlock to edit attendance');
      return;
    }

    if (isToday()) {
      // For today's date, save immediately
      addAttendanceRecord({
        studentId,
        date: selectedDateString,
        status,
      });
      
      toast.success(`Marked ${status}`, { duration: 1500 });
    } else {
      // For past dates in edit mode, store locally
      setLocalChanges(prev => ({
        ...prev,
        [studentId]: status,
      }));
    }
  };

  // Handle unlock (enable editing for past dates)
  const handleUnlock = () => {
    setIsEditMode(true);
    toast.info('Attendance unlocked for editing');
  };

  // Handle save (save all local changes)
  const handleSave = () => {
    if (!selectedBatch) {
      toast.error('Please select a batch first');
      return;
    }

    if (Object.keys(localChanges).length === 0) {
      toast.error('No changes to save');
      return;
    }

    // Prepare all records for bulk save
    const recordsToSave = Object.entries(localChanges).map(([studentId, status]) => ({
      studentId,
      date: selectedDateString,
      status,
    }));

    // Save all changes in one batch operation
    bulkAddAttendanceRecords(recordsToSave);

    // Keep localChanges visible but exit edit mode
    // They'll be cleared when switching date/batch in useEffect
    setIsEditMode(false);
    
    const changeCount = Object.keys(localChanges).length;
    toast.success(`Saved attendance for ${changeCount} student${changeCount > 1 ? 's' : ''}`);
  };

  // Handle batch change
  const handleBatchChange = (batchId: string) => {
    setSelectedBatch(batchId);
    setLocalChanges({});
    setIsEditMode(false);
  };

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setLocalChanges({});
      setIsEditMode(false);
      setCalendarOpen(false);
    }
  };

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    const suffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${month} ${day}${suffix(day)}, ${year}`;
  };

  // Get date range for export
  const getDateRange = () => {
    let startDate: Date;
    let endDate: Date;

    switch (exportType) {
      case 'day':
        startDate = selectedDate;
        endDate = selectedDate;
        break;
      case 'month':
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
        endDate = new Date(selectedDate.getFullYear(), 11, 31);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          return null;
        }
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = selectedDate;
        endDate = selectedDate;
    }

    return { startDate, endDate };
  };

  // Handle export confirmation
  const handleExportConfirm = () => {
    if (!selectedBatch) {
      toast.error('Please select a batch first');
      return;
    }

    const dateRange = getDateRange();
    if (!dateRange) {
      toast.error('Please select valid custom dates');
      return;
    }

    const { startDate, endDate } = dateRange;

    // Prepare CSV data
    const csvRows = [];
    csvRows.push(['Date', 'Roll No', 'Student Name', 'Attendance', 'Batch'].join(','));

    const batch = batches.find(b => b.id === selectedBatch);
    
    // Generate all dates in the range
    const currentDate = new Date(startDate);
    const dates: string[] = [];
    
    while (currentDate <= endDate) {
      dates.push(formatDateToString(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // For each student, add rows for each date
    batchStudents.forEach(student => {
      dates.forEach(date => {
        const record = attendanceRecords.find(
          r => r.studentId === student.id && r.date === date
        );
        const status = record ? record.status.toUpperCase() : 'NOT MARKED';
        
        csvRows.push([
          date,
          student.rollNo,
          student.name,
          status,
          batch?.name || '',
        ].join(','));
      });
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const filename = exportType === 'day' 
      ? `attendance_${formatDateToString(startDate)}_${batch?.name || 'batch'}.csv`
      : `attendance_${formatDateToString(startDate)}_to_${formatDateToString(endDate)}_${batch?.name || 'batch'}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportModalOpen(false);
    toast.success('Attendance data exported');
  };

  // Handle export button click
  const handleExport = () => {
    if (!selectedBatch) {
      toast.error('Please select a batch first');
      return;
    }
    setExportModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header with Date Picker and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-gray-900">Attendance</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left min-w-[200px]",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? formatDateDisplay(selectedDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {onInvestigate && (
            <Button onClick={onInvestigate} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Investigate
            </Button>
          )}

          {isPastDate && isLocked && (
            <Button onClick={handleUnlock} variant="outline">
              <Unlock className="w-4 h-4 mr-2" />
              Unlock
            </Button>
          )}

          {isPastDate && isEditMode && (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Attendance</DialogTitle>
            <DialogDescription>
              Select the duration for which you want to export attendance data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Export Duration</Label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">One Day</SelectItem>
                  <SelectItem value="month">One Month</SelectItem>
                  <SelectItem value="year">One Year</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportType === 'day' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Export attendance for: <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
                </p>
              </div>
            )}

            {exportType === 'month' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Export attendance for the entire month of: <span className="font-medium">
                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                </p>
              </div>
            )}

            {exportType === 'year' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Export attendance for the entire year: <span className="font-medium">
                    {selectedDate.getFullYear()}
                  </span>
                </p>
              </div>
            )}

            {exportType === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? formatDateDisplay(customStartDate) : <span>Pick start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={(date) => {
                          setCustomStartDate(date);
                          setStartDateOpen(false);
                        }}
                        disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? formatDateDisplay(customEndDate) : <span>Pick end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={(date) => {
                          setCustomEndDate(date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) => {
                          if (customStartDate) {
                            return date < customStartDate || date > new Date() || date < new Date('2000-01-01');
                          }
                          return date > new Date() || date < new Date('2000-01-01');
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {customStartDate && customEndDate && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Export attendance from <span className="font-medium">{formatDateDisplay(customStartDate)}</span> to <span className="font-medium">{formatDateDisplay(customEndDate)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setExportModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportConfirm}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lock Status Indicator */}
      {isPastDate && (
        <div className={cn(
          "mb-4 p-3 rounded-lg flex items-center gap-2",
          isLocked ? "bg-yellow-50 text-yellow-800" : "bg-blue-50 text-blue-800"
        )}>
          {isLocked ? (
            <>
              <Lock className="w-4 h-4" />
              <span className="text-sm">This attendance is locked. Click "Unlock" to edit.</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span className="text-sm">Editing mode active. Make changes and click "Save" when done.</span>
            </>
          )}
        </div>
      )}

      {/* Batch Selection */}
      <div className="mb-6">
        <Select value={selectedBatch} onValueChange={handleBatchChange}>
          <SelectTrigger className="max-w-xs">
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

      {/* Students List */}
      {selectedBatch && batchStudents.length > 0 && (
        <div className="space-y-1">
          <div className="text-gray-500 text-sm mb-3 pb-2 border-b">Student</div>
          {batchStudents.map((student) => {
            const currentStatus = getAttendanceStatus(student.id);
            const isDisabled = isLocked;
            
            return (
              <div
                key={student.id}
                className={cn(
                  "flex items-center justify-between py-3 border-b border-gray-100 px-3 rounded-lg",
                  !isDisabled && "hover:bg-gray-50",
                  isDisabled && "opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-900">{student.name}</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAttendanceMark(student.id, 'present')}
                    disabled={isDisabled}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      currentStatus === 'present'
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-400",
                      !isDisabled && "hover:bg-green-50 hover:text-green-600",
                      isDisabled && "cursor-not-allowed"
                    )}
                  >
                    P
                  </button>
                  <button
                    onClick={() => handleAttendanceMark(student.id, 'absent')}
                    disabled={isDisabled}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      currentStatus === 'absent'
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-400",
                      !isDisabled && "hover:bg-red-50 hover:text-red-600",
                      isDisabled && "cursor-not-allowed"
                    )}
                  >
                    A
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBatch && batchStudents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No students in this batch.
        </div>
      )}

      {!selectedBatch && (
        <div className="text-center py-12 text-gray-500">
          Please select a batch to mark attendance.
        </div>
      )}
    </div>
  );
}