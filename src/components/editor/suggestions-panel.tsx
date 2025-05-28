'use client';

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Lightbulb, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CheckDocumentOutput } from '@/ai/flows/vale-rule-integration';

type ErrorItem = CheckDocumentOutput['errors'][0];

interface SuggestionsPanelProps {
  errors: ErrorItem[] | undefined;
  onSuggestionSelect: (error: ErrorItem) => void;
  selectedErrorId: string | null;
}

export function SuggestionsPanel({ errors, onSuggestionSelect, selectedErrorId }: SuggestionsPanelProps) {
  const getErrorId = (error: ErrorItem) => `error-${error.line}-${error.start}`;

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lightbulb className="h-6 w-6 text-accent" />
          Suggestions & Rules
        </CardTitle>
        <CardDescription>
          {errors && errors.length > 0 ? `${errors.length} issues found. Click an issue to see it in the document.` : "No issues found, or analysis not yet run."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4 pt-0">
          {errors && errors.length > 0 ? (
            <ul className="space-y-3">
              {errors.map((error, index) => {
                const errorId = getErrorId(error);
                const isSelected = selectedErrorId === errorId;
                return (
                  <li key={index}>
                    <button
                      onClick={() => onSuggestionSelect(error)}
                      className={cn(
                        "w-full text-left p-3 rounded-md border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary",
                        isSelected ? "bg-primary/10 border-primary shadow-md" : "bg-card hover:bg-muted/50",
                        "dark:focus:ring-primary"
                      )}
                      aria-current={isSelected ? "true" : "false"}
                      aria-label={`Select error: ${error.message}`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className={cn("h-5 w-5 mt-0.5 shrink-0", isSelected ? "text-primary" : "text-destructive")} />
                        <div className="flex-1">
                          <p className={cn("font-semibold text-sm", isSelected ? "text-primary" : "text-foreground")}>
                            {error.message}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Gavel className="h-3 w-3" />
                            <span>Rule: {error.ruleId} (Line: {error.line}, Pos: {error.start+1})</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <Lightbulb className="h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium">Ready for Analysis</p>
              <p className="text-sm">
                Once you analyze a document, suggestions and rule violations will appear here.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
