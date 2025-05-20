'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeDisplay } from '@/components/code-display';
import { useToast } from '@/hooks/use-toast';
import { generateJavaCode, type GenerateJavaCodeInput } from '@/ai/flows/generate-java-code';
import { Loader2, SparklesIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FormSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  language: z.string().default("java"), // For future use, currently fixed to Java
});

type CodeGenerationFormData = z.infer<typeof FormSchema>;

export function CodeGenerationForm() {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CodeGenerationFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      language: "java",
    },
  });

  const onSubmit: SubmitHandler<CodeGenerationFormData> = async (data) => {
    setIsLoading(true);
    setGeneratedCode(null);
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
                    <FormLabel>Describe the Java code you want to generate:</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A Java function that sorts an array of integers in ascending order."
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
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
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
