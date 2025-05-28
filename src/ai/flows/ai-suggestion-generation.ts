'use server';

/**
 * @fileOverview AI-driven suggestions for improving writing quality.
 *
 * - generateAiSuggestions - A function that generates AI suggestions for improving writing.
 * - AiSuggestionInput - The input type for the generateAiSuggestions function.
 * - AiSuggestionOutput - The return type for the generateAiSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSuggestionInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to analyze and improve.'),
});
export type AiSuggestionInput = z.infer<typeof AiSuggestionInputSchema>;

const AiSuggestionOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of AI-driven suggestions for improving the writing.'),
});
export type AiSuggestionOutput = z.infer<typeof AiSuggestionOutputSchema>;

export async function generateAiSuggestions(
  input: AiSuggestionInput
): Promise<AiSuggestionOutput> {
  return aiSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSuggestionPrompt',
  input: {schema: AiSuggestionInputSchema},
  output: {schema: AiSuggestionOutputSchema},
  prompt: `You are an AI writing assistant. Your task is to provide suggestions for improving the quality of the given document.

  Document content:"""{{{documentContent}}}"""

  Provide specific and actionable suggestions for improving clarity, conciseness, and overall quality. Focus on aspects beyond basic grammar and spelling.

  Format your suggestions as a numbered list:

  1.  Suggestion 1
  2.  Suggestion 2
  3.  Suggestion 3
  `,
});

const aiSuggestionFlow = ai.defineFlow(
  {
    name: 'aiSuggestionFlow',
    inputSchema: AiSuggestionInputSchema,
    outputSchema: AiSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
