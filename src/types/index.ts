import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface User extends FirebaseUser {}

export type Folder = {
  id: string;
  name: string;
  icon: string;
  userId: string;
  createdAt: Timestamp;
};

export type Task = {
  id: string;
  title: string;
  deadline?: Timestamp;
  completed: boolean;
  folderId: string;
  userId: string;
  order: number;
  createdAt: Timestamp;
};
