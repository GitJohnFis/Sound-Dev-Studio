
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { explainJavaError, type ExplainJavaErrorInput, type ExplainJavaErrorOutput } from '@/ai/flows/explain-java-error';
import { Loader2, PlayIcon, AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const PlaygroundFormSchema = z.object({
  javaCode: z.string().min(1, { message: "Please enter some Java code." }),
});

type PlaygroundFormData = z.infer<typeof PlaygroundFormSchema>;

export default function PlaygroundPage() {
  const [analysisResult, setAnalysisResult] = useState<ExplainJavaErrorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PlaygroundFormData>({
    resolver: zodResolver(PlaygroundFormSchema),
    defaultValues: {
      javaCode: `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java Playground!");\n    }\n}`,
    },
  });

  const onSubmit: SubmitHandler<PlaygroundFormData> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const aiInput: ExplainJavaErrorInput = { javaCode: data.javaCode };
      const result = await explainJavaError(aiInput);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: result.hasError ? "Issues found in your code." : "Code analyzed successfully. No critical issues found.",
      });
    } catch (error) {
      console.error("Error analyzing code:", error);
      setAnalysisResult({
        hasError: true,
        explanation: "An error occurred during analysis. Please try again."
      });
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] flex flex-col">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <FlaskConicalIcon className="mr-3 h-7 w-7 text-primary" />
            Java Code Playground
          </CardTitle>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-grow flex flex-col">
          <div className="grid md:grid-cols-2 gap-6 flex-grow">
            {/* Code Input Area */}
            <Card className="flex flex-col shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Your Java Code</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow p-4">
                <FormField
                  control={form.control}
                  name="javaCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-col flex-grow">
                      <FormLabel htmlFor="javaCode" className="sr-only">Java Code Input</FormLabel>
                      <FormControl>
                        <Textarea
                          id="javaCode"
                          placeholder="Enter your Java code here..."
                          className="resize-none flex-grow min-h-[300px] md:min-h-[400px] font-mono text-sm bg-neutral-900 text-neutral-200 border-neutral-700 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button type="submit" disabled={isLoading} className="mt-4 w-full md:w-auto self-start">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayIcon className="mr-2 h-4 w-4" />
                  )}
                  Run Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Output Area */}
            <Card className="flex flex-col shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">AI Analysis Output</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow p-4">
                <ScrollArea className="bg-neutral-900 p-4 rounded-md shadow-inner flex-grow min-h-[300px] md:min-h-[400px]">
                  {isLoading && <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2 text-neutral-400">Analyzing...</p></div>}
                  {!isLoading && !analysisResult && (
                    <p className="text-neutral-500 text-center py-10">
                      Click "Run Analysis" to check your Java code. The AI will provide feedback and identify potential issues.
                    </p>
                  )}
                  {analysisResult && (
                    <div className="space-y-3">
                      {analysisResult.hasError ? (
                        <div className="flex items-start text-destructive p-3 bg-destructive/10 rounded-md">
                          <AlertTriangleIcon className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-base">Issues Found:</p>
                            <p className="text-sm whitespace-pre-wrap">{analysisResult.explanation}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start text-green-400 p-3 bg-green-500/10 rounded-md">
                          <CheckCircle2Icon className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
                           <div>
                            <p className="font-semibold text-base">No Critical Issues Found.</p>
                            <p className="text-sm whitespace-pre-wrap">{analysisResult.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
      <footer className="text-center py-6 mt-auto text-sm text-muted-foreground">
        Java Playground &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
