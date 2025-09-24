'use client';

import React from 'react';
import { useTransition } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';
import { Bolt, ChevronDown, ImagePlus, Mic, Plus, Loader2 } from 'lucide-react';
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
import { collection, query, where, writeBatch, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Folder, Task } from '@/types';
import { importTasksFromImage } from '@/app/actions/ocr';
import { usePathname } from 'next/navigation';
import { Input } from '../ui/input';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { cn } from '@/lib/utils';

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
            const result = await importTasksFromImage(formData);
            if (result.success && result.tasks) {
                const batch = writeBatch(db);
                const tasksRef = collection(db, 'users', user!.uid, 'tasks');
                result.tasks.forEach(title => {
                    if (title.trim()) {
                        const newDocRef = doc(tasksRef);
                        batch.set(newDocRef, {
                            title: title.trim(),
                            description: 'Imported from image',
                            completed: false,
                            folderId: currentFolderId,
                            userId: user!.uid,
                            order: Date.now(),
                            createdAt: serverTimestamp(),
                        });
                    }
                });

                await batch.commit();
                toast({ title: 'Import successful', description: `${result.tasks.length} tasks were imported.` });
                setIsOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Import failed', description: result.error });
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
                    <p className='text-sm text-muted-foreground'>Select an image file containing a list of your tasks. We'll use AI to extract them.</p>
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

function ImportFromVoiceSheet({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleTranscription;
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access the microphone. Please check your browser permissions.' });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const handleTranscription = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const currentFolderId = pathname.split('/folders/')[1];
      if (!currentFolderId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a folder first.' });
        setIsTranscribing(false);
        return;
      }

      try {
        const taskTitles = await transcribeAudio({ audioDataUri: base64Audio });
        if (taskTitles && taskTitles.length > 0) {
            const batch = writeBatch(db);
            const tasksRef = collection(db, 'users', user!.uid, 'tasks');
            taskTitles.forEach(title => {
                if (title.trim()) {
                    const newDocRef = doc(tasksRef);
                    batch.set(newDocRef, {
                        title: title.trim(),
                        description: 'Imported from voice',
                        completed: false,
                        folderId: currentFolderId,
                        userId: user!.uid,
                        order: Date.now(),
                        createdAt: serverTimestamp(),
                    });
                }
            });
            await batch.commit();
            toast({ title: 'Import successful', description: `${taskTitles.length} tasks were imported.` });
            setIsOpen(false);
        } else {
            toast({ title: 'No tasks found', description: "We couldn't detect any tasks in your recording." });
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Transcription failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
      } finally {
        setIsTranscribing(false);
      }
    };
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Import Tasks from Voice</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <p className="text-center text-sm text-muted-foreground">
                {isRecording ? "Recording your tasks... Click to stop." : "Click the button and speak your tasks."}
            </p>
            <Button
                size="icon"
                className="h-24 w-24 rounded-full"
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isTranscribing}
            >
                {isTranscribing ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                    <Mic className="h-10 w-10" />
                )}
            </Button>
            {isTranscribing && <p className="text-sm text-muted-foreground">Transcribing your audio...</p>}
        </div>
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
      const userTasksSnapshot = await getDocs(query(collection(db, 'users', user.uid, 'tasks'), where('completed', '==', false)));
      
      const userTasks = userTasksSnapshot.docs.map(doc => {
        const data = doc.data() as Task;
        return { 
            id: doc.id,
            title: data.title,
            description: data.description || ''
        };
      });

      try {
        toast({ title: 'Prioritizing Tasks...', description: 'Our AI is re-ordering your tasks for optimal productivity.' });
        const prioritizedTasks = await runTaskPrioritization(userTasks);
        
        const batch = writeBatch(db);
        prioritizedTasks.forEach((task: any, index: number) => {
            if(task.id) {
                const taskRef = doc(db, 'users', user!.uid, 'tasks', task.id);
                batch.update(taskRef, { order: index });
            }
        });
        await batch.commit();

        toast({ title: 'Tasks Prioritized!', description: 'Your tasks have been successfully re-ordered.' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
          variant: 'destructive',
          title: 'Error Prioritizing Tasks',
          description: (
            <div className="mt-2 w-full overflow-auto rounded-md bg-destructive-foreground/10 p-2">
                <code className="text-xs text-destructive-foreground whitespace-pre-wrap">
                    {errorMessage}
                </code>
            </div>
          )
        });
      }
    });
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrioritize}
          disabled={isPrioritizing}
        >
          <Bolt className={cn("mr-2 h-4 w-4", isPrioritizing && "animate-spin")} />
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
            
            <ImportFromVoiceSheet>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Mic className="mr-2 h-4 w-4" />
                <span>Import from Voice</span>
              </DropdownMenuItem>
            </ImportFromVoiceSheet>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
