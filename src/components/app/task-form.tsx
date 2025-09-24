'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Task, Folder } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required.'),
  description: z.string().optional(),
  folderId: z.string().min(1, 'Please select a folder.'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  userId: string;
  folders: Folder[];
  task?: Task;
  onSuccess?: () => void;
}

export function TaskForm({ userId, folders, task, onSuccess }: TaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const currentFolderId = pathname.split('/folders/')[1];

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      folderId: task?.folderId || currentFolderId || folders[0]?.id || '',
    },
  });

  const onSubmit = (values: TaskFormValues) => {
    if (!userId) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to create or update a task.'
        });
        return;
    }
    startTransition(async () => {
      try {
        if (task) {
          const taskRef = doc(db, 'users', userId, 'tasks', task.id);
          await updateDoc(taskRef, values);
          toast({ title: 'Success', description: 'Task updated successfully.' });
        } else {
          await addDoc(collection(db, 'users', userId, 'tasks'), {
            ...values,
            userId,
            completed: false,
            order: Date.now(),
            createdAt: serverTimestamp(),
          });
          toast({ title: 'Success', description: 'Task created successfully.' });
        }
        onSuccess?.();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      }
    });
  };
  
  if (!folders.length) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        <p>Please create a folder first before adding a task.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Finalize project report" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about the task..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="folderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Folder</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
        </Button>
      </form>
    </Form>
  );
}
