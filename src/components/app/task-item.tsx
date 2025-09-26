'use client';

import React from 'react';
import { useTransition, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Calendar } from 'lucide-react';
import type { Task, Folder } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { TaskForm } from './task-form';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';
import { format, isToday } from 'date-fns';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
  const [showTime, setShowTime] = useState(false);
  
  const [folders] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'folders'), where('userId', '==', user.uid)) : null
  );

  const handleToggleCompletion = () => {
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

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent card click from toggling checkbox
    if ((e.target as HTMLElement).closest('button, [role="checkbox"], a, input')) {
        return;
    }
    if (task.deadline) {
        setShowTime(prev => !prev);
    }
  };

  const renderDeadline = () => {
    if (!task.deadline) return null;

    const deadlineDate = task.deadline.toDate();
    let deadlineText;

    if (showTime) {
      deadlineText = format(deadlineDate, 'p'); // e.g., 11:00 AM
    } else {
      if (isToday(deadlineDate)) {
        deadlineText = format(deadlineDate, 'p'); // Show time if it's today
      } else {
        deadlineText = format(deadlineDate, 'PP'); // e.g., Sep 27, 2025
      }
    }
    
    return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{deadlineText}</span>
        </div>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50',
        task.completed && 'bg-muted/30 opacity-70',
        task.deadline && 'cursor-pointer'
      )}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={handleToggleCompletion}
        disabled={isPending}
        className="h-5 w-5 mt-0.5"
      />
      <div className="flex-1">
        <span
          className={cn(
            'text-sm font-medium',
            task.completed && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </span>
        {renderDeadline()}
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
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
      </div>
    </div>
  );
}
