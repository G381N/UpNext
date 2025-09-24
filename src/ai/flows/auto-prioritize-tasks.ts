// src/ai/flows/auto-prioritize-tasks.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically prioritizing tasks based on their descriptions.
 *
 * - autoPrioritizeTasks - A function that accepts an array of tasks and returns the prioritized array.
 * - AutoPrioritizeTasksInput - The input type for the autoPrioritizeTasks function.
 * - AutoPrioritizeTasksOutput - The return type for the autoPrioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  folderId: z.string().optional(),
  order: z.number().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

const AutoPrioritizeTasksInputSchema = z.array(TaskSchema);
export type AutoPrioritizeTasksInput = z.infer<typeof AutoPrioritizeTasksInputSchema>;

const AutoPrioritizeTasksOutputSchema = z.array(TaskSchema);
export type AutoPrioritizeTasksOutput = z.infer<typeof AutoPrioritizeTasksOutputSchema>;

export async function autoPrioritizeTasks(input: AutoPrioritizeTasksInput): Promise<AutoPrioritizeTasksOutput> {
  return autoPrioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: AutoPrioritizeTasksInputSchema},
  output: {schema: AutoPrioritizeTasksOutputSchema},
  prompt: `You are an AI assistant that specializes in smart task prioritization. Your goal is to create a productive task order that helps users build momentum.

Analyze the following list of tasks. Your prioritization strategy is as follows:

1.  First, identify any tasks that are very small and can be completed quickly (e.g., "reply to an email", "make a quick call"). These should be placed at the very top of the list to get them out of the way.
2.  Next, identify the most important and high-priority tasks (e.g., tasks with deadlines, critical project work like "Integrate a new API for an event"). These should come right after the quick wins.
3.  Finally, order the remaining tasks based on a logical flow.

Here is the list of tasks:
{{#each this}}
- ID: {{id}}, Title: {{title}}, Description: {{description}}
{{/each}}

Return the full, reordered list of tasks. You MUST return all original fields for each task, especially the 'id'. Do not add, remove, or modify any tasks; only change their order.`,
});

const autoPrioritizeTasksFlow = ai.defineFlow(
  {
    name: 'autoPrioritizeTasksFlow',
    inputSchema: AutoPrioritizeTasksInputSchema,
    outputSchema: AutoPrioritizeTasksOutputSchema,
  },
  async (input) => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
