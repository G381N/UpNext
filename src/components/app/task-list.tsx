'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import TaskItem from './task-item';
import type { Task } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

interface TaskListProps {
  folderId: string;
}

export default function TaskList({ folderId }: TaskListProps) {
  const { user } = useAuth();
  const [tasks, loading, error] = useCollection(
    user
      ? query(
          collection(db, 'users', user.uid, 'tasks'),
          where('folderId', '==', folderId),
          orderBy('completed', 'asc'),
          orderBy('order', 'asc')
        )
      : null
  );

  const uncompletedTasks = tasks?.docs.filter(doc => !doc.data().completed) || [];
  const completedTasks = tasks?.docs.filter(doc => doc.data().completed) || [];

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    // NOTE: This is a common error for new Firebase projects.
    // It can be resolved by creating the required index in the Firestore console.
    const isIndexError = error.code === 'failed-precondition';
    const firestoreIndexURL = `https://console.firebase.google.com/v1/r/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=ClVwcm9qZWN0cy9zdHVkaW8tNDAyNTQ2ODQwOS05MGUxOC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdGFza3MvaW5kZXhlcy9fEAEaDAoIZm9sZGVySWQQARoNCgljb21wbGV0ZWQQARoJCgVvcmRlchABGgwKCF9fbmFtZV9fEAE`;

    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error fetching tasks</AlertTitle>
            <AlertDescription>
                {isIndexError ? (
                    <>
                        <p className="mb-2">A Firestore index is required to sort and filter these tasks. Please create the index to continue.</p>
                        <Button asChild>
                            <a href={firestoreIndexURL} target="_blank" rel="noopener noreferrer">Create Index</a>
                        </Button>
                    </>
                ) : (
                    <p>{error.message}</p>
                )}
            </AlertDescription>
        </Alert>
    )
  }

  if (tasks?.empty) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>No tasks in this folder yet.</p>
        <p className="text-sm">Ready to add one?</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {uncompletedTasks.map((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        return <TaskItem key={task.id} task={task} />;
      })}
      
      {completedTasks.length > 0 && uncompletedTasks.length > 0 && (
        <div className="relative py-2">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            Completed
          </span>
        </div>
      )}

      {completedTasks.length > 0 && uncompletedTasks.length === 0 && (
         <div className="py-16 text-center text-muted-foreground">
            <p>All tasks completed!</p>
         </div>
      )}

      {completedTasks.map((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        return <TaskItem key={task.id} task={task} />;
      })}
    </div>
  );
}
