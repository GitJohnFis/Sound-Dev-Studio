
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { explainJavaError, type ExplainJavaErrorInput, type ExplainJavaErrorOutput } from '@/ai/flows/explain-java-error';
import { Loader2, PlayIcon, AlertTriangleIcon, CheckCircle2Icon, TerminalIcon, Trash2Icon } from 'lucide-react'; // Added TerminalIcon, Trash2Icon
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';

const PlaygroundFormSchema = z.object({
  javaCode: z.string().min(1, { message: "Please enter some Java code." }),
});

type PlaygroundFormData = z.infer<typeof PlaygroundFormSchema>;

type ConsoleMessageType = 'log' | 'error' | 'warn' | 'info';
interface ConsoleMessage {
  id: string;
  type: ConsoleMessageType;
  timestamp: string;
  message: string;
}

// Helper to format console arguments
const formatConsoleArg = (arg: any): string => {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return arg.stack || arg.message;
  try {
    return JSON.stringify(arg, null, 2);
  } catch (e) {
    return '[Unserializable Object]';
  }
};

const formatConsoleArgs = (args: any[]): string => {
  return args.map(formatConsoleArg).join(' ');
};


export default function PlaygroundPage() {
  const [analysisResult, setAnalysisResult] = useState<ExplainJavaErrorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const FlaskConicalIcon = require('lucide-react').FlaskConicalIcon; // Keeping existing import style for this icon

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const consoleContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const originalConsole = { ...window.console };

    const logToCustomConsole = (type: ConsoleMessageType, args: any[]) => {
      setConsoleMessages(prevMessages => [
        ...prevMessages,
        {
          id: self.crypto.randomUUID ? self.crypto.randomUUID() : Date.now().toString() + Math.random().toString(),
          type,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          message: formatConsoleArgs(args),
        },
      ]);
    };

    window.console.log = (...args: any[]) => {
      originalConsole.log.apply(originalConsole, args);
      logToCustomConsole('log', args);
    };
    window.console.error = (...args: any[]) => {
      originalConsole.error.apply(originalConsole, args);
      logToCustomConsole('error', args);
    };
    window.console.warn = (...args: any[]) => {
      originalConsole.warn.apply(originalConsole, args);
      logToCustomConsole('warn', args);
    };
    window.console.info = (...args: any[]) => {
      originalConsole.info.apply(originalConsole, args);
      logToCustomConsole('info', args);
    };

    // Example log to show the console is working
    console.log("Playground custom console initialized.");

    return () => {
      // Restore original console methods when component unmounts
      window.console.log = originalConsole.log;
      window.console.error = originalConsole.error;
      window.console.warn = originalConsole.warn;
      window.console.info = originalConsole.info;
    };
  }, []);

  useEffect(() => {
    // Auto-scroll console to bottom
    if (consoleContentRef.current) {
      const scrollAreaViewport = consoleContentRef.current.parentElement?.parentElement;
      if (scrollAreaViewport && scrollAreaViewport.hasAttribute('data-radix-scroll-area-viewport')) {
        scrollAreaViewport.scrollTop = scrollAreaViewport.scrollHeight;
      }
    }
  }, [consoleMessages]);

  const handleClearConsole = () => {
    setConsoleMessages([]);
  };

  const form = useForm<PlaygroundFormData>({
    resolver: zodResolver(PlaygroundFormSchema),
    defaultValues: {
      javaCode: `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java Playground!");\n    }\n}`,
    },
  });

  const onSubmit: SubmitHandler<PlaygroundFormData> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);
    console.info("Starting Java code analysis for:", data.javaCode.substring(0, 50) + "...");
    try {
      const aiInput: ExplainJavaErrorInput = { javaCode: data.javaCode };
      const result = await explainJavaError(aiInput);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: result.hasError ? "Issues found in your code." : "Code analyzed successfully. No critical issues found.",
      });
      if (result.hasError) {
        console.warn("Analysis found issues:", result.explanation);
      } else {
        console.log("Analysis complete, no critical issues found.");
      }
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

      {/* Custom Web Console */}
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center">
              <TerminalIcon className="mr-2 h-5 w-5 text-primary" /> Browser Console
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleClearConsole} aria-label="Clear console">
              <Trash2Icon className="mr-1 h-4 w-4" /> Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] bg-neutral-900 p-3 rounded-md font-mono text-xs border border-neutral-700">
            <div ref={consoleContentRef} className="space-y-1">
              {consoleMessages.length === 0 && (
                <p className="text-neutral-500">Console output from browser JavaScript will appear here...</p>
              )}
              {consoleMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`whitespace-pre-wrap ${
                    msg.type === 'error' ? 'text-destructive' : 'text-neutral-300'
                  }`}
                >
                  <span className="text-neutral-500 mr-2 select-none">{msg.timestamp}</span>
                  {msg.type === 'warn' && <span className="font-semibold text-yellow-400 mr-1 select-none">WARN:</span>}
                  {msg.type === 'info' && <span className="font-semibold text-blue-400 mr-1 select-none">INFO:</span>}
                  {/* For errors, the destructive color is applied to the whole line */}
                  {msg.type === 'error' && <span className="font-semibold mr-1 select-none">ERROR:</span>}
                  <span>{msg.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <p className="mt-2 text-xs text-muted-foreground">
            This console shows logs from the browser's JavaScript environment for this page. It does not show output from the Java code.
          </p>
        </CardContent>
      </Card>

      <footer className="text-center py-6 mt-auto text-sm text-muted-foreground">
        Java Playground &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

