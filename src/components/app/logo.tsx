'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { CheckSquare } from 'lucide-react';

export function Logo({ className, iconClassName }: { className?: string, iconClassName?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-lg font-bold tracking-tight text-foreground', className)}>
      <CheckSquare className={cn("h-8 w-8 text-primary", iconClassName)} />
      <span className="text-xl font-headline">NextUp</span>
    </div>
  );
}
