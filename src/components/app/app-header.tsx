'use client';

import React from 'react';
import { useTransition } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';
import { Bolt, ChevronDown, ImagePlus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { runTaskPrioritization } from '@/app/actions/prioritize';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { TaskForm } from './task-form';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Folder } from '@/types';
import { importTasksFromImage } from '@/app/actions/ocr';
import { usePathname } from 'next/navigation';
import { Input } from '../ui/input';

function ImportTasksSheet({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const formRef = React.useRef<HTMLFormElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImport = (formData: FormData) => {
        const currentFolderId = pathname.split('/folders/')[1];
        if (!currentFolderId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a folder first.' });
            return;
        }

        startTransition(async () => {
            const { success, error, count } = await importTasksFromImage(formData, user!.uid, currentFolderId);
            if (success) {
                toast({ title: 'Import successful', description: `${count} tasks were imported.` });
                setIsOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Import failed', description: error });
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Import Tasks from Image</SheetTitle>
                </SheetHeader>
                <form ref={formRef} action={handleImport} className="space-y-6 py-6">
                    <p className='text-sm text-muted-foreground'>Select an image file containing a list of your tasks. We'll use OCR to extract them.</p>
                     <Input
                        ref={fileInputRef}
                        type="file"
                        name="image"
                        accept="image/*"
                        required
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Importing...' : 'Import Tasks'}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}


export default function AppHeader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPrioritizing, startTransition] = useTransition();
  const [isTaskSheetOpen, setIsTaskSheetOpen] = React.useState(false);
  
  const [folders] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'folders'), where('userId', '==', user.uid)) : null
  );

  const handlePrioritize = () => {
    if (!user) return;
    startTransition(async () => {
      try {
        toast({ title: 'Prioritizing Tasks...', description: 'Our AI is re-ordering your tasks for optimal productivity.' });
        await runTaskPrioritization(user.uid);
        toast({ title: 'Tasks Prioritized!', description: 'Your tasks have been successfully re-ordered.' });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to prioritize tasks.',
        });
      }
    });
  };

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrioritize}
          disabled={isPrioritizing}
        >
          <Bolt className="mr-2 h-4 w-4 animate-pulse" />
          {isPrioritizing ? 'Prioritizing...' : 'Prioritize'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              New
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Sheet open={isTaskSheetOpen} onOpenChange={setIsTaskSheetOpen}>
              <SheetTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Task</span>
                </DropdownMenuItem>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Create a new task</SheetTitle>
                </SheetHeader>
                <TaskForm
                  userId={user!.uid}
                  onSuccess={() => setIsTaskSheetOpen(false)}
                  folders={folders?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder)) || []}
                />
              </SheetContent>
            </Sheet>
            
            <ImportTasksSheet>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    <span>Import from Image</span>
                </DropdownMenuItem>
            </ImportTasksSheet>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
