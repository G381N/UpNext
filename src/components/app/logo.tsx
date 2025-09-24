'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-lg font-bold tracking-tight text-foreground', className)}>
      {/* Using a standard img tag for debugging purposes. */}
      <img src="/logo.png" alt="NextUp Logo" width="48" height="48" />
      <span className="text-xl font-headline">NextUp</span>
    </div>
  );
}
