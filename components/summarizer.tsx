"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, XCircle, ArrowCircleRight } from "@phosphor-icons/react";

export default function Summarizer() {
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

    const combinedMessage = `Pasted Texts (count: ${pastedItems.length}):\n` +
      pastedItems.map((t, i) => `[#${i + 1}]\n${t}\n`).join("\n") +
      `\nInstruction:\n${prompt}`;

    const response = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: combinedMessage }),
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
            setSummary((prev) => prev + (json.text || ""));
          } catch {}
        }
      }
    }

    setIsLoading(false);
  }, [pastedItems, prompt]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text.trim()) return;
    e.preventDefault();
    setPastedItems(prev => [...prev, text.trim()]);
    setExpandedIndex(pastedItems.length); // expand the newly added item
  }, [pastedItems.length]);

  const handlePromptKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSummarize();
    }
  }, [handleSummarize]);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(prev => prev === idx ? null : idx);
  };

  const markdownComponents = useMemo(
    () => ({
      h1: ({ children }: { children: React.ReactNode }) => (
        <h1 className="text-3xl font-bold mb-2">{children}</h1>
      ),
      h2: ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-2xl font-semibold mb-2">{children}</h2>
      ),
      h3: ({ children }: { children: React.ReactNode }) => (
        <h3 className="text-xl font-semibold mb-2">{children}</h3>
      ),
      ul: ({ children }: { children: React.ReactNode }) => (
        <ul className="list-disc pl-12 mb-2">{children}</ul>
      ),
      ol: ({ children }: { children: React.ReactNode }) => (
        <ol className="list-decimal pl-12 mb-2">{children}</ol>
      ),
      li: ({ children }: { children: React.ReactNode }) => (
        <li className="leading-relaxed mb-2">{children}</li>
      ),
      p: ({ children }: { children: React.ReactNode }) => (
        <p className="leading-relaxed mb-2">{children}</p>
      ),
      table: ({ children }: { children: React.ReactNode }) => (
        <div className="my-4 overflow-x-auto border border-stone-500 rounded-lg">
          <table className="w-full text-sm text-left text-stone-950">{children}</table>
        </div>
      ),
      thead: ({ children }: { children: React.ReactNode }) => (
        <thead className="bg-stone-400 border-b border-stone-500">{children}</thead>
      ),
      tr: ({ children }: { children: React.ReactNode }) => (
        <tr className="bg-stone-200 border-b border-stone-500 last:border-b-0 hover:bg-stone-100 transition-colors duration-200">{children}</tr>
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
              className="px-1.5 py-1 rounded-md bg-stone-900 text-stone-200 text-sm font-mono inline-block"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
          <div className="relative group my-2">
            <pre className="bg-stone-900 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
              <code className="text-stone-950 text-xs font-mono leading-relaxed" {...props}>
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
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <div>
          {pastedItems.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {pastedItems.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                const preview = item.replace(/\s+/g, ' ').slice(0, 160) + (item.length > 160 ? '…' : '');
                return (
                  <div
                    key={idx}
                    className={`relative group border-4 border-[#B8C4A9] bg-[#FFF0DD] rounded-lg p-4 transition-all duration-200 ${isExpanded ? 'w-full' : 'w-full sm:w-[48%] lg:w-[32%]'}`}
                    onClick={() => toggleExpand(idx)}
                    title={isExpanded ? 'Click to collapse' : 'Click to expand'}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold tracking-wide uppercase text-stone-500">Text-{idx + 1}</span>
                        </div>
                        {!isExpanded && (
                          <div
                            className="text-[11px] leading-snug text-stone-700 line-clamp-3 break-words"
                            aria-label={item}
                          >
                            {preview}
                          </div>
                        )}
                        {isExpanded && (
                          <div className="mt-1 text-xs leading-relaxed text-stone-800 whitespace-pre-wrap break-words max-h-72 overflow-y-auto pr-1">
                            {item}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPastedItems(prev => prev.filter((_, i) => i !== idx)); if (expandedIndex === idx) setExpandedIndex(null); }}
                        className="text-xl cursor-pointer"
                        aria-label={`Remove pasted text ${idx + 1}`}
                      >
                        <XCircle size={20} weight="fill" className="text-[#6FA4AF]"/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative">
            <textarea
              ref={promptRef}
              onPaste={handlePaste}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Paste your text here and type your instruction"
              className="w-full min-h-40 bg-[#FFF0DD] rounded-xl text-neutral-950 placeholder-neutral-950 border-4 border-[#B8C4A9] focus:outline-none focus:ring-0 p-4 text-base"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isLoading || !prompt.trim() || pastedItems.length === 0}
              className="absolute right-4 bottom-4 rounded-lg transition-colors text-sm font-medium cursor-pointer"
            >
              <ArrowCircleRight size={32} weight="fill" className="text-[#6FA4AF]"/>
            </button>
          </div>
        </div>

        {(isLoading || summary) && (
          <div className="w-full border border-stone-400 rounded-2xl bg-stone-200">
            <div className="px-6 py-4 border-b border-stone-400 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Summary</h2>
                <p className="text-sm text-stone-600">Output generated from your pasted texts</p>
              </div>
            </div>
            <div className="p-6">
              {summary ? (
                <div className="w-full text-stone-950 text-md prose prose-stone max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents as any}>
                    {summary}
                  </Markdown>
                </div>
              ) : (
                <div className="text-stone-700 text-sm">Streaming summary…</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


