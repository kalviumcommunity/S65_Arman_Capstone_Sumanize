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
import PreviewHolder from "./preview-holder";

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
            <div className="w-full text-teal-950 text-md p-8 prose prose-teal max-w-none">
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
                      <table className="w-full text-sm text-left text-stone-800">
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
                      className="px-4 py-3 font-semibold text-teal-950"
                    >
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 align-top text-teal-950">{children}</td>
                  ),
                  code: (props) => {
                    const { inline, children, ...rest } = props as any;
                    if (inline) {
                      return (
                        <code
                          className="px-1 py-0.5 rounded bg-stone-200 text-teal-950"
                          {...rest}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-stone-200 rounded-md px-3 py-1 overflow-x-auto">
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
              {!message && <PreviewHolder />}
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
