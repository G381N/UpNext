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
import { getIcon } from '@/lib/icons';

export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [folders, loading, error] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'folders'), where('userId', '==', user.uid)) : null
  );

  const [isFolderSheetOpen, setIsFolderSheetOpen] = React.useState(false);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = React.useState(false);


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
                  <FolderForm userId={user!.uid} onSuccess={() => setIsFolderSheetOpen(false)} />
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
              const FolderIcon = getIcon(folder.icon);
              return (
                <SidebarMenuItem key={folder.id}>
                  <Link href={`/folders/${folder.id}`}>
                    <SidebarMenuButton
                      isActive={pathname === `/folders/${folder.id}`}
                      asChild
                      size="sm"
                      tooltip={{ children: folder.name, side: 'right' }}
                    >
                      <div className="flex w-full items-center gap-2">
                        <FolderIcon />
                        <span>{folder.name}</span>
                      </div>
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
