"use client";

import { useState } from "react";
import ChatInput from "../left-panel/chat-input";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SummaryPreviewHolder from "./preview-holder";
import {
  Clipboard,
  ThumbsUp,
  ThumbsDown,
  Command,
} from "@phosphor-icons/react";

export default function Summarizer() {
  const [sourceText, setSourceText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async (message: string) => {
    setSourceText(message);
    setIsLoading(true);
    setSummary("");

    const response = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.body) {
      setIsLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.substring(6));
            setSummary((prev: string) => prev + json.text);
          } catch (error) {
            console.error("Error parsing stream data:", error);
          }
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 items-stretch min-h-0">
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 min-h-0">
            <ChatInput
              onSend={handleSummarize}
              isLoading={isLoading}
              sourceText={sourceText}
            />
          </div>
        </div>
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 min-h-0">
            <div className="w-full h-full border border-stone-700 rounded-3xl p-1.5">
              <div className="h-full min-h-0 rounded-2xl flex flex-col p-1.5 overflow-hidden">
                <div className="px-8 py-2 text-left flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-800">
                      Summarized Content
                    </h2>
                    <p className="text-sm text-stone-500">
                      Your summarized content will appear here
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(summary || "")
                      }
                      className="text-sm hover:bg-stone-300 text-stone-950 rounded-md transition-colors"
                    >
                      <Clipboard size={20} />
                    </button>
                    <button
                      onClick={() => {}}
                      className="text-sm hover:bg-stone-300 text-stone-950 rounded-md transition-colors"
                    >
                      <ThumbsUp size={20} />
                    </button>
                    <button
                      onClick={() => setSummary("")}
                      className="text-sm hover:bg-stone-300 text-stone-950 rounded-md transition-colors"
                    >
                      <ThumbsDown size={20} />
                    </button>
                    <button
                      onClick={() => setSummary("")}
                      className="text-sm hover:bg-stone-300 text-stone-950 rounded-md transition-colors"
                    >
                      <Command size={20} />
                    </button>
                  </div>
                </div>
                <div className="relative flex-1 min-h-0 w-full overflow-y-auto p-8">
                  {!summary ? (
                    <SummaryPreviewHolder />
                  ) : (
                    <div className="w-full text-stone-950 text-md prose prose-stone max-w-none">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-3xl font-bold mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-2xl font-semibold mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xl font-semibold mb-2">
                              {children}
                            </h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-12 mb-2">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-12 mb-2">
                              {children}
                            </ol>
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
                              navigator.clipboard.writeText(
                                String(children).trim(),
                              );
                            };
                            return (
                              <div className="relative group my-2">
                                <pre className="bg-stone-200 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                                  <code
                                    className="text-stone-950 text-xs font-mono leading-relaxed"
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
                        {summary || ""}
                      </Markdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
