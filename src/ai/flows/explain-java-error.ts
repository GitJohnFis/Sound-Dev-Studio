
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
  explanation: z.string().describe('The detailed explanation of the error(s) in the Java code, or a message indicating no errors were found. This includes line and column numbers, error types, and suggestions.'),
});
export type ExplainJavaErrorOutput = z.infer<typeof ExplainJavaErrorOutputSchema>;

export async function explainJavaError(input: ExplainJavaErrorInput): Promise<ExplainJavaErrorOutput> {
  return explainJavaErrorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainJavaErrorPrompt',
  input: {schema: ExplainJavaErrorInputSchema},
  output: {schema: ExplainJavaErrorOutputSchema},
  prompt: `You are an advanced Java diagnostic assistant. Your task is to meticulously analyze the provided Java code for a wide range of issues and provide a detailed explanation.

For each error or significant issue found, provide:
1.  The **exact line number** and, if possible, an **estimated column number** where the issue occurs.
2.  A **clear description** of the error or issue. This includes:
    *   **Syntax errors:** e.g., missing semicolons, incorrect bracket usage.
    *   **Type mismatches:** e.g., assigning a String to an int variable.
    *   **Misspellings:** e.g., "systm.out.println" instead of "System.out.println" for keywords or common API elements.
    *   **Common logical errors:** e.g., potential null pointer exceptions if identifiable from context, infinite loops if apparent, off-by-one errors.
    *   **Significant style issues:** e.g., highly inconsistent indentation or excessive whitespace that severely hampers readability (note Java is not whitespace-sensitive for execution logic but readability is important).
3.  Suggest a **correction** if appropriate.

If multiple errors are found, list each one clearly, preferably in a numbered or bulleted list format for readability.

If no errors are found, explicitly state: "No errors or significant issues found in the provided Java code."

Please note: This is a static analysis of the code. It does not execute the code, so it cannot report runtime-specific values or actual program output. However, it aims to identify issues that would likely cause compilation errors or runtime problems and can describe expected behavior or potential pitfalls based on the static code.

Java code:
{{{javaCode}}}
`,
});

const explainJavaErrorFlow = ai.defineFlow(
  {
    name: 'explainJavaErrorFlow',
    inputSchema: ExplainJavaErrorInputSchema,
    outputSchema: ExplainJavaErrorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure there's always some explanation text, even if the model fails to produce structured output perfectly.
    if (!output) {
        return {
            hasError: true, // Assume error if output is null
            explanation: "Error: Could not analyze the code. The AI model did not return a valid response."
        }
    }
    if (output.explanation === null || output.explanation === undefined) {
        return {
            ...output,
            explanation: output.hasError ? "An error was detected but no specific explanation was provided." : "Analysis complete."
        }
    }
    return output;
  }
);

