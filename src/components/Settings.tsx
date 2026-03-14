import { useState, useRef } from 'react';
import { Moon, Sun, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STORAGE_KEYS = {
  BATCHES: 'crm_batches',
  STUDENTS: 'crm_students',
  ATTENDANCE: 'crm_attendance',
  FEES: 'crm_fees',
  TRASH: 'crm_trash',
  THEME: 'crm_theme',
};

export default function Settings({ open, onOpenChange }: SettingsProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'light' | 'dark') || 'light';
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

  // Export all data
  const handleExportData = () => {
    try {
      // Gather all data from localStorage
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          batches: JSON.parse(localStorage.getItem(STORAGE_KEYS.BATCHES) || '[]'),
          students: JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]'),
          attendance: JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),
          fees: JSON.parse(localStorage.getItem(STORAGE_KEYS.FEES) || '[]'),
          trash: JSON.parse(localStorage.getItem(STORAGE_KEYS.TRASH) || '[]'),
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
        const { batches, students, attendance, fees, trash } = importData.data;
        
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application preferences and data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appearance Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-900">Appearance</h3>
              <p className="text-sm text-gray-500 mt-1">
                Customize how the application looks
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-700" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="cursor-pointer">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">
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
          </div>

          <Separator />

          {/* Data Management Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-900">Data Management</h3>
              <p className="text-sm text-gray-500 mt-1">
                Backup and restore your data
              </p>
            </div>

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
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-gray-900">Export Data</h4>
                  <p className="text-sm text-gray-500 mt-1">
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
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Upload className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-gray-900">Import Data</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Restore your data from a previously exported backup file. This will replace 
                    all current data with the data from the backup file.
                  </p>
                  <Alert className="mt-3 bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      <p className="text-sm text-yellow-800">
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
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100">What's Included</h4>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Student information (names, phone numbers, addresses, roll numbers, status)</li>
                    <li>Batch details and student enrollments</li>
                    <li>Complete attendance history</li>
                    <li>Fee payment records and status</li>
                    <li>Trash (deleted items and their related data)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
