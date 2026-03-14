import { useState, useEffect } from 'react';
import { Users, BookOpen, ClipboardCheck, DollarSign, LayoutDashboard, Menu, Settings as SettingsIcon, Trash2, LogOut, UserSearch, Briefcase } from 'lucide-react';
import Dashboard from './components/Dashboard';
import BatchesManagement from './components/BatchesManagement';
import StudentsManagement from './components/StudentsManagement';
import AttendanceManagement from './components/AttendanceManagement';
import AttendanceInvestigation from './components/AttendanceInvestigation';
import BillingManagement from './components/BillingManagement';
import InquiryManagement from './components/InquiryManagement';
import Management from './components/Management';
import FeeReceiptCreationPage from './components/FeeReceiptCreationPage';
import FeeReceiptViewPage from './components/FeeReceiptViewPage';
import ReceiptTemplateSettings from './components/ReceiptTemplateSettings';
import StudentDetailsPage from './components/StudentDetailsPage';
import TrashManagement from './components/TrashManagement';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet';
import { Button } from './components/ui/button';
import { useCRMData } from './components/hooks/useCRMData';
import { toast } from 'sonner@2.0.3';

type View = 'dashboard' | 'batches' | 'students' | 'attendance' | 'attendance-investigation' | 'billing' | 'inquiry' | 'management' | 'student-details' | 'trash' | 'settings' | 'create-receipt' | 'edit-receipt' | 'view-receipt' | 'receipt-template';

export default function App() {
  const { authState, login, loginWithPasscode, logout } = useCRMData();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState(() => {
    return localStorage.getItem('crm_org_name') || 'Coaching CRM';
  });

  // Apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('crm_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    const user = login(username, password);
    if (user) {
      toast.success(`Welcome back, ${user.username}!`);
      return true;
    }
    return false;
  };

  const handlePasscodeLogin = (passcode: string) => {
    const user = loginWithPasscode(passcode);
    if (user) {
      toast.success(`Welcome, ${user.username}!`);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  // Check permissions for current user
  const hasPermission = (section: string) => {
    if (!authState.currentUser) return false;
    if (authState.currentUser.role === 'admin') return true;
    return authState.currentUser.permissions[section as keyof typeof authState.currentUser.permissions];
  };

  // If not authenticated, show login page
  if (!authState.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onPasscodeLogin={handlePasscodeLogin} />;
  }

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { id: 'batches' as View, label: 'Batches', icon: BookOpen, permission: 'batches' },
    { id: 'students' as View, label: 'Students', icon: Users, permission: 'students' },
    { id: 'attendance' as View, label: 'Attendance', icon: ClipboardCheck, permission: 'attendance' },
    { id: 'billing' as View, label: 'Billing', icon: DollarSign, permission: 'billing' },
    { id: 'inquiry' as View, label: 'Inquiries', icon: UserSearch, permission: 'inquiry' },
    { id: 'management' as View, label: 'Management', icon: Briefcase, permission: 'management' },
  ].filter(item => hasPermission(item.permission));

  const handleNavClick = (view: View) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const handleViewStudentDetails = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveView('student-details');
  };

  const handleBackFromStudentDetails = () => {
    setSelectedStudentId(null);
    setActiveView('students');
  };

  const handleCreateReceipt = () => {
    setActiveView('create-receipt');
  };

  const handleEditReceipt = (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setActiveView('edit-receipt');
  };

  const handleViewReceipt = (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setActiveView('view-receipt');
  };

  const handleManageTemplate = () => {
    setActiveView('receipt-template');
  };

  const handleBackToBilling = () => {
    setActiveView('billing');
  };

  const handleReceiptCreated = () => {
    setActiveView('billing');
  };

  const handleInvestigate = () => {
    setActiveView('attendance-investigation');
  };

  const handleBackToAttendance = () => {
    setActiveView('attendance');
  };

  const NavigationItems = ({ onClick }: { onClick?: (view: View) => void }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onClick ? onClick(item.id) : setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === item.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-blue-600 dark:text-blue-400">{orgName}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {authState.currentUser?.username} ({authState.currentUser?.role})
          </p>
        </div>
        <nav className="flex-1 p-4">
          <NavigationItems />
        </nav>
        {/* Trash, Settings, and Logout Buttons at Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {authState.currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveView('trash')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'trash'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>Trash</span>
            </button>
          )}
          {hasPermission('settings') && (
            <button
              onClick={() => setActiveView('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'settings'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-blue-600 dark:text-blue-400">{orgName}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {authState.currentUser?.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 flex flex-col">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate between different sections of the CRM
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-6 flex-1">
            <NavigationItems onClick={handleNavClick} />
          </nav>
          {/* Trash, Settings, and Logout Buttons at Bottom */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-2">
            {authState.currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveView('trash');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'trash'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                <span>Trash</span>
              </button>
            )}
            {hasPermission('settings') && (
              <button
                onClick={() => {
                  setActiveView('settings');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'settings'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <SettingsIcon className="w-5 h-5" />
                <span>Settings</span>
              </button>
            )}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0 bg-gray-50 dark:bg-gray-950">
        {activeView === 'dashboard' && hasPermission('dashboard') && (
          <Dashboard onViewStudent={handleViewStudentDetails} />
        )}
        {activeView === 'batches' && hasPermission('batches') && <BatchesManagement />}
        {activeView === 'students' && hasPermission('students') && (
          <StudentsManagement onViewStudent={handleViewStudentDetails} />
        )}
        {activeView === 'attendance' && hasPermission('attendance') && (
          <AttendanceManagement onInvestigate={handleInvestigate} />
        )}
        {activeView === 'attendance-investigation' && hasPermission('attendance') && (
          <AttendanceInvestigation onBack={handleBackToAttendance} />
        )}
        {activeView === 'billing' && hasPermission('billing') && (
          <BillingManagement 
            onCreateReceipt={handleCreateReceipt}
            onViewReceipt={handleViewReceipt}
            onEditReceipt={handleEditReceipt}
            onManageTemplate={handleManageTemplate}
          />
        )}
        {activeView === 'inquiry' && hasPermission('inquiry') && <InquiryManagement />}
        {activeView === 'create-receipt' && hasPermission('billing') && (
          <FeeReceiptCreationPage 
            onBack={handleBackToBilling}
            onReceiptCreated={handleReceiptCreated}
          />
        )}
        {activeView === 'edit-receipt' && hasPermission('billing') && selectedReceiptId && (
          <FeeReceiptCreationPage 
            onBack={handleBackToBilling}
            onReceiptCreated={handleReceiptCreated}
            receiptId={selectedReceiptId}
          />
        )}
        {activeView === 'view-receipt' && hasPermission('billing') && selectedReceiptId && (
          <FeeReceiptViewPage 
            receiptId={selectedReceiptId}
            onBack={handleBackToBilling}
          />
        )}
        {activeView === 'receipt-template' && hasPermission('billing') && (
          <ReceiptTemplateSettings onBack={handleBackToBilling} />
        )}
        {activeView === 'trash' && authState.currentUser?.role === 'admin' && <TrashManagement />}
        {activeView === 'settings' && hasPermission('settings') && <SettingsPage />}
        {activeView === 'student-details' && hasPermission('students') && selectedStudentId && (
          <StudentDetailsPage studentId={selectedStudentId} onBack={handleBackFromStudentDetails} />
        )}
        {activeView === 'management' && hasPermission('management') && <Management />}
      </div>
    </div>
  );
}