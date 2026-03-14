import { useState, useEffect } from 'react';

export interface Batch {
  id: string;
  name: string;
  description: string;
}

export interface Student {
  id: string;
  name: string;
  phoneNumbers: string[];
  rollNo: string;
  batchIds: string[];
  address: string;
  status: 'active' | 'left'; // New field for student status
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  month: string;
  status: 'paid' | 'due';
  paymentDate: string;
}

export interface FeeReceipt {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  batchId: string;
  batchName: string;
  batchPrice: number;
  amountPaid: number;
  dueAmount: number;
  date: string;
  notes?: string;
}

export interface ReceiptTemplate {
  businessName: string;
  address: string;
  logo?: string; // base64 encoded logo
  phone?: string;
  email?: string;
  layout: 'left-aligned' | 'centered'; // Template layout type
}

interface TrashItem {
  id: string;
  type: 'student' | 'batch';
  data: any;
  deletedDate: string;
  relatedData?: {
    attendance?: AttendanceRecord[];
    fees?: FeeRecord[];
  };
}

interface Reminder {
  id: string;
  title: string;
  date: string;
  time?: string;
  urgency: 'low' | 'moderate' | 'high';
  isRead: boolean;
  createdAt: string;
}

export type UserRole = 'admin' | 'teacher';

export interface Permission {
  dashboard: boolean;
  students: boolean;
  batches: boolean;
  attendance: boolean;
  billing: boolean;
  inquiry: boolean;
  management: boolean;
  settings: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  passcode?: string; // For teachers
  permissions: Permission;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}

export interface Inquiry {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  status: 'pending' | 'admitted' | 'rejected';
}

export interface DemoStudent {
  id: string;
  name: string;
  phoneNumber: string;
  place: string;
  batchId: string;
  durationType: 'days' | 'fixed-date';
  durationDays?: number; // for days type
  startDate: string;
  endDate: string; // calculated or fixed
  status: 'active' | 'admitted' | 'expired';
  createdAt: string;
}

export interface Holiday {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface LedgerAccount {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  description: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  BATCHES: 'crm_batches',
  STUDENTS: 'crm_students',
  ATTENDANCE: 'crm_attendance',
  FEES: 'crm_fees',
  TRASH: 'crm_trash',
  REMINDERS: 'crm_reminders',
  RECEIPTS: 'crm_receipts',
  RECEIPT_TEMPLATE: 'crm_receipt_template',
  USERS: 'crm_users',
  AUTH_STATE: 'crm_auth_state',
  INQUIRIES: 'crm_inquiries',
  DEMO_STUDENTS: 'crm_demo_students',
  HOLIDAYS: 'crm_holidays',
  LEDGER_ACCOUNTS: 'crm_ledger_accounts',
  LEDGER_ENTRIES: 'crm_ledger_entries',
};

// Initialize with some sample data
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.BATCHES)) {
    const sampleBatches: Batch[] = [
      {
        id: '1',
        name: 'C++ Study Batch',
        description: 'Advanced C++ programming course',
      },
      {
        id: '2',
        name: 'Python Batch',
        description: 'Python for beginners and intermediate learners',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(sampleBatches));
  }

  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.FEES)) {
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TRASH)) {
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.RECEIPTS)) {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.RECEIPT_TEMPLATE)) {
    const defaultTemplate: ReceiptTemplate = {
      businessName: localStorage.getItem('crm_org_name') || 'Coaching CRM',
      address: '',
      layout: 'left-aligned',
    };
    localStorage.setItem(STORAGE_KEYS.RECEIPT_TEMPLATE, JSON.stringify(defaultTemplate));
  }

  if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.DEMO_STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.DEMO_STUDENTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.HOLIDAYS)) {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.LEDGER_ACCOUNTS)) {
    localStorage.setItem(STORAGE_KEYS.LEDGER_ACCOUNTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES)) {
    localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    // Create default admin user
    const defaultAdmin: User = {
      id: '1',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      permissions: {
        dashboard: true,
        students: true,
        batches: true,
        attendance: true,
        billing: true,
        inquiry: true,
        management: true,
        settings: true,
      },
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultAdmin]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUTH_STATE)) {
    const defaultAuthState: AuthState = {
      isAuthenticated: false,
      currentUser: null,
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(defaultAuthState));
  }
};

export function useCRMData() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [receiptTemplate, setReceiptTemplate] = useState<ReceiptTemplate | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, currentUser: null });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [demoStudents, setDemoStudents] = useState<DemoStudent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  const loadData = () => {
    const batchesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.BATCHES) || '[]');
    let studentsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const attendanceData = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    const feesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEES) || '[]');
    const trashData = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRASH) || '[]');
    const remindersData = JSON.parse(localStorage.getItem(STORAGE_KEYS.REMINDERS) || '[]');
    const receiptsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECEIPTS) || '[]');
    const templateData = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECEIPT_TEMPLATE) || 'null');
    const usersData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const authData = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_STATE) || '{"isAuthenticated":false,"currentUser":null}');
    const inquiriesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
    const demoStudentsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_STUDENTS) || '[]');
    const holidaysData = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOLIDAYS) || '[]');
    const ledgerAccountsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEDGER_ACCOUNTS) || '[]');
    const ledgerEntriesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES) || '[]');

    // Migrate old student data format to new format
    studentsData = studentsData.map((student: any) => {
      // Convert old single batchId to array of batchIds
      if (student.batchId && !student.batchIds) {
        return {
          ...student,
          batchIds: [student.batchId],
          phoneNumbers: student.phone ? [student.phone] : (student.phoneNumbers || []),
          address: student.address || '',
          status: student.status || 'active',
        };
      }
      // Ensure phoneNumbers is an array
      if (!student.phoneNumbers && student.phone) {
        return {
          ...student,
          phoneNumbers: [student.phone],
          batchIds: student.batchIds || [],
          address: student.address || '',
          status: student.status || 'active',
        };
      }
      // Ensure batchIds exists
      if (!student.batchIds) {
        return {
          ...student,
          batchIds: [],
          phoneNumbers: student.phoneNumbers || [],
          address: student.address || '',
          status: student.status || 'active',
        };
      }
      // Ensure address exists
      if (!student.address) {
        return {
          ...student,
          address: '',
          status: student.status || 'active',
        };
      }
      // Ensure status exists
      if (!student.status) {
        return {
          ...student,
          status: 'active',
        };
      }
      return student;
    });

    // Save migrated data
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(studentsData));

    setBatches(batchesData);
    setStudents(studentsData);
    setAttendanceRecords(attendanceData);
    setFeeRecords(feesData);
    setTrash(trashData);
    setReminders(remindersData);
    setReceipts(receiptsData);
    setReceiptTemplate(templateData);
    setUsers(usersData);
    setAuthState(authData);
    setInquiries(inquiriesData);
    setDemoStudents(demoStudentsData);
    setHolidays(holidaysData);
    setLedgerAccounts(ledgerAccountsData);
    setLedgerEntries(ledgerEntriesData);
  };

  // Get next available roll number
  const getNextRollNumber = (): string => {
    if (students.length === 0) return '1';
    
    // Get all roll numbers and convert to numbers
    const rollNumbers = students
      .map(s => parseInt(s.rollNo))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    
    if (rollNumbers.length === 0) return '1';
    
    // Find the highest number and add 1
    const maxRoll = Math.max(...rollNumbers);
    return (maxRoll + 1).toString();
  };

  // Shuffle roll numbers after deletion
  const shuffleRollNumbers = (deletedRollNo: string) => {
    const deletedRoll = parseInt(deletedRollNo);
    if (isNaN(deletedRoll)) return;

    const updated = students.map(student => {
      const currentRoll = parseInt(student.rollNo);
      if (!isNaN(currentRoll) && currentRoll > deletedRoll) {
        return { ...student, rollNo: (currentRoll - 1).toString() };
      }
      return student;
    });

    setStudents(updated);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  };

  // Batch operations
  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch = { ...batch, id: Date.now().toString() };
    const updated = [...batches, newBatch];
    setBatches(updated);
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(updated));
  };

  const updateBatch = (id: string, batch: Omit<Batch, 'id'>) => {
    const updated = batches.map(b => (b.id === id ? { ...batch, id } : b));
    setBatches(updated);
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(updated));
  };

  const deleteBatch = (id: string) => {
    // Move to trash instead of permanent deletion
    const batchToDelete = batches.find(b => b.id === id);
    if (batchToDelete) {
      const trashItem: TrashItem = {
        id: Date.now().toString(),
        type: 'batch',
        data: batchToDelete,
        deletedDate: new Date().toISOString(),
      };
      
      const updatedTrash = [...trash, trashItem];
      setTrash(updatedTrash);
      localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(updatedTrash));
    }

    const updated = batches.filter(b => b.id !== id);
    setBatches(updated);
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(updated));
  };

  // Student operations
  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: Date.now().toString(), status: 'active' as const };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  };

  const updateStudent = (id: string, student: Omit<Student, 'id'>) => {
    const updated = students.map(s => (s.id === id ? { ...student, id } : s));
    setStudents(updated);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  };

  const markStudentAsLeft = (id: string) => {
    const updated = students.map(s => 
      s.id === id ? { ...s, status: 'left' as const } : s
    );
    setStudents(updated);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  };

  const reAdmitStudent = (id: string) => {
    const updated = students.map(s => 
      s.id === id ? { ...s, status: 'active' as const } : s
    );
    setStudents(updated);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  };

  const deleteStudent = (id: string) => {
    // Move to trash instead of permanent deletion
    const studentToDelete = students.find(s => s.id === id);
    if (studentToDelete) {
      // Get related attendance and fee records
      const relatedAttendance = attendanceRecords.filter(a => a.studentId === id);
      const relatedFees = feeRecords.filter(f => f.studentId === id);

      const trashItem: TrashItem = {
        id: Date.now().toString(),
        type: 'student',
        data: studentToDelete,
        deletedDate: new Date().toISOString(),
        relatedData: {
          attendance: relatedAttendance,
          fees: relatedFees,
        },
      };
      
      const updatedTrash = [...trash, trashItem];
      setTrash(updatedTrash);
      localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(updatedTrash));

      // Delete related records
      const updatedAttendance = attendanceRecords.filter(a => a.studentId !== id);
      setAttendanceRecords(updatedAttendance);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedAttendance));

      const updatedFees = feeRecords.filter(f => f.studentId !== id);
      setFeeRecords(updatedFees);
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(updatedFees));

      // Shuffle roll numbers
      shuffleRollNumbers(studentToDelete.rollNo);
    }

    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  };

  const removeStudentFromBatch = (studentId: string, batchId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const updatedBatchIds = student.batchIds.filter(id => id !== batchId);
      updateStudent(studentId, { ...student, batchIds: updatedBatchIds });
    }
  };

  const transferStudent = (studentId: string, fromBatchId: string, toBatchId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const updatedBatchIds = student.batchIds.map(id => id === fromBatchId ? toBatchId : id);
      updateStudent(studentId, { ...student, batchIds: updatedBatchIds });
    }
  };

  // Attendance operations
  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    // Check if record already exists for this student and date
    const existingIndex = attendanceRecords.findIndex(
      r => r.studentId === record.studentId && r.date === record.date
    );
    
    let updated;
    if (existingIndex !== -1) {
      // Update existing record
      updated = [...attendanceRecords];
      updated[existingIndex] = { ...record, id: updated[existingIndex].id };
    } else {
      // Add new record
      const newRecord = { ...record, id: Date.now().toString() + Math.random() };
      updated = [...attendanceRecords, newRecord];
    }
    
    setAttendanceRecords(updated);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
  };

  // Bulk add/update attendance records (prevents state conflicts)
  const bulkAddAttendanceRecords = (records: Omit<AttendanceRecord, 'id'>[]) => {
    let updated = [...attendanceRecords];
    
    records.forEach(record => {
      const existingIndex = updated.findIndex(
        r => r.studentId === record.studentId && r.date === record.date
      );
      
      if (existingIndex !== -1) {
        // Update existing record
        updated[existingIndex] = { ...record, id: updated[existingIndex].id };
      } else {
        // Add new record
        const newRecord = { ...record, id: Date.now().toString() + Math.random() };
        updated.push(newRecord);
      }
    });
    
    setAttendanceRecords(updated);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
  };

  // Fee operations
  const addFeeRecord = (record: Omit<FeeRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() };
    const updated = [...feeRecords, newRecord];
    setFeeRecords(updated);
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(updated));
  };

  // Trash operations
  const restoreFromTrash = (trashItemId: string) => {
    const itemToRestore = trash.find(t => t.id === trashItemId);
    if (!itemToRestore) return;

    if (itemToRestore.type === 'student') {
      // Restore student
      const student = itemToRestore.data as Student;
      const updated = [...students, student];
      setStudents(updated);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));

      // Restore related data
      if (itemToRestore.relatedData?.attendance) {
        const updatedAttendance = [...attendanceRecords, ...itemToRestore.relatedData.attendance];
        setAttendanceRecords(updatedAttendance);
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedAttendance));
      }
      if (itemToRestore.relatedData?.fees) {
        const updatedFees = [...feeRecords, ...itemToRestore.relatedData.fees];
        setFeeRecords(updatedFees);
        localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(updatedFees));
      }
    } else if (itemToRestore.type === 'batch') {
      // Restore batch
      const batch = itemToRestore.data as Batch;
      const updated = [...batches, batch];
      setBatches(updated);
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(updated));
    }

    // Remove from trash
    const updatedTrash = trash.filter(t => t.id !== trashItemId);
    setTrash(updatedTrash);
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(updatedTrash));
  };

  const permanentlyDeleteFromTrash = (trashItemId: string) => {
    const updatedTrash = trash.filter(t => t.id !== trashItemId);
    setTrash(updatedTrash);
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(updatedTrash));
  };

  const emptyTrash = () => {
    setTrash([]);
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify([]));
  };

  // Reminder operations
  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt' | 'isRead'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  };

  const markReminderAsRead = (id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, isRead: true } : r
    );
    setReminders(updated);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  };

  // Receipt operations
  const addReceipt = (receipt: Omit<FeeReceipt, 'id'>) => {
    const newReceipt = { ...receipt, id: Date.now().toString() };
    const updated = [...receipts, newReceipt];
    setReceipts(updated);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updated));
    return newReceipt;
  };

  const getNextReceiptNumber = (): string => {
    if (receipts.length === 0) return 'REC-1001';
    
    // Extract numbers from receipt numbers
    const numbers = receipts
      .map(rec => {
        const match = rec.receiptNumber.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter(n => n > 0);
    
    if (numbers.length === 0) return 'REC-1001';
    
    const maxNumber = Math.max(...numbers);
    return `REC-${maxNumber + 1}`;
  };

  const updateReceiptTemplate = (template: ReceiptTemplate) => {
    setReceiptTemplate(template);
    localStorage.setItem(STORAGE_KEYS.RECEIPT_TEMPLATE, JSON.stringify(template));
  };

  // Receipt operations - Edit and Delete
  const updateReceipt = (id: string, updatedData: Partial<FeeReceipt>) => {
    const updated = receipts.map(r => r.id === id ? { ...r, ...updatedData } : r);
    setReceipts(updated);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updated));
  };

  const deleteReceipt = (id: string) => {
    const updated = receipts.filter(r => r.id !== id);
    setReceipts(updated);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updated));
  };

  // Authentication operations
  const login = (username: string, password: string): User | null => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const newAuthState: AuthState = {
        isAuthenticated: true,
        currentUser: user,
      };
      setAuthState(newAuthState);
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(newAuthState));
      return user;
    }
    return null;
  };

  const loginWithPasscode = (passcode: string): User | null => {
    const user = users.find(u => u.passcode === passcode && u.role === 'teacher');
    if (user) {
      const newAuthState: AuthState = {
        isAuthenticated: true,
        currentUser: user,
      };
      setAuthState(newAuthState);
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(newAuthState));
      return user;
    }
    return null;
  };

  const logout = () => {
    const newAuthState: AuthState = {
      isAuthenticated: false,
      currentUser: null,
    };
    setAuthState(newAuthState);
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(newAuthState));
  };

  // User management operations
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    return newUser;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updated = users.map(u => u.id === id ? { ...u, ...userData } : u);
    setUsers(updated);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    
    // If updating current user, update auth state
    if (authState.currentUser?.id === id) {
      const updatedUser = updated.find(u => u.id === id);
      if (updatedUser) {
        const newAuthState = {
          ...authState,
          currentUser: updatedUser,
        };
        setAuthState(newAuthState);
        localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(newAuthState));
      }
    }
  };

  const deleteUser = (id: string) => {
    // Don't allow deleting yourself or the last admin
    if (authState.currentUser?.id === id) return;
    const admins = users.filter(u => u.role === 'admin');
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin' && admins.length === 1) return;

    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  };

  // Inquiry operations
  const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'createdAt'>) => {
    const newInquiry: Inquiry = {
      ...inquiry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...inquiries, newInquiry];
    setInquiries(updated);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
    return newInquiry;
  };

  const updateInquiry = (id: string, updatedData: Partial<Inquiry>) => {
    const updated = inquiries.map(i => i.id === id ? { ...i, ...updatedData } : i);
    setInquiries(updated);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
  };

  const deleteInquiry = (id: string) => {
    const updated = inquiries.filter(i => i.id !== id);
    setInquiries(updated);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
  };

  // Demo student operations
  const addDemoStudent = (demoStudent: Omit<DemoStudent, 'id' | 'createdAt'>) => {
    const newDemoStudent: DemoStudent = {
      ...demoStudent,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...demoStudents, newDemoStudent];
    setDemoStudents(updated);
    localStorage.setItem(STORAGE_KEYS.DEMO_STUDENTS, JSON.stringify(updated));
    return newDemoStudent;
  };

  const updateDemoStudent = (id: string, updatedData: Partial<DemoStudent>) => {
    const updated = demoStudents.map(ds => ds.id === id ? { ...ds, ...updatedData } : ds);
    setDemoStudents(updated);
    localStorage.setItem(STORAGE_KEYS.DEMO_STUDENTS, JSON.stringify(updated));
  };

  const deleteDemoStudent = (id: string) => {
    const updated = demoStudents.filter(ds => ds.id !== id);
    setDemoStudents(updated);
    localStorage.setItem(STORAGE_KEYS.DEMO_STUDENTS, JSON.stringify(updated));
  };

  // Holiday operations
  const addHoliday = (holiday: Omit<Holiday, 'id' | 'createdAt'>) => {
    const newHoliday: Holiday = {
      ...holiday,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...holidays, newHoliday];
    setHolidays(updated);
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(updated));
    return newHoliday;
  };

  const updateHoliday = (id: string, updatedData: Partial<Holiday>) => {
    const updated = holidays.map(h => h.id === id ? { ...h, ...updatedData } : h);
    setHolidays(updated);
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(updated));
  };

  const deleteHoliday = (id: string) => {
    const updated = holidays.filter(h => h.id !== id);
    setHolidays(updated);
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(updated));
  };

  // Ledger account operations
  const addLedgerAccount = (account: Omit<LedgerAccount, 'id' | 'createdAt'>) => {
    const newAccount: LedgerAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...ledgerAccounts, newAccount];
    setLedgerAccounts(updated);
    localStorage.setItem(STORAGE_KEYS.LEDGER_ACCOUNTS, JSON.stringify(updated));
    return newAccount;
  };

  const updateLedgerAccount = (id: string, updatedData: Partial<LedgerAccount>) => {
    const updated = ledgerAccounts.map(a => a.id === id ? { ...a, ...updatedData } : a);
    setLedgerAccounts(updated);
    localStorage.setItem(STORAGE_KEYS.LEDGER_ACCOUNTS, JSON.stringify(updated));
  };

  const deleteLedgerAccount = (id: string) => {
    const updated = ledgerAccounts.filter(a => a.id !== id);
    setLedgerAccounts(updated);
    localStorage.setItem(STORAGE_KEYS.LEDGER_ACCOUNTS, JSON.stringify(updated));
  };

  // Ledger entry operations
  const addLedgerEntry = (entry: Omit<LedgerEntry, 'id' | 'createdAt'>) => {
    const newEntry: LedgerEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...ledgerEntries, newEntry];
    setLedgerEntries(updated);
    localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(updated));
    return newEntry;
  };

  const updateLedgerEntry = (id: string, updatedData: Partial<LedgerEntry>) => {
    const updated = ledgerEntries.map(e => e.id === id ? { ...e, ...updatedData } : e);
    setLedgerEntries(updated);
    localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(updated));
  };

  const deleteLedgerEntry = (id: string) => {
    const updated = ledgerEntries.filter(e => e.id !== id);
    setLedgerEntries(updated);
    localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(updated));
  };

  return {
    batches,
    students,
    attendanceRecords,
    feeRecords,
    trash,
    reminders,
    receipts,
    receiptTemplate,
    users,
    authState,
    inquiries,
    demoStudents,
    holidays,
    ledgerAccounts,
    ledgerEntries,
    addBatch,
    updateBatch,
    deleteBatch,
    addStudent,
    updateStudent,
    deleteStudent,
    markStudentAsLeft,
    reAdmitStudent,
    removeStudentFromBatch,
    transferStudent,
    addAttendanceRecord,
    bulkAddAttendanceRecords,
    addFeeRecord,
    getNextRollNumber,
    restoreFromTrash,
    permanentlyDeleteFromTrash,
    emptyTrash,
    addReminder,
    markReminderAsRead,
    deleteReminder,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    getNextReceiptNumber,
    updateReceiptTemplate,
    login,
    loginWithPasscode,
    logout,
    addUser,
    updateUser,
    deleteUser,
    addInquiry,
    updateInquiry,
    deleteInquiry,
    addDemoStudent,
    updateDemoStudent,
    deleteDemoStudent,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    addLedgerAccount,
    updateLedgerAccount,
    deleteLedgerAccount,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
  };
}