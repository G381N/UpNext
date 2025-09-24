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
import { IconPicker } from './icon-picker';
import { iconNames } from '@/lib/icons';
import { useTransition } from 'react';
import { createFolder, updateFolder } from '@/app/actions/folders';
import { useToast } from '@/hooks/use-toast';
import type { Folder } from '@/types';

const folderSchema = z.object({
  name: z.string().min(1, 'Folder name is required.'),
  icon: z.string().refine((val) => iconNames.includes(val), 'Invalid icon.'),
});

type FolderFormValues = z.infer<typeof folderSchema>;

interface FolderFormProps {
  userId: string;
  folder?: Folder;
  onSuccess?: () => void;
}

export function FolderForm({ userId, folder, onSuccess }: FolderFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: folder?.name || '',
      icon: folder?.icon || 'FileText',
    },
  });

  const onSubmit = (values: FolderFormValues) => {
    startTransition(async () => {
      try {
        if (folder) {
          const result = await updateFolder(folder.id, userId, values);
          if (result.success) {
            toast({ title: 'Success', description: 'Folder updated successfully.' });
          } else {
            throw new Error(result.error);
          }
        } else {
          const result = await createFolder(userId, values);
           if (result.success) {
            toast({ title: 'Success', description: 'Folder created successfully.' });
          } else {
            throw new Error(result.error);
          }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-6">
        <div className="flex items-center gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <IconPicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="sr-only">Folder Name</FormLabel>
                <FormControl>
                  <Input placeholder="Folder Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? 'Saving...'
            : folder
            ? 'Save Changes'
            : 'Create Folder'}
        </Button>
      </form>
    </Form>
  );
}
