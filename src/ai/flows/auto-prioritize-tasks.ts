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
  prompt: `You are an AI task prioritization expert.

Given the following list of tasks, reorder them to prioritize the fastest and easiest tasks first, while also considering their importance. The goal is to complete significant tasks quickly and build momentum.

Tasks:
{{#each this}}
- ID: {{id}}, Title: {{title}}, Description: {{description}}
{{/each}}

Return the tasks in the order they should be completed, starting with the highest priority (quickest, easiest, most important) task. You must return all fields for each task, including the ID. Do not modify the tasks, only reorder them.`,
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
