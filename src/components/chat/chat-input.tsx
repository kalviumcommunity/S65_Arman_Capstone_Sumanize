"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  ArrowElbowDownLeft,
  Brain,
  ArrowsClockwise,
  DotsThreeOutline,
  CursorClick,
} from "@phosphor-icons/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  sourceText?: string;
}

export default function ChatInput({
  onSend,
  isLoading,
  sourceText,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

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
    <div className="w-full h-full bg-teal-900 border border-teal-700 rounded-xl p-1.5">
      <div className="h-full min-h-0 bg-stone-300 border border-teal-700 rounded-lg flex flex-col p-1">
        <div className="relative flex-1 min-h-0 w-full overflow-y-auto">
          {sourceText ? (
            <div className="w-full text-teal-950 text-lg p-8 prose prose-teal max-w-none">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mt-2 mb-3">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mt-3 mb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-3 mb-2">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="leading-relaxed mb-2">{children}</p>
                  ),
                  code: (props) => {
                    const { inline, children, ...rest } = props as any;
                    if (inline) {
                      return (
                        <code
                          className="px-1 py-0.5 rounded bg-stone-200 text-teal-900"
                          {...rest}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-stone-200 rounded p-3 overflow-x-auto">
                        <code className="text-teal-900" {...rest}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                }}
              >
                {sourceText}
              </Markdown>
            </div>
          ) : (
            <>
              {!message && (
                <div className="absolute inset-0 flex flex-col items-center text-md justify-center pointer-events-none">
                  <CursorClick
                    size={32}
                    className="text-teal-950"
                    weight="fill"
                  />
                  <h2 className="text-teal-950 font-bold mb-2 text-center text-4xl">
                    Sumanize
                  </h2>
                  <p className="max-w-sm text-teal-950 text-center">
                    Paste text or upload a document to get a summary. You can
                    also drag and drop files.
                  </p>
                </div>
              )}
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                className="w-full h-full text-teal-950 bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-lg shadow-none"
                disabled={isLoading}
              />
            </>
          )}
        </div>

        {/* <div className="mt-auto flex justify-between items-center rounded-xl bg-neutral-200 p-4">
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="px-1.5 text-sm bg-gradient-to-b text-neutral-950 from-neutral-100 to-neutral-300 hover:bg-neutral-200 border-1 border-neutral-400 cursor-pointer active:scale-95 transition-all duration-200"
                  disabled={isLoading}
                >
                  <Brain size={16} />
                  Reason
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Switch to reasoning mode</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="text-sm bg-gradient-to-b text-neutral-950 from-neutral-100 to-neutral-300 hover:bg-neutral-200 border-1 border-neutral-400 cursor-pointer active:scale-95 transition-all duration-200"
                  disabled={isLoading}
                >
                  <ArrowsClockwise size={16} />
                  Regenerate
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Regenerate another response</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="text-sm bg-transparent text-neutral-950 hover:bg-transparent cursor-pointer active:scale-95 transition-all duration-200 shadow-none"
                  disabled={isLoading}
                >
                  <DotsThreeOutline size={16} weight="fill" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-sm bg-transparent hover:bg-transparent cursor-pointer active:scale-95 transition-all duration-200 shadow-none text-neutral-950"
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
          >
            Enter to Send
            <ArrowElbowDownLeft size={16} weight="fill" />
          </Button>
        </div> */}
      </div>
    </div>
  );
}
