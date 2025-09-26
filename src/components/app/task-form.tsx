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
import { addDoc, collection, doc, serverTimestamp, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CalendarIcon, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, set } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { deleteTask } from '@/app/actions/tasks';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required.'),
  deadline: z.date().optional(),
  folderId: z.string().min(1, 'Please select a folder.'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  userId: string;
  folders: Folder[];
  task?: Task;
  onSuccess?: () => void;
}

function DateTimePicker({ field }: { field: any }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(field.value);
    const [view, setView] = React.useState<'date' | 'time'>('date');

    React.useEffect(() => {
        // Keep internal state in sync with form state
        setDate(field.value);
    }, [field.value]);
    
    // Reset to date view when dialog opens/closes
    React.useEffect(() => {
        if (!isOpen) {
          setTimeout(() => setView('date'), 150); // Delay to allow animation
        }
    }, [isOpen]);


    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            setDate(undefined);
            return;
        }
        const now = new Date();
        // If there's an existing date, keep its time. Otherwise, use current time.
        const hours = date instanceof Date ? date.getHours() : now.getHours();
        const minutes = date instanceof Date ? date.getMinutes() : now.getMinutes();
        
        const newDateTime = set(selectedDate, { hours, minutes });
        setDate(newDateTime);
        setView('time'); // Switch to time view
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeValue = e.target.value;
        if (!timeValue || !date) {
            return;
        }
        const [hours, minutes] = timeValue.split(':').map(Number);
        const newDateTime = set(date, { hours, minutes });
        setDate(newDateTime);
    };

    const handleSave = () => {
        field.onChange(date);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                    )}
                >
                    {field.value ? (
                        format(field.value, "PPP, p")
                    ) : (
                        <span>Pick a date and time</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                      {view === 'date' ? 'Select Deadline Date' : 'Select Deadline Time'}
                    </DialogTitle>
                </DialogHeader>

                {view === 'date' && (
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(d) =>
                            d < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                    />
                )}

                {view === 'time' && date && (
                  <div className="flex flex-col items-center gap-4 p-4">
                      <p className="text-center text-muted-foreground">
                        Selected date: {format(date, "PPP")}
                      </p>
                      <Input
                          type="time"
                          value={format(date, "HH:mm")}
                          onChange={handleTimeChange}
                          className="w-full text-center text-lg"
                      />
                  </div>
                )}
                
                <DialogFooter>
                    {view === 'time' && (
                        <Button variant="ghost" onClick={() => setView('date')}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function TaskForm({ userId, folders, task, onSuccess }: TaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const currentFolderId = pathname.split('/folders/')[1];

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      deadline: task?.deadline ? task.deadline.toDate() : undefined,
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
        const data: any = {
          title: values.title,
          folderId: values.folderId,
          deadline: values.deadline ? Timestamp.fromDate(values.deadline) : null,
        };

        if (task) {
          const taskRef = doc(db, 'users', userId, 'tasks', task.id);
          await updateDoc(taskRef, data);
          toast({ title: 'Success', description: 'Task updated successfully.' });
        } else {
          await addDoc(collection(db, 'users', userId, 'tasks'), {
            ...data,
            userId,
            completed: false,
            order: Date.now(),
            createdAt: serverTimestamp(),
          });
          toast({ title: 'Success', description: 'Task created successfully.' });
        }
        form.reset();
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
  
  const handleDelete = () => {
    if (!task || !userId) return;

    startDeleteTransition(async () => {
      try {
        await deleteTask(task.id, userId);
        toast({ title: 'Task deleted', description: `The task "${task.title}" has been removed.` });
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: 'destructive', title: 'Error deleting task', description: message });
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
    <>
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
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Deadline (Optional)</FormLabel>
                <FormControl>
                  <DateTimePicker field={field} />
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
      {task && (
        <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Deleting a task is a permanent action and cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">Delete Task</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This will permanently delete the task: <strong>{task.title}</strong>. This action cannot be undone.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? 'Deleting...' : 'Yes, delete task'}
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      )}
    </>
  );
}
