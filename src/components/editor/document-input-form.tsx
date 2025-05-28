
'use client';

import type * as React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanSearch, FileText, UploadCloud } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from "@/hooks/use-toast";

interface DocumentInputFormProps {
  onAnalyze: (documentText: string, valeRules: string) => Promise<void>;
  isLoading: boolean;
}

export function DocumentInputForm({ onAnalyze, isLoading }: DocumentInputFormProps) {
  const [documentText, setDocumentText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim()) {
      toast({
        title: "Empty Document",
        description: "Please enter some document text or upload a file to analyze.",
        variant: "destructive",
      });
      return;
    }
    // Pass an empty string for valeRules, backend will use default.
    onAnalyze(documentText, "");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFileName(null); // Reset on new file selection
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        setDocumentText(text);
        setUploadedFileName(file.name);
        toast({
          title: "File Loaded",
          description: `Content of "${file.name}" loaded into the textarea.`,
        });
      };
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: `Could not read the file "${file.name}".`,
          variant: "destructive",
        });
        setUploadedFileName(null);
      }
      reader.readAsText(file);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6 text-primary" />
          Document Input
        </CardTitle>
        <CardDescription>
          Paste your document content or upload a file for analysis. The system uses a pre-configured set of Vale rules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentFileUpload" className="text-base font-medium">
              Upload Document File (optional)
            </Label>
            <div className="flex items-center gap-2">
                <Input
                  id="documentFileUpload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt,.md,.markdown,.html,.htm"
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20
                    cursor-pointer
                  "
                  aria-label="Upload document file"
                />
            </div>
            {uploadedFileName && (
              <p className="text-xs text-muted-foreground mt-1">
                Loaded: <span className="font-medium">{uploadedFileName}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentText" className="text-base font-medium">
              Document Content {uploadedFileName ? "(from file)" : "(paste or type here)"}
            </Label>
            <Textarea
              id="documentText"
              value={documentText}
              onChange={(e) => {
                setDocumentText(e.target.value);
                // If user types, it's no longer purely from the uploaded file
                if (uploadedFileName) setUploadedFileName(null); 
              }}
              placeholder="Paste your text, Markdown, or HTML here, or upload a file above..."
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
