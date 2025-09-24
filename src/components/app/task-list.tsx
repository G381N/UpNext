'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import TaskItem from './task-item';
import type { Task } from '@/types';
import { Skeleton } from '../ui/skeleton';

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
    return <p className="text-destructive">Error: {error.message}</p>;
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
