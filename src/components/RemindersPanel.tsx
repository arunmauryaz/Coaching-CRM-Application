import { useState } from 'react';
import { Bell, Plus, X, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';

export default function RemindersPanel() {
  const { reminders, addReminder, markReminderAsRead, deleteReminder } = useCRMData();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    urgency: 'moderate' as 'low' | 'moderate' | 'high',
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.date) {
      toast.error('Please fill in title and date');
      return;
    }

    addReminder({
      title: formData.title,
      date: formData.date,
      time: formData.time || undefined,
      urgency: formData.urgency,
    });

    toast.success('Reminder added successfully');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      urgency: 'moderate',
    });
  };

  const handleDelete = (id: string) => {
    deleteReminder(id);
    toast.success('Reminder deleted');
  };

  const handleMarkAsRead = (id: string) => {
    markReminderAsRead(id);
  };

  // Check if reminder is due
  const isReminderDue = (reminder: any) => {
    const now = new Date();
    const reminderDate = new Date(reminder.date);
    
    if (reminder.time) {
      const [hours, minutes] = reminder.time.split(':');
      reminderDate.setHours(parseInt(hours), parseInt(minutes));
      return now >= reminderDate;
    } else {
      // If no time, check if it's the same day or past
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const reminderDay = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
      return today >= reminderDay;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'moderate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  const formatDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    if (timeString) {
      return `${dateStr} at ${timeString}`;
    }
    return dateStr;
  };

  // Sort reminders: unread due reminders first, then by date
  const sortedReminders = [...reminders].sort((a, b) => {
    const aDue = isReminderDue(a);
    const bDue = isReminderDue(b);
    
    if (aDue && !a.isRead && (!bDue || b.isRead)) return -1;
    if (bDue && !b.isRead && (!aDue || a.isRead)) return 1;
    
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Count unread due reminders
  const unreadDueCount = reminders.filter(r => !r.isRead && isReminderDue(r)).length;

  return (
    <>
      {/* Notification Button */}
      <div className="relative">
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="sm"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadDueCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadDueCount > 9 ? '9+' : unreadDueCount}
            </span>
          )}
        </Button>
      </div>

      {/* Reminders Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Reminders
            </SheetTitle>
            <SheetDescription>
              Manage your reminders and notifications
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {sortedReminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No reminders yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Add a reminder to get started
                </p>
              </div>
            ) : (
              sortedReminders.map((reminder) => {
                const isDue = isReminderDue(reminder);
                const isUnread = !reminder.isRead;

                return (
                  <div
                    key={reminder.id}
                    className={`p-4 rounded-lg border-2 ${
                      isDue && isUnread
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } ${isUnread ? '' : 'opacity-60'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <h4 className="text-gray-900 dark:text-gray-100 flex-1">
                            {reminder.title}
                          </h4>
                          {isDue && isUnread && (
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(reminder.date, reminder.time)}</span>
                        </div>

                        <Badge
                          variant="outline"
                          className={`text-xs ${getUrgencyColor(reminder.urgency)}`}
                        >
                          {reminder.urgency} urgency
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-1">
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(reminder.id)}
                            title="Mark as read"
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(reminder.id)}
                          title="Delete reminder"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Reminder Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Reminder</DialogTitle>
            <DialogDescription>
              Create a reminder for important tasks or events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Textarea
                id="title"
                placeholder="What do you want to be reminded about?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="time">Time (Optional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}
              >
                <SelectTrigger id="urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
