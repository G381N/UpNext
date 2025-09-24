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
          orderBy('order', 'asc')
        )
      : null
  );

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
    const isIndexError = error.code === 'failed-precondition';
    const firestoreIndexURL = `https://console.firebase.google.com/v1/r/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=ClVwcm9qZWN0cy9zdHVkaW8tNDAyNTQ2ODQwOS05MGUxOC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdGFza3MvaW5kZXhlcy9fEAEaDAoIZm9sZGVySWQQARoJCgVvcmRlchABGgwKCF9fbmFtZV9fEAE`;

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
      {tasks?.docs.map((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        return <TaskItem key={task.id} task={task} />;
      })}
    </div>
  );
}
