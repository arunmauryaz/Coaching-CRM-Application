import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, User, BookOpen, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import DeletedStudentDetailsDialog from './DeletedStudentDetailsDialog';

export default function TrashManagement() {
  const { trash, restoreFromTrash, permanentlyDeleteFromTrash, emptyTrash } = useCRMData();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<any>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRestore = (trashItemId: string, itemName: string) => {
    restoreFromTrash(trashItemId);
    toast.success(`Restored "${itemName}" successfully`);
  };

  const handlePermanentDelete = (trashItemId: string) => {
    permanentlyDeleteFromTrash(trashItemId);
    setConfirmDelete(null);
    toast.success('Permanently deleted from trash');
  };

  const handleEmptyTrash = () => {
    emptyTrash();
    setConfirmEmptyTrash(false);
    toast.success('Trash emptied successfully');
  };

  // Sort trash items by deleted date (most recent first)
  const sortedTrash = [...trash].sort((a, b) => 
    new Date(b.deletedDate).getTime() - new Date(a.deletedDate).getTime()
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100">Trash</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {trash.length} {trash.length === 1 ? 'item' : 'items'} in trash
          </p>
        </div>
        {trash.length > 0 && (
          <Button
            onClick={() => setConfirmEmptyTrash(true)}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Empty Trash
          </Button>
        )}
      </div>

      {trash.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Trash is empty</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Deleted students and batches will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTrash.map((item) => {
            const isStudent = item.type === 'student';
            const name = isStudent ? item.data.name : item.data.name;
            const Icon = isStudent ? User : BookOpen;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900 dark:text-gray-100">{name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Deleted on {formatDate(item.deletedDate)}
                      </p>
                      
                      {isStudent && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <p>Roll No: {item.data.rollNo}</p>
                          {item.relatedData && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Includes {item.relatedData.attendance?.length || 0} attendance records
                              and {item.relatedData.fees?.length || 0} fee records
                            </p>
                          )}
                        </div>
                      )}
                      {!isStudent && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <p>{item.data.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {isStudent && (
                      <Button
                        onClick={() => setViewingStudent(item)}
                        variant="ghost"
                        size="sm"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRestore(item.id, name)}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      onClick={() => setConfirmDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Permanent Delete Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item from trash.
              You will not be able to recover it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handlePermanentDelete(confirmDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Empty Trash Dialog */}
      <AlertDialog open={confirmEmptyTrash} onOpenChange={setConfirmEmptyTrash}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all {trash.length} items 
              from trash. You will not be able to recover any of them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyTrash}
              className="bg-red-600 hover:bg-red-700"
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Deleted Student Details */}
      {viewingStudent && (
        <DeletedStudentDetailsDialog
          trashItem={viewingStudent}
          open={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </div>
  );
}
