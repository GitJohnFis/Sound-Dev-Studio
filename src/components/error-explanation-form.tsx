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
import { Loader2, AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const FormSchema = z.object({
  javaCode: z.string().min(10, { message: "Java code must be at least 10 characters." }),
});

type ErrorExplanationFormData = z.infer<typeof FormSchema>;

export function ErrorExplanationForm() {
  const [explanationResult, setExplanationResult] = useState<ExplainJavaErrorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ErrorExplanationFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      javaCode: "",
    },
  });

  const onSubmit: SubmitHandler<ErrorExplanationFormData> = async (data) => {
    setIsLoading(true);
    setExplanationResult(null);
    try {
      const aiInput: ExplainJavaErrorInput = { javaCode: data.javaCode };
      const result = await explainJavaError(aiInput);
      setExplanationResult(result);
      toast({
        title: "Analysis Complete",
        description: result.hasError ? "Errors found and explained." : "No errors found in the code.",
      });
    } catch (error) {
      console.error("Error explaining code:", error);
      toast({
        title: "Error Explaining Code",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 min-h-[calc(100vh-300px)] md:min-h-[500px]">
          <Card className="flex flex-col">
            <CardContent className="p-6 space-y-4 flex flex-col flex-grow">
              <FormField
                control={form.control}
                name="javaCode"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-grow">
                    <FormLabel>Paste your Java code here:</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="public class HelloWorld { ... }"
                        className="resize-none flex-grow min-h-[300px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangleIcon className="mr-2 h-4 w-4" />
                )}
                Explain Errors
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold mb-3">Explanation</h3>
              <ScrollArea className="bg-neutral-900 p-4 rounded-md shadow-inner flex-grow min-h-[200px]">
                {isLoading && <p className="text-neutral-400">Analyzing code...</p>}
                {!isLoading && !explanationResult && (
                  <p className="text-neutral-500">Enter Java code and click "Explain Errors" to see the analysis.</p>
                )}
                {explanationResult && (
                  <div className="space-y-2">
                    {explanationResult.hasError ? (
                      <div className="flex items-start text-destructive">
                        <AlertTriangleIcon className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                        <p className="font-semibold">Errors found:</p>
                      </div>
                    ) : (
                      <div className="flex items-start text-green-400">
                        <CheckCircle2Icon className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                        <p className="font-semibold">No errors found.</p>
                      </div>
                    )}
                    <p className="text-neutral-300 whitespace-pre-wrap text-sm">{explanationResult.explanation}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
