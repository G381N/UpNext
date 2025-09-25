'use client';

import React from 'react';
import { useTransition } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar } from 'lucide-react';
import type { Task, Folder } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { TaskForm } from './task-form';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
  
  const [folders] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'folders'), where('userId', '==', user.uid)) : null
  );

  const handleToggle = () => {
    if (!user) return;
    startTransition(async () => {
      try {
        const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
        await updateDoc(taskRef, { completed: !task.completed });
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update task.',
        });
      }
    });
  };

  const handleDelete = () => {
    if (!user) return;
    startTransition(async () => {
      try {
        const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
        await deleteDoc(taskRef);
        toast({ title: 'Task deleted' });
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete task.',
        });
      }
    });
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50',
        task.completed && 'bg-muted/30'
      )}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="h-5 w-5 mt-0.5"
      />
      <div className="flex-1">
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            'cursor-pointer text-sm font-medium',
            task.completed && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </label>
        {task.deadline && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(task.deadline.toDate(), 'PP')}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Task</SheetTitle>
            </SheetHeader>
            <TaskForm 
              userId={user!.uid} 
              task={task} 
              onSuccess={() => setIsEditSheetOpen(false)}
              folders={folders?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder)) || []}
            />
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
