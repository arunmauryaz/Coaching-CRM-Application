import { useState, useRef } from 'react';
import { Moon, Sun, Download, Upload, AlertTriangle, CheckCircle2, Building, ArrowLeft, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import UserManagement from './UserManagement';
import { useCRMData } from './hooks/useCRMData';

const STORAGE_KEYS = {
  BATCHES: 'crm_batches',
  STUDENTS: 'crm_students',
  ATTENDANCE: 'crm_attendance',
  FEES: 'crm_fees',
  TRASH: 'crm_trash',
  THEME: 'crm_theme',
  ORG_NAME: 'crm_org_name',
  INQUIRIES: 'crm_inquiries',
  DEMO_STUDENTS: 'crm_demo_students',
  HOLIDAYS: 'crm_holidays',
  RECEIPTS: 'crm_receipts',
  RECEIPT_TEMPLATE: 'crm_receipt_template',
  REMINDERS: 'crm_reminders',
  USERS: 'crm_users',
  LEDGER_ACCOUNTS: 'crm_ledger_accounts',
  LEDGER_ENTRIES: 'crm_ledger_entries',
};

export default function SettingsPage() {
  const { authState } = useCRMData();
  const isAdmin = authState.currentUser?.role === 'admin';
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'light' | 'dark') || 'light';
  });
  const [orgName, setOrgName] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ORG_NAME) || 'Coaching CRM';
  });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle theme toggle
  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(`Switched to ${newTheme} mode`);
  };

  // Handle organization name change
  const handleOrgNameSave = () => {
    localStorage.setItem(STORAGE_KEYS.ORG_NAME, orgName);
    toast.success('Organization name updated successfully');
    // Trigger a page reload to update the name throughout the app
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Export all data
  const handleExportData = () => {
    try {
      // Gather all data from localStorage
      const exportData = {
        version: '2.0', // Updated version to include inquiry data
        exportDate: new Date().toISOString(),
        data: {
          batches: JSON.parse(localStorage.getItem(STORAGE_KEYS.BATCHES) || '[]'),
          students: JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]'),
          attendance: JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),
          fees: JSON.parse(localStorage.getItem(STORAGE_KEYS.FEES) || '[]'),
          trash: JSON.parse(localStorage.getItem(STORAGE_KEYS.TRASH) || '[]'),
          inquiries: JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]'),
          demoStudents: JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_STUDENTS) || '[]'),
          holidays: JSON.parse(localStorage.getItem(STORAGE_KEYS.HOLIDAYS) || '[]'),
          receipts: JSON.parse(localStorage.getItem(STORAGE_KEYS.RECEIPTS) || '[]'),
          receiptTemplate: JSON.parse(localStorage.getItem(STORAGE_KEYS.RECEIPT_TEMPLATE) || 'null'),
          reminders: JSON.parse(localStorage.getItem(STORAGE_KEYS.REMINDERS) || '[]'),
          orgName: localStorage.getItem(STORAGE_KEYS.ORG_NAME) || 'Coaching CRM',
          ledgerAccounts: JSON.parse(localStorage.getItem(STORAGE_KEYS.LEDGER_ACCOUNTS) || '[]'),
          ledgerEntries: JSON.parse(localStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES) || '[]'),
        },
      };

      // Create a blob and download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `coaching-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!', {
        description: 'Your backup file has been downloaded',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', {
        description: 'Please try again',
      });
    }
  };

  // Import data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate the data structure
        if (!importData.data || !importData.version) {
          throw new Error('Invalid backup file format');
        }

        // Confirm import
        const confirmImport = window.confirm(
          'This will replace all current data with the imported data. This action cannot be undone. Are you sure you want to continue?'
        );

        if (!confirmImport) {
          setImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Import the data
        const { batches, students, attendance, fees, trash, inquiries, demoStudents, holidays, receipts, receiptTemplate, reminders, orgName, ledgerAccounts, ledgerEntries } = importData.data;
        
        if (batches) {
          localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
        }
        if (students) {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        }
        if (attendance) {
          localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
        }
        if (fees) {
          localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
        }
        if (trash) {
          localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(trash));
        }
        if (inquiries) {
          localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
        }
        if (demoStudents) {
          localStorage.setItem(STORAGE_KEYS.DEMO_STUDENTS, JSON.stringify(demoStudents));
        }
        if (holidays) {
          localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
        }
        if (receipts) {
          localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
        }
        if (receiptTemplate) {
          localStorage.setItem(STORAGE_KEYS.RECEIPT_TEMPLATE, JSON.stringify(receiptTemplate));
        }
        if (reminders) {
          localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
        }
        if (orgName) {
          localStorage.setItem(STORAGE_KEYS.ORG_NAME, orgName);
        }
        if (ledgerAccounts) {
          localStorage.setItem(STORAGE_KEYS.LEDGER_ACCOUNTS, JSON.stringify(ledgerAccounts));
        }
        if (ledgerEntries) {
          localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(ledgerEntries));
        }

        toast.success('Data imported successfully!', {
          description: 'Reloading application...',
          duration: 2000,
        });

        // Reload the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import data', {
          description: 'Please ensure the file is a valid backup file',
        });
        setImporting(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file', {
        description: 'Please try again',
      });
      setImporting(false);
    };

    reader.readAsText(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your application preferences and data</p>
      </div>

      {isAdmin ? (
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Organization Settings */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization Settings
            </CardTitle>
            <CardDescription>
              Customize your organization's information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
                This name will be displayed throughout the application
              </p>
              <div className="flex gap-2">
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  className="flex-1"
                />
                <Button onClick={handleOrgNameSave}>
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="cursor-pointer">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {theme === 'dark' ? 'Dark mode is enabled' : 'Light mode is enabled'}
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Backup and restore your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="text-sm">
                  <span className="font-medium">Important:</span> Regular backups help protect your data from accidental loss. 
                  Export your data periodically to keep a safe backup.
                </p>
              </AlertDescription>
            </Alert>

            {/* Export Data */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-gray-100">Export Data</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Download a complete backup of all your data including students, batches, 
                    attendance records, and fee information. This creates a JSON file that can 
                    be imported later.
                  </p>
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="mt-3"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                </div>
              </div>
            </div>

            {/* Import Data */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Upload className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-gray-100">Import Data</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Restore your data from a previously exported backup file. This will replace 
                    all current data with the data from the backup file.
                  </p>
                  <Alert className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    <AlertDescription>
                      <p className="text-sm text-yellow-800 dark:text-yellow-400">
                        <span className="font-medium">Warning:</span> Importing will replace ALL existing data. 
                        Make sure to export your current data first if you want to keep it.
                      </p>
                    </AlertDescription>
                  </Alert>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <Button
                    onClick={handleImportClick}
                    variant="outline"
                    className="mt-3"
                    disabled={importing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {importing ? 'Importing...' : 'Import Data'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Info */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100">What's Included</h4>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Student information (names, phone numbers, addresses, roll numbers, status)</li>
                    <li>Batch details and student enrollments</li>
                    <li>Complete attendance history</li>
                    <li>Fee payment records and receipts</li>
                    <li>Inquiries, demo classes, and holiday records</li>
                    <li>Trash (deleted items and their related data)</li>
                    <li>Reminders and notifications</li>
                    <li>Receipt templates and settings</li>
                    <li>Organization settings</li>
                    <li>Ledger accounts and entries</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          {/* Organization Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organization Settings
              </CardTitle>
              <CardDescription>
                Customize your organization's information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
                  This name will be displayed throughout the application
                </p>
                <div className="flex gap-2">
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter organization name"
                    className="flex-1"
                  />
                  <Button onClick={handleOrgNameSave}>
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                  <div>
                    <Label htmlFor="dark-mode" className="cursor-pointer">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {theme === 'dark' ? 'Dark mode is enabled' : 'Light mode is enabled'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={handleThemeChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}