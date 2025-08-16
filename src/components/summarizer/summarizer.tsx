"use client";

import { useState } from "react";
import ChatInput from "../chat/chat-input";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SummaryPreviewHolder from "./preview-holder";
import { addHistory } from "@/lib/history";
import { Button } from "../ui/button";
import { CornersOut } from "@phosphor-icons/react";

export default function Summarizer() {
  const [sourceText, setSourceText] = useState("");
  const [summary, setSummary] = useState("");
  const [thinking, setThinking] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingCollapsed, setIsThinkingCollapsed] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed((prev) => !prev);
  };

  const handleSummarize = async (message: string) => {
    setSourceText(message);
    setIsLoading(true);
    setSummary("");
    setThinking("");
    setIsThinkingCollapsed(false);

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
            if (json.type === "thinking") {
              setThinking((prev: string) => prev + json.text);
            } else {
              setSummary((prev: string) => prev + json.text);
            }
          } catch (error) {
            console.error("Error parsing stream data:", error);
          }
        }
      }
    }

    setIsLoading(false);

    try {
      const titleRes = await fetch("/api/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: message, summary }),
      });
      const { title } = await titleRes.json();
      const finalTitle =
        (title as string | undefined)?.trim() ||
        (summary || message)
          .split("\n")
          .find((l) => l.trim().length > 0)
          ?.slice(0, 120) ||
        "Untitled";
      addHistory({ title: finalTitle, source: message, summary });
    } catch {
      const fallback =
        (summary || message)
          .split("\n")
          .find((l) => l.trim().length > 0)
          ?.slice(0, 120) || "Untitled";
      addHistory({ title: fallback, source: message, summary });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div
        className={`flex-1 grid ${
          isLeftPanelCollapsed ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        } gap-4 p-4 items-stretch min-h-0`}
      >
        {!isLeftPanelCollapsed && (
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0">
              <ChatInput
                onSend={handleSummarize}
                isLoading={isLoading}
                sourceText={sourceText}
                onToggleCollapse={toggleLeftPanel}
                isCollapsed={isLeftPanelCollapsed}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 min-h-0">
            <div className="w-full h-full border border-stone-700 rounded-3xl p-1.5">
              <div className="h-full min-h-0 rounded-2xl flex flex-col p-1.5 overflow-hidden">
                <div className="px-8 py-2 text-left bg-gradient-to-b from-stone-300 to-transparent">
                  <h2 className="text-lg font-semibold text-stone-800">
                    Summarized Content
                  </h2>
                  <p className="text-sm text-stone-600">
                    Your summarized content will appear here
                  </p>
                </div>
                <div className="relative flex-1 min-h-0 w-full overflow-y-auto p-8">
                  {isLeftPanelCollapsed && (
                    <Button
                      onClick={toggleLeftPanel}
                      size="sm"
                      className="absolute top-2 left-2 z-10 px-1.5 text-sm bg-gradient-to-b text-neutral-950 from-neutral-100 to-neutral-300 hover:bg-neutral-200 border-1 border-neutral-400 cursor-pointer active:scale-95 transition-all duration-200"
                    >
                      <CornersOut size={16} />
                    </Button>
                  )}
                  <div
                    className={
                      isLeftPanelCollapsed ? "mx-auto max-w-4xl w-full" : ""
                    }
                  >
                    {!summary && !thinking ? (
                      <SummaryPreviewHolder />
                    ) : (
                      <>
                        {thinking && (
                          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                            <button
                              className="w-full text-left"
                              onClick={() =>
                                setIsThinkingCollapsed(!isThinkingCollapsed)
                              }
                            >
                              <h3 className="text-sm font-semibold text-yellow-800 flex justify-between items-center">
                                Thinking...
                                <svg
                                  className={`w-5 h-5 transition-transform ${
                                    isThinkingCollapsed ? "" : "rotate-180"
                                  }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </h3>
                            </button>
                            {!isThinkingCollapsed && (
                              <div className="pt-2 text-yellow-700 text-lg prose prose-sm max-w-none prose-yellow">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {thinking}
                                </Markdown>
                              </div>
                            )}
                          </div>
                        )}
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
                                <ul className="list-disc pl-12 mb-2">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-12 mb-2">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="leading-relaxed mb-2">
                                  {children}
                                </li>
                              ),
                              p: ({ children }) => (
                                <p className="leading-relaxed mb-2">
                                  {children}
                                </p>
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
                              code: (props) => {
                                const { inline, children, ...rest } =
                                  props as any;

                                if (inline) {
                                  return (
                                    <code
                                      className="px-1.5 py-1 rounded-md bg-stone-900 text-stone-200 text-sm font-mono inline-block"
                                      {...rest}
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
                                        {...rest}
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
