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
import { addDoc, collection, doc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, set } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';


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
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      field.onChange(undefined);
      return;
    }
    const now = new Date();
    const newDate = new Date(date);
    // Preserve existing time if a date is already set, otherwise use current time
    const hours = field.value ? field.value.getHours() : now.getHours();
    const minutes = field.value ? field.value.getMinutes() : now.getMinutes();
    newDate.setHours(hours, minutes);
    field.onChange(newDate);

    if (isMobile) {
        // Keep dialog open on mobile to allow time selection
    } else {
        // Debounce closing to allow time input interaction
        setTimeout(() => setIsOpen(false), 100);
    }
  }

  const PickerContent = () => (
    <>
      <Calendar
        mode="single"
        selected={field.value}
        onSelect={handleSelect}
        disabled={(date) =>
          date < new Date(new Date().setHours(0, 0, 0, 0))
        }
        initialFocus
      />
      {field.value && (
        <div className="p-3 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Deadline Time</p>
            <Input
                type="time"
                value={format(field.value, "HH:mm")}
                onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = set(field.value!, { hours, minutes });
                    field.onChange(newDate);
                }}
            />
        </div>
      )}
      {isMobile && (
        <div className="p-3 border-t">
            <Button className="w-full" onClick={() => setIsOpen(false)}>Done</Button>
        </div>
      )}
    </>
  );

  if (isMobile) {
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
        <DialogContent className="w-auto p-0">
          <PickerContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <PickerContent />
      </PopoverContent>
    </Popover>
  );
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
  );
}
