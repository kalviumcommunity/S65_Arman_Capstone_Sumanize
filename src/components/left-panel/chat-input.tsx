"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Clipboard,
  Check,
  ArrowsClockwise,
  PencilSimple,
  Plus,
} from "@phosphor-icons/react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  sourceText?: string;
  onSelection: (selection: { text: string; rect: DOMRect | null }) => void;
  onCursorPosition: (position: { x: number; y: number }) => void;
}

export default function ChatInput({
  onSend,
  isLoading,
  sourceText,
  onSelection,
  onCursorPosition,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-full border border-stone-700 rounded-3xl p-1.5">
      <div className="h-full min-h-0 rounded-2xl flex flex-col p-1">
        <div className="px-8 py-2 text-left bg-gradient-to-b from-stone-300 to-transparent flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">
              Source Content
            </h2>
            <p className="text-sm text-stone-600">
              Paste your content below to get started
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(sourceText || "");
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1500);
              }}
              className="text-sm p-1.5 hover:bg-stone-400/50 text-stone-950 rounded-md transition-all duration-200 relative cursor-pointer"
            >
              <div className="relative w-5 h-5">
                <Clipboard
                  size={20}
                  className={`absolute inset-0 transition-all duration-200 ${
                    isCopied ? "opacity-0 scale-75" : "opacity-100 scale-100"
                  }`}
                />
                <Check
                  size={20}
                  className={`absolute inset-0 transition-all duration-200 ${
                    isCopied ? "opacity-100 scale-110" : "opacity-0 scale-75"
                  }`}
                />
              </div>
            </button>
            <button
              onClick={() => {}}
              className="text-sm p-1.5 hover:bg-stone-400/50 text-stone-950 rounded-md transition-all duration-200 relative cursor-pointer"
            >
              <PencilSimple size={20} />
            </button>
            <button
              onClick={() => onSend("regenerate")}
              className="text-sm p-1.5 hover:bg-stone-400/50 text-stone-950 rounded-md transition-all duration-200 relative cursor-pointer"
            >
              <ArrowsClockwise size={20} />
            </button>
            <button
              onClick={() => onSend("regenerate")}
              className="text-sm p-1.5 hover:bg-stone-400/50 text-stone-950 rounded-md transition-all duration-200 relative cursor-pointer"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        <div
          className="relative flex-1 min-h-0 w-full overflow-y-auto"
          data-text-content
          onMouseUp={(event) => {
            const currentSelection = window.getSelection();
            if (
              currentSelection &&
              currentSelection.toString() &&
              currentSelection.rangeCount > 0
            ) {
              const range = currentSelection.getRangeAt(0);
              // Capture cursor position
              onCursorPosition({ x: event.clientX, y: event.clientY });
              onSelection({
                text: currentSelection.toString(),
                rect: range.getBoundingClientRect(),
              });
            }
          }}
        >
          {sourceText ? (
            <div className="w-full text-stone-950 text-md p-8 prose prose-stone max-w-none">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold mb-2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold mb-2">{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-12 mb-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-12 mb-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed mb-2">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="leading-relaxed mb-2">{children}</p>
                  ),
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto border border-stone-500 rounded-lg">
                      <table className="w-full text-sm text-left text-stone-950">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-stone-400 border-b border-stone-500">
                      {children}
                    </thead>
                  ),
                  tr: ({ children }) => (
                    <tr className="bg-stone-200 border-b border-stone-500 last:border-b-0 hover:bg-stone-100 transition-colors duration-200">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th
                      scope="col"
                      className="px-4 py-3 font-semibold text-stone-950"
                    >
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 align-top text-stone-950">
                      {children}
                    </td>
                  ),
                  hr: ({ children }) => (
                    <hr className="my-4 border-stone-300" />
                  ),
                  code: ({
                    inline,
                    className,
                    children,
                    ...props
                  }: React.HTMLAttributes<HTMLElement> & {
                    inline?: boolean;
                    className?: string;
                    children?: React.ReactNode;
                  }) => {
                    if (inline) {
                      return (
                        <code
                          className="px-1.5 py-1 rounded-md bg-stone-900 text-stone-200 text-sm font-mono inline-block"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    const handleCopy = () => {
                      navigator.clipboard.writeText(String(children).trim());
                    };
                    return (
                      <div className="relative group my-2">
                        <pre className="bg-stone-200 rounded-md p-8 overflow-x-auto whitespace-pre-wrap break-words">
                          <code
                            className="text-stone-950 text-sm font-mono leading-relaxed"
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                        <button
                          onClick={handleCopy}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-stone-300 hover:bg-stone-400 text-stone-950 px-2 py-1 rounded"
                        >
                          Copy
                        </button>
                      </div>
                    );
                  },
                }}
              >
                {sourceText}
              </Markdown>
            </div>
          ) : (
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="relative z-20 w-full h-full text-stone-950 bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-md shadow-none"
              disabled={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
