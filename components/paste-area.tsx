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
        className="w-full min-h-60 bg-transparent text-[#e0def4] border-2 border-dashed border-[#908caa] rounded-xl focus:outline-none focus:ring-0 p-4 text-base overflow-y-auto max-h-96"
        suppressContentEditableWarning
      >
        {pastedItems.length === 0 ? (
          <div className="text-[#908caa] pointer-events-none select-none">
            Paste your text here... (Ctrl+Enter to summarize)
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pastedItems.map((item) => (
              <div
                key={item.id}
                className="relative group bg-[#26233a] border border-[#6e6a86] rounded-lg p-3 text-sm"
              >
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#eb6f92] hover:bg-[#d84a70] text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                  aria-label="Remove item"
                >
                  ×
                </button>
                <div className="text-[#c4a7e7] font-semibold text-xs mb-1">
                  Text #{pastedItems.indexOf(item) + 1}
                </div>
                <div className="text-[#e0def4] line-clamp-3 break-words whitespace-pre-wrap">
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
          className="absolute bottom-4 right-4 bg-[#c4a7e7] hover:bg-[#b794e0] text-[#352F44] font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg"
        >
          Summarize ({pastedItems.length})
        </button>
      )}
    </div>
  );
}
