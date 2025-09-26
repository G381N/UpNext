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
  deadline: z.string().optional(),
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
  prompt: `You are an AI assistant that specializes in smart task prioritization. Your goal is to create a productive task order that helps users build momentum and get things done in the shortest time possible, while respecting deadlines.

Analyze the following list of tasks. For each task, first estimate the time it would take to complete (e.g., 5 mins, 2 hours, 1 day).

Your prioritization strategy is as follows:

1.  **Quick Wins First (Momentum Builders)**: Identify any tasks that are very small and can be completed in under 15 minutes (e.g., "reply to an email," "make a quick call," "switch on lights"). These should be placed at the very top of the list to get them out of the way and build momentum.
2.  **Urgent & Important Deadlines**: After the quick wins, identify tasks with the most urgent deadlines. Order them by which is due soonest. If a task's deadline is extremely close (e.g., within the next few hours), it might need to be prioritized even before some quick wins, but use your judgment based on its estimated completion time. A 2-hour task due in 3 hours is more critical than a 5-minute task with no deadline.
3.  **Logical Flow & Importance (Remaining Tasks)**: For the remaining tasks, order them based on a logical workflow and perceived importance. If a task seems like a blocker for others, it should come first. The goal is to avoid "starvation" where smaller but important tasks are perpetually pushed down by larger ones. Create a balance that allows the user to tackle a mix of tasks to maintain productivity.
4.  **Final Review**: The final list should feel balanced and be the most efficient path to completion for the entire list.

Current time for reference: ${new Date().toISOString()}

Here is the list of tasks to prioritize:
{{#each this}}
- ID: {{id}}, Title: {{title}}, Deadline: {{#if deadline}}{{deadline}}{{else}}None{{/if}}
{{/each}}

Return the full, reordered list of tasks. You MUST return all original fields for each task, especially the 'id'. Do not add, remove, or modify any tasks; only change their order. Your final output must be only the array of task objects.`,
});

const autoPrioritizeTasksFlow = ai.defineFlow(
  {
    name: 'autoPrioritizeTasksFlow',
    inputSchema: AutoPrioritizeTasksInputSchema,
    outputSchema: AutoPrioritizeTasksOutputSchema,
  },
  async (input) => {
    if (!input || input.length === 0) {
      return [];
    }
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
