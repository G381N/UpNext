'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Folder as FolderIcon,
  FolderPlus,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Folder } from '@/types';
import { Logo } from './logo';
import { UserNav } from './user-nav';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FolderForm } from './folder-form';
import { TaskForm } from './task-form';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';


export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [folders, loading, error] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'folders'), where('userId', '==', user.uid)) : null
  );

  const [isFolderSheetOpen, setIsFolderSheetOpen] = React.useState(false);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = React.useState(false);

  const handleCreateFolder = async (values: { name: string; icon: string; }) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a folder.' });
      return;
    }
    startTransition(async () => {
      try {
        await addDoc(collection(db, 'users', user.uid, 'folders'), {
          ...values,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Success', description: 'Folder created successfully.' });
        setIsFolderSheetOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: 'destructive', title: 'Error creating folder', description: message });
      }
    });
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      side="left"
      className="border-r"
    >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Sheet open={isTaskSheetOpen} onOpenChange={setIsTaskSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
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
            </SidebarMenuItem>
            <SidebarMenuItem>
               <Sheet open={isFolderSheetOpen} onOpenChange={setIsFolderSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Create a new folder</SheetTitle>
                  </SheetHeader>
                  <FolderForm userId={user!.uid} onSubmit={handleCreateFolder} isPending={isPending} />
                </SheetContent>
              </Sheet>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="flex-1 overflow-auto">
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarMenu>
            {loading && (
              <>
                <SidebarMenuButton size="sm" className="h-8 animate-pulse rounded-md bg-muted" />
                <SidebarMenuButton size="sm" className="h-8 animate-pulse rounded-md bg-muted" />
              </>
            )}
            {folders?.docs.map((doc) => {
              const folder = { id: doc.id, ...doc.data() } as Folder;
              return (
                <SidebarMenuItem key={folder.id}>
                  <Link href={`/folders/${folder.id}`} passHref>
                    <SidebarMenuButton
                      isActive={pathname === `/folders/${folder.id}`}
                      asChild
                      size="sm"
                      tooltip={{ children: folder.name, side: 'right' }}
                    >
                      <span>
                        <FolderIcon />
                        <span>{folder.name}</span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
