'use server';

import { db } from '@/lib/firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required.'),
  description: z.string().optional(),
  folderId: z.string().min(1, 'Folder is required.'),
});

export async function createTask(
  userId: string,
  values: z.infer<typeof taskSchema>
) {
  if (!userId) throw new Error('User not authenticated');

  const validatedValues = taskSchema.parse(values);

  await addDoc(collection(db, 'users', userId, 'tasks'), {
    ...validatedValues,
    userId,
    completed: false,
    order: Date.now(),
    createdAt: serverTimestamp(),
  });

  revalidatePath(`/folders/${validatedValues.folderId}`);
}

export async function updateTask(
  taskId: string,
  userId: string,
  values: z.infer<typeof taskSchema>
) {
  if (!userId) throw new Error('User not authenticated');

  const validatedValues = taskSchema.parse(values);
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);

  await updateDoc(taskRef, validatedValues);

  revalidatePath(`/folders/${validatedValues.folderId}`);
  // If folderId changes, we might need to revalidate the old folder path too
}

export async function toggleTaskCompletion(taskId: string, userId: string, folderId: string) {
  if (!userId) throw new Error('User not authenticated');

  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) throw new Error('Task not found');
  
  const currentStatus = taskSnap.data().completed;
  await updateDoc(taskRef, { completed: !currentStatus });

  revalidatePath(`/folders/${folderId}`);
}


export async function deleteTask(taskId: string, userId:string, folderId: string) {
  if (!userId) throw new Error('User not authenticated');
  
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskRef);

  revalidatePath(`/folders/${folderId}`);
}
