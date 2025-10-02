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
    <div className="w-full bg-transparent">
      <div className="p-12">
        {summary ? (
          <div className="w-full text-[#e0def4] text-md prose prose-stone max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {summary}
            </Markdown>
          </div>
        ) : (
          <div className="text-[#e0def4] text-sm">Just a sec...</div>
        )}
      </div>
    </div>
  );
}
