import { Folder } from 'lucide-react';

export default function FoldersPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="rounded-full bg-secondary p-6">
        <Folder className="h-16 w-16 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">Select a folder</h2>
      <p className="mt-2 max-w-xs text-muted-foreground">
        Choose a folder from the sidebar to view its tasks, or create a new
        folder to get started.
      </p>
    </div>
  );
}
