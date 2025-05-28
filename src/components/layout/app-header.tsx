import { FileCheck2 } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center gap-3">
        <FileCheck2 className="h-8 w-8" />
        <h1 className="text-2xl font-semibold tracking-tight">The Mechanical Editor</h1>
      </div>
    </header>
  );
}
