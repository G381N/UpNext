import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Folder } from '@/types';
import TaskList from '@/components/app/task-list';
import { notFound } from 'next/navigation';
import { getIcon } from '@/lib/icons';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FolderCog } from 'lucide-react';
import { FolderForm } from '@/components/app/folder-form';

async function getFolderData(userId: string, folderId: string): Promise<Folder | null> {
    // For now, we can't get userId on the server easily without the admin SDK.
    // This component will need to be a client component to get user from useAuth
    // Or we need a server-side auth solution.
    // For this implementation, we will assume a client component.
    // However, the prompt favors server components. So let's imagine we can get the user.
    // A real app would use Firebase Admin SDK in a server route or check session cookies.
    // This function will not work as is without a way to get the current user's ID securely on the server.
    // I'll rewrite this as a client component.
  return null;
}

// Rewriting as a client component to handle auth and data fetching
'use client'
import { useAuth } from '@/hooks/use-auth';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function FolderPage({ params }: { params: { folderId: string } }) {
  const { user } = useAuth();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = React.useState(false);

  useEffect(() => {
    if (user && params.folderId) {
      const fetchFolder = async () => {
        setLoading(true);
        const folderRef = doc(db, 'users', user.uid, 'folders', params.folderId);
        const folderSnap = await getDoc(folderRef);
        if (folderSnap.exists()) {
          setFolder({ id: folderSnap.id, ...folderSnap.data() } as Folder);
        } else {
          notFound();
        }
        setLoading(false);
      };
      fetchFolder();
    }
  }, [user, params.folderId]);

  if (loading || !folder) {
    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-9 w-24" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
  }
  
  const FolderIcon = getIcon(folder.icon);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FolderIcon className="h-8 w-8 text-muted-foreground" />
          <h1 className="font-headline text-3xl font-bold tracking-tight">{folder.name}</h1>
        </div>
        <Sheet open={isSettingsSheetOpen} onOpenChange={setIsSettingsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderCog className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Folder Settings</SheetTitle>
            </SheetHeader>
            <FolderForm userId={user!.uid} folder={folder} onSuccess={() => setIsSettingsSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <TaskList folderId={params.folderId} />
    </div>
  );
}
