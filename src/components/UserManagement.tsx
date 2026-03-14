import { useState } from 'react';
import { Plus, Trash2, Edit, Shield, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useCRMData, User, Permission } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

export default function UserManagement() {
  const { users, authState, addUser, updateUser, deleteUser } = useCRMData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'teacher' as 'admin' | 'teacher',
    passcode: '',
    permissions: {
      dashboard: false,
      students: false,
      batches: false,
      attendance: true,
      billing: false,
      inquiry: false,
      management: false,
      settings: false,
    } as Permission,
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'teacher',
      passcode: '',
      permissions: {
        dashboard: false,
        students: false,
        batches: false,
        attendance: true,
        billing: false,
        inquiry: false,
        management: false,
        settings: false,
      },
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error('Username and password are required');
      return;
    }

    if (formData.role === 'teacher' && !formData.passcode) {
      toast.error('Passcode is required for teachers');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast.success('User updated successfully');
    } else {
      // Check if username already exists
      if (users.some(u => u.username === formData.username)) {
        toast.error('Username already exists');
        return;
      }

      if (formData.role === 'teacher' && users.some(u => u.passcode === formData.passcode)) {
        toast.error('Passcode already in use');
        return;
      }

      const permissions = formData.role === 'admin'
        ? {
            dashboard: true,
            students: true,
            batches: true,
            attendance: true,
            billing: true,
            inquiry: true,
            management: true,
            settings: true,
          }
        : formData.permissions;

      addUser({
        username: formData.username,
        password: formData.password,
        role: formData.role,
        passcode: formData.role === 'teacher' ? formData.passcode : undefined,
        permissions,
      });
      toast.success('User created successfully');
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
      passcode: user.passcode || '',
      permissions: user.permissions,
    });
    setEditingUser(user);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (authState.currentUser?.id === userId) {
      toast.error("You can't delete yourself");
      return;
    }

    const userToDelete = users.find(u => u.id === userId);
    
    // If deleting an admin, check if there's at least one other admin
    if (userToDelete?.role === 'admin') {
      const admins = users.filter(u => u.role === 'admin');
      if (admins.length <= 1) {
        toast.error("Can't delete the last admin user");
        return;
      }
    }

    deleteUser(userId);
    toast.success('User deleted successfully');
    setDeleteUserId(null);
  };

  const teachers = users.filter(u => u.role === 'teacher');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="space-y-6">
      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user details and permissions' : 'Create a new admin or teacher account'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                disabled={!!editingUser}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: 'admin' | 'teacher') => {
                  setFormData({ 
                    ...formData, 
                    role: value,
                    permissions: value === 'admin' ? {
                      dashboard: true,
                      students: true,
                      batches: true,
                      attendance: true,
                      billing: true,
                      inquiry: true,
                      management: true,
                      settings: true,
                    } : {
                      dashboard: false,
                      students: false,
                      batches: false,
                      attendance: true,
                      billing: false,
                      inquiry: false,
                      management: false,
                      settings: false,
                    }
                  });
                }}
                disabled={!!editingUser}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'teacher' && (
              <>
                <div>
                  <Label htmlFor="passcode">Passcode (6 digits)</Label>
                  <Input
                    id="passcode"
                    type="text"
                    value={formData.passcode}
                    onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                    placeholder="Enter 6-digit passcode"
                    maxLength={6}
                  />
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-sm font-medium">Permissions</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-dashboard">Dashboard</Label>
                    <Switch
                      id="perm-dashboard"
                      checked={formData.permissions.dashboard}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, dashboard: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-students">Students</Label>
                    <Switch
                      id="perm-students"
                      checked={formData.permissions.students}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, students: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-batches">Batches</Label>
                    <Switch
                      id="perm-batches"
                      checked={formData.permissions.batches}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, batches: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-attendance">Attendance</Label>
                    <Switch
                      id="perm-attendance"
                      checked={formData.permissions.attendance}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, attendance: checked }
                      })}
                      disabled
                    />
                    <span className="text-xs text-gray-500">Always enabled</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-billing">Billing</Label>
                    <Switch
                      id="perm-billing"
                      checked={formData.permissions.billing}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, billing: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-inquiry">Inquiries</Label>
                    <Switch
                      id="perm-inquiry"
                      checked={formData.permissions.inquiry}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, inquiry: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-management">Management</Label>
                    <Switch
                      id="perm-management"
                      checked={formData.permissions.management}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, management: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="perm-settings">Settings</Label>
                    <Switch
                      id="perm-settings"
                      checked={formData.permissions.settings}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, settings: checked }
                      })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administrators
          </CardTitle>
          <CardDescription>Users with full access to all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-gray-900 dark:text-gray-100">{user.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteUserId(user.id)}
                    disabled={authState.currentUser?.id === user.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teachers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Teachers
          </CardTitle>
          <CardDescription>Users with limited access based on permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teachers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No teachers added yet
              </p>
            ) : (
              teachers.map((user) => (
                <div key={user.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Passcode: {user.passcode}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(user.permissions).map(([key, value]) => (
                      value && (
                        <span
                          key={key}
                          className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteUserId && handleDelete(deleteUserId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}