import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Settings, Users, FileText, Calendar, BookOpen } from 'lucide-react';
import LedgerManagement from './LedgerManagement';

export default function Management() {
  const [activeView, setActiveView] = useState<'overview' | 'ledger'>('overview');

  if (activeView === 'ledger') {
    return <LedgerManagement onBack={() => setActiveView('overview')} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-gray-900 dark:text-gray-100">Management</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your coaching business operations and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ledger Management */}
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveView('ledger')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle>Ledger</CardTitle>
                <CardDescription>Track financial accounts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage organization accounts and track credit/debit transactions
            </p>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage staff and permissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add, edit, or remove staff members and configure their access permissions
            </p>
          </CardContent>
        </Card>

        {/* Reports & Analytics */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>View business insights</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate detailed reports on attendance, revenue, and student performance
            </p>
          </CardContent>
        </Card>

        {/* Schedule Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle>Schedule Management</CardTitle>
                <CardDescription>Manage class schedules</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure batch timings, holidays, and special class schedules
            </p>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize application settings, themes, and organizational details
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}