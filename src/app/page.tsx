'use client';

import { useState, useRef, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { DocumentInputForm } from '@/components/editor/document-input-form';
import { HighlightedDocumentView } from '@/components/editor/highlighted-document-view';
import { SuggestionsPanel } from '@/components/editor/suggestions-panel';
import { checkDocument, type CheckDocumentInput, type CheckDocumentOutput } from '@/ai/flows/vale-rule-integration';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';

type ErrorItem = CheckDocumentOutput['errors'][0];

export default function MechanicalEditorPage() {
  const [documentText, setDocumentText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<CheckDocumentOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const { toast } = useToast();

  const highlightedDocViewRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (docText: string, valeRules: string) => {
    setIsLoading(true);
    setDocumentText(docText); // Store the text being analyzed
    setAnalysisResult(null); // Clear previous results
    setSelectedErrorId(null);

    try {
      const input: CheckDocumentInput = {
        documentContent: docText,
        valeRules: valeRules,
      };
      const result = await checkDocument(input);
      setAnalysisResult(result);
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Analysis Complete",
          description: `${result.errors.length} issues found. Corrected document preview updated.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "No issues found!",
          variant: "default", // Using "default" which is less alarming than a green success often used for destructive actions
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorDomId = (error: ErrorItem) => `error-${error.line}-${error.start}`;

  const handleSuggestionSelect = (error: ErrorItem) => {
    const errorId = getErrorDomId(error);
    setSelectedErrorId(errorId);
    
    // Scroll to error
    // Add a small delay to ensure the DOM has updated with the selectedErrorId prop if necessary for styling changes.
    setTimeout(() => {
      const element = document.getElementById(errorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
         // Fallback if ID based scroll fails, try scrolling the container
        highlightedDocViewRef.current?.querySelector(`#${CSS.escape(errorId)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
  
  // Use the corrected document from analysis results for display if available, otherwise original.
  const displayedDocumentText = analysisResult?.correctedDocument ?? documentText;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Column: Inputs and Document View */}
          <div className="flex flex-col gap-6">
            <DocumentInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
            {isLoading && !analysisResult && (
               <div className="flex justify-center items-center min-h-[200px] bg-card p-4 rounded-md shadow-lg">
                 <LoadingSpinner size={48} text="Analyzing document, please wait..." />
               </div>
            )}
            {(!isLoading || analysisResult) && ( // Show document view if not initial loading OR if analysis is done
              <div ref={highlightedDocViewRef}>
                <HighlightedDocumentView
                  documentText={displayedDocumentText}
                  errors={analysisResult?.errors}
                  selectedErrorId={selectedErrorId}
                />
              </div>
            )}
          </div>

          {/* Right Column: Suggestions Panel */}
          <div className="lg:max-h-[calc(100vh-150px)]"> {/* Adjust max-height as needed for sticky header */}
             <SuggestionsPanel
                errors={analysisResult?.errors}
                onSuggestionSelect={handleSuggestionSelect}
                selectedErrorId={selectedErrorId}
              />
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        The Mechanical Editor &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
