'use client';

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CheckDocumentOutput } from '@/ai/flows/vale-rule-integration'; // Assuming this type is correctly exported

type ErrorItem = CheckDocumentOutput['errors'][0];

interface HighlightedDocumentViewProps {
  documentText: string;
  errors: ErrorItem[] | undefined;
  selectedErrorId: string | null;
  onScrollToError?: (elementId: string) => void;
}

export function HighlightedDocumentView({
  documentText,
  errors,
  selectedErrorId,
}: HighlightedDocumentViewProps) {
  if (!documentText && (!errors || errors.length === 0)) {
    return (
      <Card className="shadow-lg flex-1">
        <CardHeader>
          <CardTitle className="text-xl">Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Enter some text and click "Analyze Document" to see results here.</p>
        </CardContent>
      </Card>
    );
  }

  const renderDocumentWithHighlights = () => {
    const lines = documentText.split('\n');
    return lines.map((lineContent, lineIndex) => {
      const lineNumber = lineIndex + 1; // 1-indexed line numbers
      let currentPos = 0;
      const parts: React.ReactNode[] = [];
      
      const lineErrors = (errors || [])
        .filter(e => e.line === lineNumber)
        .sort((a, b) => a.start - b.start);

      lineErrors.forEach(error => {
        // Ensure start and end are within line bounds, and start <= end
        const errorStart = Math.max(0, Math.min(error.start, lineContent.length));
        const errorEnd = Math.max(errorStart, Math.min(error.end, lineContent.length));

        if (errorStart > currentPos) {
          parts.push(<span key={`text-${lineNumber}-${currentPos}`}>{lineContent.substring(currentPos, errorStart)}</span>);
        }
        
        const errorId = `error-${error.line}-${error.start}`;
        const isSelected = selectedErrorId === errorId;

        parts.push(
          <mark
            key={errorId}
            id={errorId}
            className={`p-0.5 rounded-sm transition-all duration-300 ease-in-out
              ${isSelected ? 'ring-2 ring-offset-1 ring-destructive shadow-md' : ''}`}
            style={{ 
              backgroundColor: 'hsl(var(--destructive) / 0.2)',
              color: 'hsl(var(--destructive-foreground))', // Ensure text is readable on highlight
             }}
            role="button"
            tabIndex={0}
            aria-label={`Error: ${error.message}`}
          >
            {lineContent.substring(errorStart, errorEnd)}
          </mark>
        );
        currentPos = errorEnd;
      });

      if (currentPos < lineContent.length) {
        parts.push(<span key={`text-${lineNumber}-${currentPos}-end`}>{lineContent.substring(currentPos)}</span>);
      }
      
      // For empty lines, ensure they take up space and are identifiable
      return (
        <div key={lineNumber} className="whitespace-pre-wrap min-h-[1.5em]"> {/* min-h ensures visibility */}
          {parts.length > 0 ? parts : <span className="opacity-50 select-none">&nbsp;</span>}
        </div>
      );
    });
  };

  return (
    <Card className="shadow-lg flex-1">
      <CardHeader>
        <CardTitle className="text-xl">Analyzed Document</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none dark:prose-invert bg-card-foreground/5 p-4 rounded-md shadow-inner max-h-[600px] overflow-y-auto">
        {renderDocumentWithHighlights()}
      </CardContent>
    </Card>
  );
}
