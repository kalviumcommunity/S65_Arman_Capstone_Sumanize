"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./markdown-components";

interface SummaryResultProps {
  summary: string;
  isLoading: boolean;
}

export function SummaryResult({ summary, isLoading }: SummaryResultProps) {
  if (!isLoading && !summary) return null;

  return (
    <div className="w-full bg-foreground/5 border border-foreground/10 rounded-xl">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <h2 className="text-sm font-semibold text-foreground">
            {isLoading ? "Generating summary..." : "Summary"}
          </h2>
        </div>
        {summary ? (
          <div className="w-full text-foreground text-md prose prose-invert max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {summary}
            </Markdown>
          </div>
        ) : (
          <div className="text-foreground/50 text-sm">Just a sec...</div>
        )}
      </div>
    </div>
  );
}
