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

const estimateTaskDurationTool = ai.defineTool({
  name: 'estimateTaskDuration',
  description: 'Estimates the duration and complexity of a task based on its description.',
  inputSchema: z.object({
    taskDescription: z.string().describe('The description of the task.'),
  }),
  outputSchema: z.number().describe('Estimated duration of the task in minutes.'),
}, async (input) => {
  // Placeholder implementation for estimating task duration.
  // In a real application, this would use an AI model to analyze the task description.
  // and estimate the duration.
  // This example returns a random number between 15 and 60 minutes.
  return Math.floor(Math.random() * (60 - 15 + 1)) + 15;
});

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  tools: [estimateTaskDurationTool],
  input: {schema: AutoPrioritizeTasksInputSchema},
  output: {schema: AutoPrioritizeTasksOutputSchema},
  prompt: `You are an AI task prioritization expert.

Given the following list of tasks, reorder them based on estimated duration and complexity, suggesting the most efficient next task to complete first. Use the estimateTaskDuration tool to estimate the duration of each task.

Tasks:
{{#each this}}
- ID: {{id}}, Title: {{title}}, Description: {{description}}
{{/each}}

Return the tasks in the order they should be completed, starting with the most efficient task.

Output:
{{#each this}}
- ID: {{id}}, Title: {{title}}, Description: {{description}}
{{/each}}`,
});

const autoPrioritizeTasksFlow = ai.defineFlow(
  {
    name: 'autoPrioritizeTasksFlow',
    inputSchema: AutoPrioritizeTasksInputSchema,
    outputSchema: AutoPrioritizeTasksOutputSchema,
  },
  async input => {
    // Use the prompt to reorder the tasks
    const {output} = await prioritizeTasksPrompt(input);

    // Sort the tasks based on estimated duration (shortest first)
    output!.sort((a, b) => {
      // TODO: Get durations from tool calls instead of re-calling the tool.
      const durationA = estimateTaskDurationTool({taskDescription: a.description || ''});
      const durationB = estimateTaskDurationTool({taskDescription: b.description || ''});
      return durationA - durationB;
    });

    return output!;
  }
);
