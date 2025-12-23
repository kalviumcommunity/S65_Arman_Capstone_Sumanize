"use client";

import { useSummarize } from "@/hooks/use-summarize";
import { PasteArea } from "./paste-area";
import { SummaryResult } from "./summary-result";

export default function Summarizer() {
  const {
    pastedItems,
    summary,
    isLoading,
    addPastedItem,
    removePastedItem,
    summarize,
  } = useSummarize();

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Summarize your text
        </h1>
        <p className="text-foreground/60 max-w-2xl mx-auto">
          Paste any text and get a clear, concise summary in seconds. Perfect
          for articles, papers, emails, and notes.
        </p>
      </div>

      <PasteArea
        pastedItems={pastedItems}
        onPaste={addPastedItem}
        onRemoveItem={removePastedItem}
        onSummarize={summarize}
        isLoading={isLoading}
      />

      <SummaryResult summary={summary} isLoading={isLoading} />
    </div>
  );
}
