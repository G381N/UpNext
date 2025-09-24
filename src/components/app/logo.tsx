import { cn } from '@/lib/utils';
import { Bolt } from 'lucide-react';
import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-lg font-bold tracking-tight text-foreground', className)}>
      <Bolt className="h-5 w-5 text-primary" />
      <span>NextUp</span>
    </div>
  );
}
