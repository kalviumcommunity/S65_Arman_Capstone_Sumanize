import { useState } from "react";
import ReactMarkdown from "react-markdown";

const MarkdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="mb-4 text-2xl font-bold" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="mb-3 text-xl font-semibold" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mb-3 text-lg font-semibold" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mb-4 list-disc space-y-2 pl-5" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="text-blue-400 hover:underline" {...props} />
  ),
  pre: ({ node, ...props }) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-white"
      {...props}
    />
  ),
  code: ({ node, ...props }) => (
    <code className="rounded bg-neutral-800 px-1.5 py-1" {...props} />
  ),
  p: ({ node, ...props }) => <p className="mb-4" {...props} />,
};

export function MessageItem({ message }) {
  // --- USER MESSAGE LOGIC ---
  if (message.role === "user") {
    // 2. Define a character limit and manage the expanded state
    const TRUNCATE_THRESHOLD = 350; // Characters to show when collapsed
    const [isExpanded, setIsExpanded] = useState(false);

    const needsTruncation = message.content.length > TRUNCATE_THRESHOLD;

    const displayedContent =
      needsTruncation && !isExpanded
        ? `${message.content.substring(0, TRUNCATE_THRESHOLD)}...`
        : message.content;

    return (
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-col">
          <div className="rounded-xl bg-neutral-800/50 p-6">
            <ReactMarkdown
              components={{
                ...MarkdownComponents,
                p: ({ node, ...props }) => <p className="my-0" {...props} />,
              }}
            >
              {displayedContent}
            </ReactMarkdown>

            {/* 3. Show a "Show more/less" button if needed */}
            {needsTruncation && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-sm cursor-pointer opacity-80 hover:opacity-100"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- AI MESSAGE LOGIC (Unchanged) ---
  return (
    <div className="flex items-start gap-4">
      <div className="flex min-w-0 flex-col p-6">
        <ReactMarkdown components={MarkdownComponents}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
