import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onPasscodeLogin: (passcode: string) => boolean;
}

export default function LoginPage({ onLogin, onPasscodeLogin }: LoginPageProps) {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      toast.error('Please enter passcode');
      return;
    }
    const success = onPasscodeLogin(passcode);
    if (!success) {
      toast.error('Invalid passcode');
      setPasscode('');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    const success = onLogin(username, password);
    if (!success) {
      toast.error('Invalid credentials');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-gray-900">Coaching CRM</CardTitle>
          <CardDescription>
            {isAdminLogin ? 'Admin Login' : 'Teacher Login'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdminLogin ? (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div>
                <Label htmlFor="passcode">Enter Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  placeholder="••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="text-center text-xl tracking-widest"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <button
                type="button"
                onClick={() => setIsAdminLogin(true)}
                className="w-full text-sm text-center text-primary hover:underline"
              >
                Admin Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Login as Admin
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsAdminLogin(false);
                  setUsername('');
                  setPassword('');
                }}
                className="w-full text-sm text-center text-gray-600 dark:text-gray-400 hover:underline"
              >
                Back to Teacher Login
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Default Admin: admin / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
