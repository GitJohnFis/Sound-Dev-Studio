
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeDisplay } from '@/components/code-display';
import { useToast } from '@/hooks/use-toast';
import { generateJavaCode, type GenerateJavaCodeInput } from '@/ai/flows/generate-java-code';
import { explainJavaError, type ExplainJavaErrorOutput } from '@/ai/flows/explain-java-error';
import { Loader2, SparklesIcon, AlertTriangleIcon, CheckCircle2Icon, Loader2 as AnalyzingIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const FormSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  language: z.string().default("java"), // For future use, currently fixed to Java
});

type CodeGenerationFormData = z.infer<typeof FormSchema>;

export function CodeGenerationForm() {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [codeAnalysisResult, setCodeAnalysisResult] = useState<ExplainJavaErrorOutput | null>(null);
  const [isAnalyzingCode, setIsAnalyzingCode] = useState(false);

  const form = useForm<CodeGenerationFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      language: "java",
    },
  });

  const descriptionValue = form.watch("description");

  useEffect(() => {
    const debouncedAnalysis = async (value: string | undefined) => {
      if (value && value.trim().startsWith("public") && value.length > 15) {
        setIsAnalyzingCode(true);
        try {
          const result = await explainJavaError({ javaCode: value });
          setCodeAnalysisResult(result);
        } catch (error) {
          console.error("Error analyzing code in description:", error);
          setCodeAnalysisResult({
            hasError: true,
            explanation: "Analysis failed. Please try again."
          });
        } finally {
          setIsAnalyzingCode(false);
        }
      } else {
        setCodeAnalysisResult(null); 
        setIsAnalyzingCode(false);   
      }
    };

    const handler = setTimeout(() => {
      debouncedAnalysis(descriptionValue);
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [descriptionValue]);

  const onSubmit: SubmitHandler<CodeGenerationFormData> = async (data) => {
    setIsLoading(true);
    setGeneratedCode(null);
    // Clear any live analysis result when submitting for generation
    setCodeAnalysisResult(null);
    setIsAnalyzingCode(false);
    try {
      const aiInput: GenerateJavaCodeInput = { description: data.description };
      const result = await generateJavaCode(aiInput);
      setGeneratedCode(result.code);
      toast({
        title: "Code Generated",
        description: "Java code has been successfully generated.",
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error Generating Code",
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
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <FormLabel>Describe the Java code you want to generate:</FormLabel>
                      <div className="flex items-center space-x-2 h-5"> {/* Container for icons */}
                        {isAnalyzingCode && <AnalyzingIcon className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {!isAnalyzingCode && codeAnalysisResult && (
                          codeAnalysisResult.hasError ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangleIcon className="h-5 w-5 text-destructive cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm">
                                  <p className="text-xs whitespace-pre-wrap">
                                    <strong>Analysis:</strong><br />
                                    {codeAnalysisResult.explanation.substring(0, 300) + (codeAnalysisResult.explanation.length > 300 ? '...' : '')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CheckCircle2Icon className="h-5 w-5 text-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm">
                                   <p className="text-xs whitespace-pre-wrap">
                                    <strong>Analysis:</strong><br />
                                    {codeAnalysisResult.explanation.substring(0, 300) + (codeAnalysisResult.explanation.length > 300 ? '...' : '')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A Java function that sorts an array of integers... OR type Java code starting with 'public' for a quick analysis."
                        className="resize-none flex-grow min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Language</FormLabel>
                 <Select defaultValue="java" disabled>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="java">Java</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Currently, only Java is supported.</p>
              </FormItem>
              <Button type="submit" disabled={isLoading || isAnalyzingCode} className="w-full md:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SparklesIcon className="mr-2 h-4 w-4" />
                )}
                Generate Code
              </Button>
            </CardContent>
          </Card>

          <CodeDisplay code={generatedCode} title="Generated Java Code" className="h-full min-h-[300px] md:min-h-0"/>
        </div>
      </form>
    </Form>
  );
}

