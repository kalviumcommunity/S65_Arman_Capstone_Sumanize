"use client";

import { useState } from "react";
import ChatInput from "../chat/chat-input";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SummaryPreviewHolder from "./preview-holder";
import { addHistory } from "@/lib/history";

export default function Summarizer() {
  const [sourceText, setSourceText] = useState("");
  const [summary, setSummary] = useState("");
  const [thinking, setThinking] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async (message: string) => {
    setSourceText(message);
    setIsLoading(true);
    setSummary("");
    setThinking("");

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

    // Generate AI title then save to history (latest 16)
    try {
      const titleRes = await fetch("/api/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: message, summary }),
      });
      const { title } = await titleRes.json();
      const finalTitle = (title as string | undefined)?.trim() ||
        (summary || message).split("\n").find((l) => l.trim().length > 0)?.slice(0, 120) ||
        "Untitled";
      addHistory({ title: finalTitle, source: message, summary });
    } catch {
      const fallback = (summary || message).split("\n").find((l) => l.trim().length > 0)?.slice(0, 120) || "Untitled";
      addHistory({ title: fallback, source: message, summary });
    }
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
            <div className="w-full h-full bg-teal-900 border border-teal-700 rounded-xl p-1.5">
              <div className="h-full min-h-0 bg-stone-300 border border-teal-700 rounded-lg flex flex-col p-1.5 overflow-hidden">
                <div className="relative flex-1 min-h-0 w-full overflow-y-auto p-8">
                  {!summary && !thinking ? (
                    <SummaryPreviewHolder />
                  ) : (
                    <>
                      {thinking && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                          <h3 className="text-sm font-semibold text-yellow-800">
                            Thinking...
                          </h3>
                          <p className="text-lg text-yellow-700 whitespace-pre-wrap">
                            {thinking}
                          </p>
                        </div>
                      )}
                      <div className="w-full text-teal-950 text-md prose prose-teal max-w-none">
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
                                  <code className="text-teal-950" {...rest}>
                                    {children}
                                  </code>
                                </pre>
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
  );
}
