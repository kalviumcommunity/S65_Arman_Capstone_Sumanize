"use client";

import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X } from "@phosphor-icons/react";

interface FocusedSummarizerProps {
  selection: {
    text: string;
    rect: DOMRect | null;
  };
  onClose: () => void;
  onSummarize: (text: string) => void;
}

export default function FocusedSummarizer({
  selection,
  onClose,
}: FocusedSummarizerProps) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selection.text) {
      handleSummarize(selection.text);
    }
  }, [selection.text]);

  const handleSummarize = async (message: string) => {
    setIsLoading(true);
    setSummary("");

    const response = await fetch("/api/focused-stream", {
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
            setSummary((prev) => prev + json.text);
          } catch (error) {
            console.error("Error parsing stream data:", error);
          }
        }
      }
    }
    setIsLoading(false);
  };

  if (!selection.text) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-stone-300 rounded-3xl p-1.5 w-full max-w-2xl max-h-[90vh] flex flex-col border border-stone-700 shadow-2xl">
        <div className="flex-1 overflow-y-auto p-6 bg-stone-200 rounded-2xl">
          {isLoading && !summary && (
            <p className="text-stone-950">Generating summary...</p>
          )}
          <div className="prose prose-stone text-stone-950 max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-3 text-stone-950">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mb-2 text-stone-950">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mb-2 text-stone-950">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-3 text-stone-950">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-3 text-stone-950">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed mb-1 text-stone-950">
                    {children}
                  </li>
                ),
                p: ({ children }) => (
                  <p className="leading-relaxed mb-3 text-stone-950">
                    {children}
                  </p>
                ),
                table: ({ children }) => (
                  <div className="my-4 overflow-x-auto border border-stone-400 rounded-lg">
                    <table className="w-full text-sm text-left text-stone-950">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-stone-300 border-b border-stone-400">
                    {children}
                  </thead>
                ),
                tr: ({ children }) => (
                  <tr className="bg-stone-100 border-b border-stone-400 last:border-b-0 hover:bg-stone-50 transition-colors duration-200">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th
                    scope="col"
                    className="px-4 py-2 font-semibold text-stone-950"
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 align-top text-stone-950">
                    {children}
                  </td>
                ),
                hr: ({ children }) => <hr className="my-4 border-stone-400" />,
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
                        className="px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-200 text-sm font-mono"
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
                    <div className="relative group my-3">
                      <pre className="bg-stone-100 rounded-md p-4 overflow-x-auto whitespace-pre-wrap break-words">
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
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-stone-400 pl-4 my-4 italic text-stone-700">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-stone-950">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-stone-800">{children}</em>
                ),
              }}
            >
              {summary}
            </Markdown>
          </div>
        </div>
        <div className="p-6 max-h-32 overflow-y-auto">
          <h3 className="font-semibold text-stone-950 mb-2">Selected Text:</h3>
          <p className="text-sm line-clamp-2 text-stone-600">
            {selection.text}
          </p>
        </div>
      </div>
    </div>
  );
}
