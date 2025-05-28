'use client';

import type * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanSearch, FileText, ListChecks } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DocumentInputFormProps {
  onAnalyze: (documentText: string, valeRules: string) => Promise<void>;
  isLoading: boolean;
}

const defaultValeRules = `StylesPath = .
MinAlertLevel = suggestion
Packages = Google

[*]
BasedOnStyles = Vale, Google`;

export function DocumentInputForm({ onAnalyze, isLoading }: DocumentInputFormProps) {
  const [documentText, setDocumentText] = useState<string>('');
  const [valeRules, setValeRules] = useState<string>(defaultValeRules);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim()) {
      // Optionally, add a toast notification here for empty document
      alert("Please enter some document text to analyze.");
      return;
    }
    onAnalyze(documentText, valeRules);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6 text-primary" />
          Document Input
        </CardTitle>
        <CardDescription>
          Paste your document content and provide Vale rules for analysis.
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
          <div className="space-y-2">
            <Label htmlFor="valeRules" className="text-base font-medium flex items-center gap-1">
              <ListChecks className="h-5 w-5" />
              Vale Rules (Optional)
            </Label>
            <Textarea
              id="valeRules"
              value={valeRules}
              onChange={(e) => setValeRules(e.target.value)}
              placeholder="Enter custom Vale rules here..."
              rows={5}
              className="font-mono text-xs min-h-[100px] shadow-inner focus:ring-primary"
              aria-label="Vale Rules Input"
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
