import { Code2Icon } from 'lucide-react';

export function CodeCompanionLogo() {
  return (
    <div className="flex items-center space-x-2 text-primary">
      <Code2Icon size={36} strokeWidth={2} />
      <span className="text-3xl font-bold">Code Companion</span>
    </div>
  );
}
