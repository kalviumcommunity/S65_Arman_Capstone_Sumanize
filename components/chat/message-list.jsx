"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Sparkle, Copy, CaretDown, CaretUp } from "@phosphor-icons/react";

const CodeBlock = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={atomDark}
        language={match[1]}
        PreTag="div"
        wrapLines={true}
        lineProps={{
          style: { wordBreak: "break-all", whiteSpace: "pre-wrap" },
        }}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

function CollapsibleUserMessage({ content, timestamp }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsTruncated(
        contentRef.current.scrollHeight > contentRef.current.clientHeight,
      );
    }
  }, [content]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex justify-end mb-6">
      <div className="max-w-[60%] bg-neutral-800/50 rounded-2xl overflow-hidden">
        <div className="px-8 py-8">
          <div
            ref={contentRef}
            className={`prose prose-invert max-w-none text-neutral-200 ${
              !isExpanded ? "line-clamp-3" : ""
            }`}
          >
            <ReactMarkdown components={CodeBlock}>{content}</ReactMarkdown>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="text-xs text-neutral-500">
                {new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={14} />
              </button>
            </div>

            {isTruncated && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AIResponse({ content, timestamp }) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Enhanced container with proper markdown styling */}
          <div
            className="prose prose-invert max-w-none break-words rounded-md px-8 py-8
                          prose-headings:text-neutral-100 prose-headings:font-semibold 
                          prose-p:text-neutral-200 prose-p:leading-relaxed
                          prose-strong:text-neutral-100 prose-strong:font-semibold
                          prose-li:text-neutral-200 prose-li:leading-relaxed
                          prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-700
                          prose-code:text-neutral-100 prose-code:bg-neutral-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                          [&_ol]:list-decimal [&_ul]:list-disc
                          [&_h3]:text-lg [&_h3]:border-b [&_h3]:border-neutral-700 [&_h3]:pb-2"
          >
            <ReactMarkdown components={CodeBlock}>{content}</ReactMarkdown>
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                {new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageList({
  messages,
  loading,
  isAuthenticated,
  scrollContainerRef,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message only when loading a new response
  useEffect(() => {
    if (!loading) return;

    const scrollContainer = scrollContainerRef?.current;
    if (!scrollContainer) return;

    const isScrolledToBottom =
      scrollContainer.scrollHeight -
        scrollContainer.scrollTop -
        scrollContainer.clientHeight <
      200;

    if (isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, messages.length, scrollContainerRef]);

  // if (messages.length === 0 && !loading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-full text-center">
  //       <Sparkle weight="light" className="w-16 h-16 text-neutral-600 mb-4" />
  //       <h2 className="text-2xl font-semibold text-neutral-200">Sumanize</h2>
  //       <p className="text-neutral-400 mt-2">
  //         {isAuthenticated
  //           ? "Send a message to begin summarizing."
  //           : "You can send a few messages as a guest to try it out."}
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="pt-8 pb-4">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? (
            <CollapsibleUserMessage
              content={message.content}
              timestamp={message.timestamp}
            />
          ) : (
            <AIResponse
              content={message.content}
              timestamp={message.timestamp}
            />
          )}
        </div>
      ))}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                <Sparkle
                  weight="duotone"
                  className="w-5 h-5 text-neutral-400"
                />
              </div>
              <div className="bg-neutral-800 text-neutral-100 rounded-lg px-4 py-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
