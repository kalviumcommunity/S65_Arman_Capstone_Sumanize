import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CitationRenderer } from "./citation-renderer";

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

export function MessageItem({
  message,
  onPastedContentClick,
  onCitationClick,
}) {
  if (message.role === "user") {
    const TRUNCATE_THRESHOLD = 350;
    const [isExpanded, setIsExpanded] = useState(false);

    const needsTruncation = message.content.length > TRUNCATE_THRESHOLD;

    const displayedContent =
      needsTruncation && !isExpanded
        ? `${message.content.substring(0, TRUNCATE_THRESHOLD)}...`
        : message.content;

    return (
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-col w-full">
          {message.pastedContent && (
            <div className="mb-2">
              <div
                onClick={() =>
                  onPastedContentClick &&
                  onPastedContentClick(message.pastedContent, message.citations)
                }
                className="text-sm text-comet-300 bg-comet-900 border-4 border-comet-850 p-3 rounded-xl text-center cursor-pointer hover:bg-comet-800 transition-colors duration-200"
              >
                Pasted content ({message.pastedContent.length} characters)
              </div>
            </div>
          )}

          {message.content && message.content.trim() && (
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
          )}

          {!message.content?.trim() && message.pastedContent && (
            <div className="rounded-xl bg-neutral-800/30 p-4 text-center text-sm text-neutral-400 italic">
              Content shared without additional prompt
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Assistant response
  const hasCitations =
    (message.hasCitations &&
      message.citations &&
      message.citations.length > 0) ||
    (message.citations && message.citations.length > 0);

  console.log("MessageItem AI response:", {
    messageId: message.id,
    hasCitations,
    citationsLength: message.citations?.length || 0,
    hasHasCitationsFlag: message.hasCitations,
    citations:
      message.citations?.map((c) => ({ id: c.id, isMatched: c.isMatched })) ||
      [],
  });

  const handleCitationClick = (citation, citationId) => {
    console.log("Citation clicked in MessageItem:", { citation, citationId });
    if (onCitationClick) {
      onCitationClick(citation, citationId, message);
    }
  };

  return (
    <div className="flex items-start gap-4 text-md">
      <div className="flex min-w-0 flex-col p-6">
        {hasCitations ? (
          <CitationRenderer
            content={message.content}
            citations={message.citations}
            onCitationClick={handleCitationClick}
          />
        ) : (
          <ReactMarkdown components={MarkdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
