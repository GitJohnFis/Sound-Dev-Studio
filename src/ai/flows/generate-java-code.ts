'use server';

/**
 * @fileOverview A flow for generating Java code from a natural language description.
 *
 * - generateJavaCode - A function that generates Java code.
 * - GenerateJavaCodeInput - The input type for the generateJavaCode function.
 * - GenerateJavaCodeOutput - The return type for the generateJavaCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJavaCodeInputSchema = z.object({
  description: z.string().describe('A natural language description of the Java function.'),
});
export type GenerateJavaCodeInput = z.infer<typeof GenerateJavaCodeInputSchema>;

const GenerateJavaCodeOutputSchema = z.object({
  code: z.string().describe('The generated Java code.'),
});
export type GenerateJavaCodeOutput = z.infer<typeof GenerateJavaCodeOutputSchema>;

export async function generateJavaCode(input: GenerateJavaCodeInput): Promise<GenerateJavaCodeOutput> {
  return generateJavaCodeFlow(input);
}

const generateJavaCodePrompt = ai.definePrompt({
  name: 'generateJavaCodePrompt',
  input: {schema: GenerateJavaCodeInputSchema},
  output: {schema: GenerateJavaCodeOutputSchema},
  prompt: `You are a Java programming expert. Generate Java code based on the user's description.

Description: {{{description}}}

Ensure the generated code is syntactically correct, well-formatted, and includes necessary comments.

Output:
`,
});

const generateJavaCodeFlow = ai.defineFlow(
  {
    name: 'generateJavaCodeFlow',
    inputSchema: GenerateJavaCodeInputSchema,
    outputSchema: GenerateJavaCodeOutputSchema,
  },
  async input => {
    const {output} = await generateJavaCodePrompt(input);
    return output!;
  }
);
