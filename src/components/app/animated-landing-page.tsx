'use client';

import React, { useEffect, useState } from 'react';
import { Image, Mic, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const AnimatedLandingPage = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      () => setStep(1), // Initial state
      () => setStep(2), // Typing task
      () => setStep(3), // Voice and Image appear
      () => setStep(4), // Tasks from Voice and Image added
      () => setStep(5), // Prioritize button glows
      () => setStep(6), // Prioritizing animation
      () => setStep(7), // Sorted state
      () => setStep(0), // Loop back
    ];

    const timers = [
      100, // delay before start
      2000, // duration of typing
      1500, // duration for voice/image icons
      2000, // show new tasks
      1500, // show prioritize button
      2500, // prioritizing...
      4000, // show sorted list
      1000, // reset
    ];

    let currentStep = 0;
    const runSequence = () => {
      if (currentStep < sequence.length) {
        const timer = setTimeout(() => {
          sequence[currentStep]();
          currentStep++;
          runSequence();
        }, timers[currentStep]);
        return () => clearTimeout(timer);
      }
    };

    const cleanup = runSequence();
    return cleanup;
  }, []);

  const isVisible = (s: number) => step >= s;

  const tasks = [
    { id: 1, title: 'Draft quarterly report', initialOrder: 1, finalOrder: 4, type: 'typed', stepAdded: 2 },
    { id: 2, title: 'Quick call with the design team', initialOrder: 2, finalOrder: 1, type: 'voice', stepAdded: 4 },
    { id: 3, title: 'Integrate new API for event', initialOrder: 3, finalOrder: 3, type: 'image', stepAdded: 4 },
    { id: 4, title: 'Reply to support email', initialOrder: 4, finalOrder: 2, type: 'image', stepAdded: 4 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4">
      <div
        className="relative mx-auto flex min-h-[400px] w-full max-w-2xl flex-col items-center justify-start rounded-xl border-2 border-primary/10 bg-card shadow-2xl shadow-primary/5"
        data-step={step}
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
          </div>
          <div className="w-full max-w-[40%] rounded-md bg-secondary px-2 py-1 text-center text-sm text-muted-foreground">
            My Tasks
          </div>
          <div />
        </div>

        {/* Content */}
        <div className="w-full flex-1 p-4">
          <div className="relative space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all duration-1000',
                  'group-data-[step="7"]:order-[var(--final-order)]',
                  'opacity-0 translate-y-4',
                   isVisible(task.stepAdded) && 'animate-fade-in-up',
                )}
                style={{
                    '--initial-order': task.initialOrder,
                    '--final-order': task.finalOrder,
                    'animationDelay': isVisible(task.stepAdded) ? '0ms' : '10000ms',
                } as React.CSSProperties}
              >
                <div className={cn(
                    'h-5 w-5 flex-shrink-0 rounded-sm border-2 border-muted transition-all duration-500',
                    step === 7 && 'animate-check-fill-delayed'
                )}>
                </div>
                <span className="flex-1 text-sm font-medium text-card-foreground">
                  {task.id === 1 && step < 2 ? (
                    <span className="animate-typing">Draft quarterly report</span>
                  ) : (
                    task.title
                  )}
                </span>
                {step > 2 && step < 5 && (
                    <div className="opacity-0 group-data-[step='3']:animate-fade-in">
                        {task.type === 'voice' && <Mic className="h-4 w-4 text-muted-foreground" />}
                        {task.type === 'image' && <Image className="h-4 w-4 text-muted-foreground" />}
                        {task.type === 'typed' && <Plus className="h-4 w-4 text-muted-foreground" />}
                    </div>
                )}
                {step === 7 && (
                     <Check className="h-4 w-4 text-green-500 opacity-0 animate-fade-in" style={{animationDelay: `${task.finalOrder * 200 + 1000}ms`}}/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full border-t p-3 text-center">
            <div className={cn("transition-all duration-500", (step === 5 || step === 6) ? 'opacity-100' : 'opacity-0')}>
                {step < 6 ? (
                    <Button variant="outline" size="sm" className={cn(step === 5 && 'animate-glow-shadow-sm')}>
                        Prioritize with AI
                    </Button>
                ) : (
                    <span className="text-sm font-medium text-muted-foreground animate-pulse">
                        Prioritizing...
                    </span>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLandingPage;
