"use client";

import { useCallback } from "react";

interface PastedItem {
  id: string;
  text: string;
}

interface PasteAreaProps {
  pastedItems: PastedItem[];
  onPaste: (text: string) => void;
  onRemoveItem: (id: string) => void;
  onSummarize: () => void;
  isLoading: boolean;
}

export function PasteArea({
  pastedItems,
  onPaste,
  onRemoveItem,
  onSummarize,
  isLoading,
}: PasteAreaProps) {
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const text = e.clipboardData.getData("text");
      if (!text.trim()) return;
      e.preventDefault();
      onPaste(text.trim());
    },
    [onPaste],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        if (pastedItems.length > 0) {
          onSummarize();
        }
      }
    },
    [pastedItems.length, onSummarize],
  );

  return (
    <div className="relative">
      <div
        contentEditable={!isLoading}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="w-full min-h-72 bg-foreground/5 border-2 border-dashed border-foreground/20 rounded-xl focus:outline-none focus:border-primary/50 transition-colors p-5 text-base overflow-y-auto max-h-96"
        suppressContentEditableWarning
      >
        {pastedItems.length === 0 ? (
          <div className="text-foreground/40 pointer-events-none select-none">
            Paste your text here...{" "}
            <span className="text-foreground/30">
              (Ctrl+Enter to summarize)
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pastedItems.map((item) => (
              <div
                key={item.id}
                className="relative group bg-background border border-foreground/10 rounded-lg p-4 text-sm shadow-sm hover:border-primary/30 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-error hover:bg-error/80 text-background w-6 h-6 rounded flex items-center justify-center text-xs font-semibold"
                  aria-label="Remove item"
                >
                  ×
                </button>
                <div className="text-primary font-semibold text-xs mb-1.5">
                  Text #{pastedItems.indexOf(item) + 1}
                </div>
                <div className="text-foreground line-clamp-3 break-words whitespace-pre-wrap">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pastedItems.length > 0 && !isLoading && (
        <button
          type="button"
          onClick={onSummarize}
          className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-background font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm"
        >
          Summarize ({pastedItems.length})
        </button>
      )}
    </div>
  );
}
