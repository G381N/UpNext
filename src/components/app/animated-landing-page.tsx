'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import React from 'react';

// A component for the animated task list in the hero section
const AnimatedTaskList = () => {
  const tasks = [
    {
      title: 'Integrate new API for event',
      delay: '100ms',
      duration: '800ms',
      initial: 'translateX(-20px)',
      final: 'translateX(0)',
      order: 1,
      finalOrder: 2,
    },
    {
      title: 'Quick call with the design team',
      delay: '200ms',
      duration: '800ms',
      initial: 'translateX(-20px)',
      final: 'translateX(0)',
      order: 2,
      finalOrder: 1,
    },
    {
      title: 'Draft quarterly report',
      delay: '300ms',
      duration: '800ms',
      initial: 'translateX(-20px)',
      final: 'translateX(0)',
      order: 3,
      finalOrder: 4,
    },
    {
      title: 'Organize project files',
      delay: '400ms',
      duration: '800ms',
      initial: 'translateX(-20px)',
      final: 'translateX(0)',
      order: 4,
      finalOrder: 3,
    },
  ];

  return (
    <div className="mt-12 w-full max-w-md mx-auto">
      <div className="relative h-64 space-y-3">
        {tasks.map((task, index) => (
          <div
            key={index}
            style={
              {
                '--delay': task.delay,
                '--duration': task.duration,
                '--initial-transform': task.initial,
                '--final-transform': task.final,
                '--order': task.order,
                '--final-order': task.finalOrder,
              } as React.CSSProperties
            }
            className={cn(
              'group-data-[sorted=true]:order-[var(--final-order)] absolute w-full flex items-center gap-3 rounded-lg border bg-card p-3 shadow-md transition-all duration-1000 ease-in-out',
              'animate-fade-in-right',
              'group-data-[sorted=false]:animate-bob'
            )}
          >
            <div className="h-5 w-5 rounded-sm border-2 border-muted group-data-[sorted=true]:animate-check-fill" />
            <span className="text-sm font-medium text-card-foreground">{task.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnimatedLandingPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center justify-center text-center p-6 group"
      data-sorted="false"
      onMouseEnter={(e) => e.currentTarget.setAttribute('data-sorted', 'true')}
      onMouseLeave={(e) => e.currentTarget.setAttribute('data-sorted', 'false')}
    >
      <AnimatedTaskList />
      <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mt-8 mb-8">
        Prioritize your work with AI and get more done, faster.
      </p>
      <Button asChild size="lg">
        <Link href="/login">Get Started for Free</Link>
      </Button>
    </main>
  );
}
