import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CaretDown, CaretRight, Paperclip } from "@phosphor-icons/react";

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
  if (message.role === "user") {
    const TRUNCATE_THRESHOLD = 350;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPastedContentExpanded, setIsPastedContentExpanded] =
      useState(false);

    const needsTruncation = message.content.length > TRUNCATE_THRESHOLD;

    const displayedContent =
      needsTruncation && !isExpanded
        ? `${message.content.substring(0, TRUNCATE_THRESHOLD)}...`
        : message.content;

    return (
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-col w-full">
          {/* Pasted Content Section - Collapsible */}
          {message.pastedContent && (
            <div className="mb-3 border border-neutral-700 rounded-lg bg-neutral-800/30">
              <button
                onClick={() =>
                  setIsPastedContentExpanded(!isPastedContentExpanded)
                }
                className="w-full flex items-center justify-between p-3 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Paperclip size={16} />
                  <span>
                    Pasted content ({message.pastedContent.length} characters)
                  </span>
                </div>
                {isPastedContentExpanded ? (
                  <CaretDown size={16} className="text-neutral-400" />
                ) : (
                  <CaretRight size={16} className="text-neutral-400" />
                )}
              </button>

              {isPastedContentExpanded && (
                <div className="px-3 pb-3">
                  <div className="bg-neutral-900/50 rounded p-3 max-h-96 overflow-y-auto">
                    <ReactMarkdown
                      components={{
                        ...MarkdownComponents,
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0" {...props} />
                        ),
                      }}
                    >
                      {message.pastedContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Prompt Section */}
          <div className="rounded-xl bg-neutral-800/50 p-6">
            <ReactMarkdown
              components={{
                ...MarkdownComponents,
                p: ({ node, ...props }) => <p className="my-0" {...props} />,
              }}
            >
              {displayedContent}
            </ReactMarkdown>

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

  return (
    <div className="flex items-start gap-4 text-lg">
      <div className="flex min-w-0 flex-col p-6">
        <ReactMarkdown components={MarkdownComponents}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
