'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-lg font-bold tracking-tight text-foreground', className)}>
      <Image src="https://picsum.photos/seed/logo/32/32" alt="NextUp Logo" width={32} height={32} />
      <span className="text-xl font-headline">NextUp</span>
    </div>
  );
}
