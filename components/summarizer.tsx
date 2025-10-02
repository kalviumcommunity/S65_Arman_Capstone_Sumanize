"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

export default function Summarizer() {
  const router = useRouter();
  const [pastedItems, setPastedItems] = useState<string[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSummarize = useCallback(async () => {
    if (!pastedItems.length || !prompt.trim()) return;
    setIsLoading(true);
    setSummary("");

    const combinedMessage =
      `Pasted Texts (count: ${pastedItems.length}):\n` +
      pastedItems.map((t, i) => `[#${i + 1}]\n${t}\n`).join("\n") +
      `\nInstruction:\n${prompt}`;

    const response = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: combinedMessage }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        router.push("/auth");
      }
      setIsLoading(false);
      return;
    }

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
            setSummary((prev) => prev + (json.text || ""));
          } catch {}
        }
      }
    }

    setIsLoading(false);
  }, [pastedItems, prompt, router]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData("text");
      if (!text.trim()) return;
      e.preventDefault();
      setPastedItems((prev) => [...prev, text.trim()]);
      setExpandedIndex(pastedItems.length);
    },
    [pastedItems.length],
  );

  const handlePromptKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSummarize();
      }
    },
    [handleSummarize],
  );

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const markdownComponents = useMemo(
    () => ({
      h1: ({ children }: { children: React.ReactNode }) => (
        <h1 className="text-2xl font-bold mb-2">{children}</h1>
      ),
      h2: ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-xl font-semibold mb-2">{children}</h2>
      ),
      h3: ({ children }: { children: React.ReactNode }) => (
        <h3 className="text-lg font-semibold mb-2">{children}</h3>
      ),
      ul: ({ children }: { children: React.ReactNode }) => (
        <ul className="list-disc pl-6 mb-2">{children}</ul>
      ),
      ol: ({ children }: { children: React.ReactNode }) => (
        <ol className="list-decimal pl-6 mb-2">{children}</ol>
      ),
      li: ({ children }: { children: React.ReactNode }) => (
        <li className="leading-relaxed mb-2">{children}</li>
      ),
      p: ({ children }: { children: React.ReactNode }) => (
        <p className="leading-relaxed mb-2">{children}</p>
      ),
      table: ({ children }: { children: React.ReactNode }) => (
        <div className="my-4 overflow-x-auto border border-stone-500 ">
          <table className="w-full text-sm text-left text-stone-950">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }: { children: React.ReactNode }) => (
        <thead className="bg-stone-400 border-b border-stone-500">
          {children}
        </thead>
      ),
      tr: ({ children }: { children: React.ReactNode }) => (
        <tr className="bg-stone-200 border-b border-stone-500 last:border-b-0 hover:bg-stone-100 transition-colors duration-200">
          {children}
        </tr>
      ),
      th: ({ children }: { children: React.ReactNode }) => (
        <th scope="col" className="px-4 py-3 font-semibold text-stone-950">
          {children}
        </th>
      ),
      td: ({ children }: { children: React.ReactNode }) => (
        <td className="px-4 py-3 align-top text-stone-950">{children}</td>
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
              className="px-1.5 py-1 bg-[#FFF1F1] text-black text-sm font-mono inline-block"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
          <div className="relative group my-2">
            <pre className="bg-[#FFF1F1] overflow-x-auto whitespace-pre-wrap break-words">
              <code
                className="text-[#fff1f1] text-xs font-mono leading-relaxed"
                {...props}
              >
                {children}
              </code>
            </pre>
          </div>
        );
      },
    }),
    [],
  );

  return (
    <div className="min-h-screen w-full flex flex-col ">
      <div className="flex-1 w-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          <div>
            {pastedItems.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {pastedItems.map((item, idx) => {
                  const isExpanded = expandedIndex === idx;
                  const preview =
                    item.replace(/\s+/g, " ").slice(0, 160) +
                    (item.length > 160 ? "…" : "");
                  return (
                    <button
                      type="button"
                      key={`pasted-item-${idx}-${item.slice(0, 20)}`}
                      className={`relative group border-2 bg-[#B9B4C7] rounded-sm border-[#352F44] p-4 transition-all duration-200 text-left ${
                        isExpanded ? "w-full" : "w-full sm:w-[48%] lg:w-[32%]"
                      }`}
                      onClick={() => toggleExpand(idx)}
                    >
                      <div className=" flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm font-semibold tracking-wide uppercase text-black">
                              Text-{idx + 1}
                            </span>
                          </div>
                          {!isExpanded && (
                            <div className="text-sm leading-snug text-[#352F44] line-clamp-3 break-words">
                              {preview}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="relative ">
              <textarea
                ref={promptRef}
                onPaste={handlePaste}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder="Paste your text here and type your instruction"
                className="w-full min-h-full bg-[#B9B4C7] text-[#352F44] placeholder-[#352F44] border-2 border-[#352F44] rounded-sm focus:outline-none focus:ring-0 p-4 text-base disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            </div>
          </div>

          {(isLoading || summary) && (
            <div className="w-full border-2 border-[#352F44] rounded-sm bg-[#E9E9E9]">
              <div className="p-6">
                {summary ? (
                  <div className="w-full text-[#352F44] text-md prose prose-stone max-w-none">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {summary}
                    </Markdown>
                  </div>
                ) : (
                  <div className="text-stone-700 text-sm">Generating</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
