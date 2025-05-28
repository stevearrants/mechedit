// use server'

/**
 * @fileOverview Grammar and spelling check flow.
 *
 * - grammarAndSpellingCheck - A function that checks grammar and spelling in a document.
 * - GrammarAndSpellingCheckInput - The input type for the grammarAndSpellingCheck function.
 * - GrammarAndSpellingCheckOutput - The return type for the grammarAndSpellingCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GrammarAndSpellingCheckInputSchema = z.object({
  document: z.string().describe('The document to check for grammar and spelling errors.'),
});
export type GrammarAndSpellingCheckInput = z.infer<
  typeof GrammarAndSpellingCheckInputSchema
>;

const GrammarAndSpellingCheckOutputSchema = z.object({
  correctedDocument: z
    .string()
    .describe('The document with grammar and spelling errors corrected.'),
  errors: z
    .array(z.string())
    .describe('A list of errors found in the document.'),
  suggestions: z
    .array(z.string())
    .describe('A list of suggestions for improving the document.'),
});
export type GrammarAndSpellingCheckOutput = z.infer<
  typeof GrammarAndSpellingCheckOutputSchema
>;

export async function grammarAndSpellingCheck(
  input: GrammarAndSpellingCheckInput
): Promise<GrammarAndSpellingCheckOutput> {
  return grammarAndSpellingCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'grammarAndSpellingCheckPrompt',
  input: {schema: GrammarAndSpellingCheckInputSchema},
  output: {schema: GrammarAndSpellingCheckOutputSchema},
  prompt: `You are a grammar and spelling expert. Review the following document and correct any errors. Also provide a list of errors found and suggestions for improvement.

Document:
{{{document}}}`,
});

const grammarAndSpellingCheckFlow = ai.defineFlow(
  {
    name: 'grammarAndSpellingCheckFlow',
    inputSchema: GrammarAndSpellingCheckInputSchema,
    outputSchema: GrammarAndSpellingCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
