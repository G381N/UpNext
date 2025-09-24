'use server';

import { autoPrioritizeTasks, type Task as AiTask } from '@/ai/flows/auto-prioritize-tasks';

export async function runTaskPrioritization(tasks: AiTask[]) {
  if (!tasks || tasks.length === 0) {
    return [];
  }
  try {
    const prioritizedTasks = await autoPrioritizeTasks(tasks);
    if (!prioritizedTasks) {
        throw new Error('AI prioritization returned no tasks.');
    }
    return prioritizedTasks;
  } catch (error) {
    console.error('Error prioritizing tasks:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(errorMessage);
  }
}
