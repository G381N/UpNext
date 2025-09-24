'use server';

import { db } from '@/lib/firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { iconNames } from '@/lib/icons';

const folderSchema = z.object({
  name: z.string().min(1, 'Folder name is required.'),
  icon: z.string().refine((val) => iconNames.includes(val), 'Invalid icon.'),
});

export async function createFolder(
  userId: string,
  values: z.infer<typeof folderSchema>
) {
  try {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const validatedValues = folderSchema.parse(values);

    await addDoc(collection(db, 'users', userId, 'folders'), {
      ...validatedValues,
      userId,
      createdAt: serverTimestamp(),
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Error creating folder:", message);
    return { success: false, error: message };
  }
}

export async function updateFolder(
  folderId: string,
  userId: string,
  values: z.infer<typeof folderSchema>
) {
  try {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const validatedValues = folderSchema.parse(values);
    const folderRef = doc(db, 'users', userId, 'folders', folderId);

    await updateDoc(folderRef, validatedValues);

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Error updating folder:", message);
    return { success: false, error: message };
  }
}

export async function deleteFolder(folderId: string, userId: string) {
    try {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        
        const folderRef = doc(db, 'users', userId, 'folders', folderId);
        await deleteDoc(folderRef);

        // Note: This should also delete all tasks within the folder.
        // This is a simplified version. A robust implementation would use a transaction or a cloud function.

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Error deleting folder:", message);
        return { success: false, error: message };
    }
}
