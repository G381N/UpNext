'use server';

import { db } from '@/lib/firebase/config';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// This is a placeholder for a real OCR implementation.
async function ocrFromFile(file: File): Promise<string[]> {
    console.log(`Simulating OCR for file: ${file.name}`);
    // In a real app, you would upload the file and send it to an OCR service (e.g., Google Cloud Vision).
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network and processing time
    
    // Return dummy text as if read from an image
    return [
        "First item from image",
        "Second item that was on the list",
        "A third, very important task",
        "Final task from the imported image",
    ];
}

export async function importTasksFromImage(formData: FormData, userId: string, folderId: string) {
    const file = formData.get('image') as File;

    if (!file) return { success: false, error: 'No image file provided.' };
    if (!userId) return { success: false, error: 'User not authenticated.' };
    if (!folderId) return { success: false, error: 'No folder selected.' };
    
    try {
        const taskTitles = await ocrFromFile(file);

        if (taskTitles.length === 0) {
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
