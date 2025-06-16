import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CitationRenderer } from "./citation-renderer";
import {
  Clipboard,
  Check,
  ArrowsClockwise,
  ArrowLineRight,
  ThumbsUp,
  ThumbsDown,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CodeBlock = ({ children, className, ...props }) => {
  const [copied, setCopied] = useState(false);

  const getTextContent = (element) => {
    if (typeof element === "string") {
      return element;
    }
    if (Array.isArray(element)) {
      return element.map(getTextContent).join("");
    }
    if (element && typeof element === "object" && element.props) {
      return getTextContent(element.props.children);
    }
    return "";
  };

  const handleCopy = async () => {
    try {
      const textContent = getTextContent(children);
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="mb-4 rounded-xl bg-comet-900 overflow-hidden relative">
      <pre
        className="p-8 text-sm text-comet-100 overflow-x-auto whitespace-pre-wrap break-words font-mono"
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
        {...props}
      >
        {children}
      </pre>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={handleCopy}
              className="absolute top-2 right-2 h-10 w-10 flex items-center text-xs bg-comet-800 hover:bg-comet-850 rounded-full cursor-pointer transition-colors duration-300 group"
            >
              <span className="block group-hover:hidden">
                <Clipboard size={12} weight="bold" />
              </span>
              <span className="hidden group-hover:block">
                {copied ? (
                  <Check
                    size={12}
                    weight="bold"
                    className="animate-in zoom-in-50 duration-300 ease-out text-green-400"
                  />
                ) : (
                  <Clipboard size={12} weight="bold" />
                )}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Copied!" : "Copy code"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const ResponseActions = ({
  message,
  onCopyMarkdown,
  onRegenerate,
  isRegenerating,
}) => {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
      if (onCopyMarkdown) onCopyMarkdown();
    } catch (err) {
      console.error("Failed to copy markdown:", err);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && !isRegenerating) {
      onRegenerate(message);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-comet-800">
      <div className="flex justify-end">
        <div className="flex flex-col items-end">
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleCopyMarkdown}
                    className="h-10 w-10 flex items-center text-xs bg-comet-800 hover:bg-comet-850 rounded-full cursor-pointer transition-colors duration-300 group"
                  >
                    <span className="block group-hover:hidden">
                      <Clipboard size={12} />
                    </span>
                    <span className="hidden group-hover:block">
                      {copiedMarkdown ? (
                        <Check
                          size={12}
                          className="animate-in zoom-in-50 duration-300 ease-out text-green-400"
                        />
                      ) : (
                        <Clipboard size={12} />
                      )}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copiedMarkdown ? "Copied!" : "Copy"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleLike}
                    className={`h-10 w-10 flex items-center text-xs transition-colors duration-300 rounded-full bg-comet-800 hover:bg-comet-850 cursor-pointer`}
                  >
                    <ThumbsUp size={12} weight={liked ? "fill" : "regular"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{liked ? "Remove" : "Like"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleDislike}
                    className={`h-10 w-10 flex items-center text-xs transition-colors duration-300 rounded-full bg-comet-800 hover:bg-comet-850 cursor-pointer`}
                  >
                    <ThumbsDown
                      size={12}
                      weight={disliked ? "fill" : "regular"}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{disliked ? "Remove" : "Dislike"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="h-10 w-10 flex items-center text-xs bg-comet-800 hover:bg-comet-850 rounded-full cursor-pointer transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <ArrowsClockwise
                      size={12}
                      className={isRegenerating ? "animate-spin" : ""}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRegenerating ? "Regenerating..." : "Regenerate"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <p className="text-xs text-comet-400 opacity-80 mt-2">
            Sumanize can make mistakes. Please double-check important
            information.
          </p>
        </div>
      </div>
    </div>
  );
};

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
  pre: ({ children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
  code: ({ node, ...props }) => (
    <code className="rounded-lg text-xs bg-comet-900 px-2.5 py-1" {...props} />
  ),
  p: ({ node, ...props }) => <p className="mb-4" {...props} />,
};

export function MessageItem({
  message,
  onPastedContentClick,
  onCitationClick,
  onCopyMarkdown,
  onRegenerate,
  isRegenerating = false,
  isPastedContentOpen = false,
  currentPastedContent = null,
}) {
  if (message.role === "user") {
    const TRUNCATE_THRESHOLD = 350;
    const [isExpanded, setIsExpanded] = useState(false);

    const needsTruncation = message.content.length > TRUNCATE_THRESHOLD;

    const displayedContent =
      needsTruncation && !isExpanded
        ? `${message.content.substring(0, TRUNCATE_THRESHOLD)}...`
        : message.content;

    const isThisContentOpen =
      isPastedContentOpen && currentPastedContent === message.pastedContent;

    const handlePastedContentClick = () => {
      if (isThisContentOpen) {
        if (onPastedContentClick) {
          onPastedContentClick(null, []);
        }
      } else {
        if (onPastedContentClick) {
          onPastedContentClick(message.pastedContent, message.citations);
        }
      }
    };

    return (
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-col w-full">
          {message.pastedContent && (
            <div className="mb-2 flex justify-end">
              <div
                onClick={handlePastedContentClick}
                className="w-1/2 text-sm text-comet-300 bg-comet-900 hover:bg-comet-850 border-4 border-comet-750 p-3 rounded-xl cursor-pointer transition-colors duration-300 flex items-center justify-between"
              >
                <span>
                  Pasted content ({message.pastedContent.length} characters)
                </span>
                <ArrowLineRight size={16} weight="bold" />
              </div>
            </div>
          )}

          {message.content && message.content.trim() && (
            <div className="rounded-xl bg-comet-850 p-4">
              <ReactMarkdown
                components={{
                  ...MarkdownComponents,
                  p: ({ node, ...props }) => <p className="my-0" {...props} />,
                }}
              >
                {displayedContent}
              </ReactMarkdown>

              {needsTruncation && (
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-sm cursor-pointer opacity-80 hover:opacity-100"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </Button>
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

  const hasCitations =
    (message.hasCitations &&
      message.citations &&
      message.citations.length > 0) ||
    (message.citations && message.citations.length > 0);

  console.log("MessageItem AI response:", {
    messageId: message.id,
    hasCitations,
    citationsLength: message.citations?.length || 0,
    hasHasCitationsFlag: message.hasHasCitationsFlag,
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
      <div className="flex min-w-0 flex-col p-6 w-full">
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

        <ResponseActions
          message={message}
          onCopyMarkdown={onCopyMarkdown}
          onRegenerate={onRegenerate}
          isRegenerating={isRegenerating}
        />
      </div>
    </div>
  );
}
