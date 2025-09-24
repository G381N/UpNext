'use server';

import { autoPrioritizeTasks, type Task as AiTask } from '@/ai/flows/auto-prioritize-tasks';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, writeBatch, doc, query } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

type FirestoreTask = {
  id: string;
  title: string;
  description?: string;
  folderId?: string;
}

export async function runTaskPrioritization(userId: string) {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef);
    const tasksSnapshot = await getDocs(q);

    if (tasksSnapshot.empty) {
      return { success: true, message: 'No tasks to prioritize.' };
    }
    
    const userTasks: AiTask[] = tasksSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            folderId: data.folderId || '',
            order: data.order || 0
        }
    });

    const prioritizedTasks = await autoPrioritizeTasks(userTasks);

    if (!prioritizedTasks || prioritizedTasks.length === 0) {
        throw new Error('AI prioritization returned no tasks.');
    }
    
    const batch = writeBatch(db);
    prioritizedTasks.forEach((task, index) => {
      if(task.id) {
        const taskRef = doc(db, 'users', userId, 'tasks', task.id);
        batch.update(taskRef, { order: index });
      }
    });

    await batch.commit();

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error prioritizing tasks:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
