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
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex-1 w-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          <div>
            <div className="relative mx-auto text-center py-12 px-4">
              <div className="absolute inset-0" />
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#c4a7e7] mb-3">
                sumanize
              </h1>
              <p className="text-base sm:text-lg font-medium text-[#6e6a86] max-w-2xl mx-auto">
                Paste any text and get a clear, concise summary in seconds.
                Perfect for articles, papers, emails, and notes—save time and
                focus on what matters.
              </p>
            </div>

            <PasteArea
              pastedItems={pastedItems}
              onPaste={addPastedItem}
              onRemoveItem={removePastedItem}
              onSummarize={summarize}
              isLoading={isLoading}
            />
          </div>

          <SummaryResult summary={summary} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
