
'use server';

/**
 * @fileOverview A flow to check a document against custom Vale rules in addition to standard grammar and spelling.
 *
 * - checkDocument - A function that handles the document checking process.
 * - CheckDocumentInput - The input type for the checkDocument function.
 * - CheckDocumentOutput - The return type for the checkDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs/promises';
import path from 'path';

const CheckDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to be checked.'),
  valeRules: z
    .string()
    .describe('Custom Vale rules to be applied during the check. If empty, default rules will be used.'),
});
export type CheckDocumentInput = z.infer<typeof CheckDocumentInputSchema>;

const CheckDocumentOutputSchema = z.object({
  correctedDocument: z
    .string()
    .describe('The document content with grammar and spelling errors corrected, based on Vale rules.'),
  errors: z.array(
    z.object({
      message: z.string().describe('The error message.'),
      line: z.number().describe('The line number where the error occurred.'),
      start: z.number().describe('The starting character index of the error.'),
      end: z.number().describe('The ending character index of the error.'),
      ruleId: z.string().describe('The ID of the Vale rule that triggered the error.'),
    })
  ).describe('A list of errors found in the document.'),
});
export type CheckDocumentOutput = z.infer<typeof CheckDocumentOutputSchema>;

export async function checkDocument(input: CheckDocumentInput): Promise<CheckDocumentOutput> {
  return checkDocumentFlow(input);
}

const checkDocumentPrompt = ai.definePrompt({
  name: 'checkDocumentPrompt',
  input: {schema: CheckDocumentInputSchema},
  output: {schema: CheckDocumentOutputSchema},
  prompt: `You are a sophisticated AI-powered editor that reviews documents for grammar, spelling, and style.

You will receive the content of a document and a set of custom Vale rules.
Your task is to correct any grammar and spelling errors in the document, while also ensuring that the document adheres to the provided Vale rules.

Return the corrected document, along with a list of any errors found, including the error message, line number, character start and end positions, and the ID of the Vale rule that triggered the error.

Document Content:
{{{documentContent}}}

Vale Rules:
{{{valeRules}}}`,
});

const checkDocumentFlow = ai.defineFlow(
  {
    name: 'checkDocumentFlow',
    inputSchema: CheckDocumentInputSchema,
    outputSchema: CheckDocumentOutputSchema,
  },
  async (input: CheckDocumentInput) => {
    let effectiveValeRules = input.valeRules;

    if (!effectiveValeRules || effectiveValeRules.trim() === "") {
      try {
        // Attempt to resolve the path relative to the current working directory.
        // This assumes the flow is run from the project root.
        const defaultRulesPath = path.join(process.cwd(), 'src', 'ai', 'rules', 'default-vale-rules.yml');
        effectiveValeRules = await fs.readFile(defaultRulesPath, 'utf-8');
      } catch (error) {
        console.error("Error reading default Vale rules from src/ai/rules/default-vale-rules.yml:", error);
        // Proceed with empty rules if default file reading fails.
        // The prompt will receive an empty string for valeRules.
        effectiveValeRules = ""; 
      }
    }

    const {output} = await checkDocumentPrompt({
      documentContent: input.documentContent,
      valeRules: effectiveValeRules,
    });
    return output!;
  }
);
