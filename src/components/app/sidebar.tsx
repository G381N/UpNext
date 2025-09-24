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
  SidebarMenuAction,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  FolderPlus,
  PlusCircle,
  Settings,
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
import { cn } from '@/lib/utils';

function FolderSettingsSheet({ folder, children }: { folder: Folder, children: React.ReactNode }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild onClick={(e) => e.stopPropagation()}>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Folder Settings</SheetTitle>
                </SheetHeader>
                <FolderForm userId={user!.uid} folder={folder} onSuccess={() => setIsOpen(false)} />
            </SheetContent>
        </Sheet>
    )
}

function SidebarLogo() {
    const { toggleSidebar } = useSidebar();
    return (
      <button
        onClick={() => toggleSidebar()}
        className={cn(
          'flex w-full items-center gap-2 text-lg font-bold tracking-tight text-foreground'
        )}
      >
        <Logo />
      </button>
    );
}


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
        <SidebarLogo />
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
        <SidebarGroup className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarMenu>
            {loading && (
              <>
                <SidebarMenuButton className="h-8 animate-pulse rounded-md bg-muted" />
                <SidebarMenuButton className="h-8 animate-pulse rounded-md bg-muted" />
              </>
            )}
            {folders?.docs.map((doc) => {
              const folder = { id: doc.id, ...doc.data() } as Folder;
              const FolderIcon = getIcon(folder.icon);
              return (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/folders/${folder.id}`}
                    tooltip={{ children: folder.name, side: 'right' }}
                  >
                    <Link href={`/folders/${folder.id}`}>
                      <FolderIcon className="h-4 w-4" />
                      <span>{folder.name}</span>
                    </Link>
                  </SidebarMenuButton>
                   <FolderSettingsSheet folder={folder}>
                      <SidebarMenuAction showOnHover>
                          <Settings />
                      </SidebarMenuAction>
                  </FolderSettingsSheet>
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
