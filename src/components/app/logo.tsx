'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { CheckSquare } from 'lucide-react';

export function Logo({ className, iconClassName, showText = true }: { className?: string, iconClassName?: string, showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 text-lg font-bold tracking-tight text-foreground', className)}>
      <CheckSquare className={cn("h-6 w-6 text-primary", iconClassName)} />
      {showText && <span className="text-xl font-headline">NextUp</span>}
    </div>
  );
}
