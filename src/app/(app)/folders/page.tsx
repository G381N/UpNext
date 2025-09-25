'use client';

import { Folder as FolderIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import type { Folder } from '@/types';

export default function FoldersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [folders, loading] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'folders'), where('userId', '==', user.uid)) : null
  );

  useEffect(() => {
    if (loading || !user) return;

    // Logic for redirection
    const redirect = async () => {
      // 1. Check for last used folder
      const lastUsedFolderId = localStorage.getItem('lastUsedFolderId');
      if (lastUsedFolderId) {
        // Check if the folder still exists
        const folderExists = folders?.docs.some(doc => doc.id === lastUsedFolderId);
        if (folderExists) {
            router.replace(`/folders/${lastUsedFolderId}`);
            return;
        } else {
            localStorage.removeItem('lastUsedFolderId');
        }
      }

      // 2. If only one folder exists, redirect to it
      if (folders?.docs.length === 1) {
        const singleFolderId = folders.docs[0].id;
        router.replace(`/folders/${singleFolderId}`);
        return;
      }
    };

    redirect();

  }, [folders, loading, router, user]);
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="rounded-full bg-secondary p-6">
        <FolderIcon className="h-16 w-16 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">Select a folder</h2>
      <p className="mt-2 max-w-xs text-muted-foreground">
        Choose a folder from the sidebar to view its tasks, or create a new
        folder to get started.
      </p>
    </div>
  );
}
