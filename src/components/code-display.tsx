'use client';

import React from 'react';
import { highlightJavaSyntax } from '@/lib/syntax-highlight-java';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodeDisplayProps {
  code: string | null;
  className?: string;
  title?: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, className, title }) => {
  if (code === null || code === undefined) {
    return (
      <div className={`bg-neutral-900 p-4 rounded-md shadow-inner text-sm font-mono text-neutral-500 ${className || 'h-full'}`}>
        {title && <h3 className="text-neutral-400 mb-2 font-semibold">{title}</h3>}
        No code to display.
      </div>
    );
  }

  const highlightedHtml = highlightJavaSyntax(code);

  return (
    <ScrollArea className={`bg-neutral-900 p-4 rounded-md shadow-inner text-sm font-mono text-neutral-200 ${className || 'h-full'}`}>
      {title && <h3 className="text-neutral-400 mb-2 font-semibold">{title}</h3>}
      <pre className="whitespace-pre-wrap">
        <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      </pre>
    </ScrollArea>
  );
};
