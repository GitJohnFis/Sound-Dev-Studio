// noinspection JSUnusedLocalSymbols
'use server';
/**
 * @fileOverview An AI agent that explains errors in Java code.
 *
 * - explainJavaError - A function that handles the error explanation process.
 * - ExplainJavaErrorInput - The input type for the explainJavaError function.
 * - ExplainJavaErrorOutput - The return type for the explainJavaError function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainJavaErrorInputSchema = z.object({
  javaCode: z.string().describe('The Java code to analyze for errors.'),
});
export type ExplainJavaErrorInput = z.infer<typeof ExplainJavaErrorInputSchema>;

const ExplainJavaErrorOutputSchema = z.object({
  hasError: z.boolean().describe('Whether the Java code has error(s) or not.'),
  explanation: z.string().describe('The explanation of the error(s) in the Java code, or a message indicating no errors were found.'),
});
export type ExplainJavaErrorOutput = z.infer<typeof ExplainJavaErrorOutputSchema>;

export async function explainJavaError(input: ExplainJavaErrorInput): Promise<ExplainJavaErrorOutput> {
  return explainJavaErrorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainJavaErrorPrompt',
  input: {schema: ExplainJavaErrorInputSchema},
  output: {schema: ExplainJavaErrorOutputSchema},
  prompt: `You are a Java expert specializing in identifying and explaining errors in Java code.

You will analyze the provided Java code and identify any errors. You will then explain the errors in a clear and concise manner, including the line number where the error occurs and the reason for the error.
If there are no errors, indicate that no errors were found.

Java code:
{{javaCode}}`,
});

const explainJavaErrorFlow = ai.defineFlow(
  {
    name: 'explainJavaErrorFlow',
    inputSchema: ExplainJavaErrorInputSchema,
    outputSchema: ExplainJavaErrorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
