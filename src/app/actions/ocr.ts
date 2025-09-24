'use server';

import { db } from '@/lib/firebase/config';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';

// Helper to convert file to data URI
async function fileToDataURI(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function importTasksFromImage(formData: FormData, userId: string, folderId: string) {
    const file = formData.get('image') as File;

    if (!file) return { success: false, error: 'No image file provided.' };
    if (!userId) return { success: false, error: 'User not authenticated.' };
    if (!folderId) return { success: false, error: 'No folder selected.' };
    
    try {
        const imageDataUri = await fileToDataURI(file);
        const taskTitles = await extractTextFromImage({ imageDataUri });

        if (!taskTitles || taskTitles.length === 0) {
            return { success: true, count: 0, message: 'No text could be found in the image.' };
        }

        const batch = writeBatch(db);
        const tasksRef = collection(db, 'users', userId, 'tasks');

        taskTitles.forEach(title => {
            if (title.trim()) {
                const newDocRef = doc(tasksRef);
                batch.set(newDocRef, {
                    title: title.trim(),
                    description: 'Imported from image',
                    completed: false,
                    folderId,
                    userId,
                    order: Date.now(),
                    createdAt: serverTimestamp(),
                });
            }
        });

        await batch.commit();

        revalidatePath(`/folders/${folderId}`);

        return { success: true, count: taskTitles.length };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred during import.";
        console.error("Error importing from image:", message);
        return { success: false, error: message };
    }
}
