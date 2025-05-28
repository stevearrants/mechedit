
'use client';

import type * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Added Input for file upload
import { ScanSearch, FileText, FileUp } from 'lucide-react'; // Replaced ListChecks with FileUp
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DocumentInputFormProps {
  onAnalyze: (documentText: string, valeRules: string) => Promise<void>;
  isLoading: boolean;
}

export function DocumentInputForm({ onAnalyze, isLoading }: DocumentInputFormProps) {
  const [documentText, setDocumentText] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim()) {
      // Optionally, add a toast notification here for empty document
      alert("Please enter some document text to analyze.");
      return;
    }

    let valeRulesContent = "";
    if (selectedFiles && selectedFiles.length > 0) {
      const filePromises = Array.from(selectedFiles).map(file => {
        if (file.type === 'text/yaml' || file.name.endsWith('.yml') || file.name.endsWith('.yaml')) {
          return file.text();
        }
        // Handle incorrect file type, though 'accept' attribute should help
        alert(`File "${file.name}" is not a YAML file and will be ignored.`);
        return Promise.resolve(""); // Ignore non-YAML files
      });
      try {
        const fileContents = await Promise.all(filePromises);
        // Filter out any empty strings from ignored files
        valeRulesContent = fileContents.filter(content => content.trim() !== "").join("\n\n---\n\n"); 
      } catch (error) {
        console.error("Error reading Vale rule files:", error);
        alert("Error reading one or more Vale rule files. Please ensure they are valid text files and try again.");
        return;
      }
    }
    
    onAnalyze(documentText, valeRulesContent);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6 text-primary" />
          Document Input
        </CardTitle>
        <CardDescription>
          Paste your document content and upload your Vale rule files for analysis.
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
            <Label htmlFor="valeRuleFiles" className="text-base font-medium flex items-center gap-1">
              <FileUp className="h-5 w-5 text-primary" />
              Upload Vale Rules (.yml/.yaml)
            </Label>
            <Input
              id="valeRuleFiles"
              type="file"
              accept=".yml,.yaml,text/yaml"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="shadow-inner focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              aria-label="Vale Rule Files Upload"
            />
             {selectedFiles && selectedFiles.length > 0 && (
              <p className="text-xs text-muted-foreground pt-1">
                {selectedFiles.length} file(s) selected: {Array.from(selectedFiles).map(f => f.name).join(', ')}
              </p>
            )}
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
