"use client";

import { useState } from "react";
import ChatInput from "../chat/chat-input";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
                  <div className="w-full text-teal-950 text-lg prose prose-teal max-w-none">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold mt-2 mb-3">
                            {children}
                          </h1>
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
                          <ul className="list-disc pl-6 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-6 space-y-1">
                            {children}
                          </ol>
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
                      {summary || ""}
                    </Markdown>
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
