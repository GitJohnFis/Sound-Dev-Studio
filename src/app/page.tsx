import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CodeGenerationForm } from "@/components/code-generation-form";
import { ErrorExplanationForm } from "@/components/error-explanation-form";
import { CodeCompanionLogo } from "@/components/code-companion-logo";
import { Wand2, AlertCircle } from "lucide-react";

export default function CodeCompanionPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="mb-8 py-4">
        <CodeCompanionLogo />
        <p className="text-muted-foreground mt-1 text-lg">
          Your AI-powered assistant for Java code generation and error analysis.
        </p>
      </header>

      <Tabs defaultValue="generate-code" className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
          <TabsTrigger value="generate-code" className="text-sm md:text-base py-2.5">
            <Wand2 className="mr-2 h-5 w-5" />
            Generate Code
          </TabsTrigger>
          <TabsTrigger value="explain-error" className="text-sm md:text-base py-2.5">
            <AlertCircle className="mr-2 h-5 w-5" />
            Explain Error
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate-code" className="flex-grow mt-6">
          <Card className="h-full flex flex-col shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Generate Java Code</CardTitle>
              <CardDescription>
                Describe the functionality you need, and let AI craft the Java code for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <CodeGenerationForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="explain-error" className="flex-grow mt-6">
          <Card className="h-full flex flex-col shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Explain Java Error</CardTitle>
              <CardDescription>
                Paste your Java code to get an AI-powered explanation of any errors.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ErrorExplanationForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
       <footer className="text-center py-8 mt-auto text-sm text-muted-foreground">
        Code Companion &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
