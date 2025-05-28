
'use client';

import type * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanSearch, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DocumentInputFormProps {
  onAnalyze: (documentText: string, valeRules: string) => Promise<void>;
  isLoading: boolean;
}

export function DocumentInputForm({ onAnalyze, isLoading }: DocumentInputFormProps) {
  const [documentText, setDocumentText] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim()) {
      // Optionally, add a toast notification here for empty document
      alert("Please enter some document text to analyze.");
      return;
    }
    // Pass an empty string for valeRules, backend will use default.
    onAnalyze(documentText, "");
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6 text-primary" />
          Document Input
        </CardTitle>
        <CardDescription>
          Paste your document content for analysis. The system uses a pre-configured set of Vale rules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentText" className="text-base font-medium">Document Content</Label>
            <Textarea
              id="documentText"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste your text, Markdown, or HTML here..."
              rows={10}
              className="min-h-[200px] text-sm leading-relaxed shadow-inner focus:ring-primary"
              aria-label="Document Content Input"
            />
          </div>
          <Button type="submit" disabled={isLoading || !documentText.trim()} className="w-full text-base py-3 shadow-md hover:shadow-lg transition-shadow">
            {isLoading ? (
              <LoadingSpinner size={20} className="mr-2" />
            ) : (
              <ScanSearch className="mr-2 h-5 w-5" />
            )}
            Analyze Document
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
