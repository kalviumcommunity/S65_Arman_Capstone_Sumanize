"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { User, Sparkle, Copy, CaretDown, CaretUp } from "@phosphor-icons/react";

// Custom component for rendering code blocks with syntax highlighting
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

// Collapsible user message component
function CollapsibleUserMessage({ content, timestamp }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = 24; // approximate line height
      const maxLines = 3;
      const maxHeight = lineHeight * maxLines;
      setIsTruncated(contentRef.current.scrollHeight > maxHeight);
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
      <div className="max-w-[80%] bg-neutral-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3">
          <div
            ref={contentRef}
            className={`text-neutral-200 ${
              !isExpanded && isTruncated ? "max-h-[72px] overflow-hidden" : ""
            }`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: !isExpanded && isTruncated ? 3 : "none",
              WebkitBoxOrient: "vertical",
              overflow: !isExpanded && isTruncated ? "hidden" : "visible",
            }}
          >
            {content}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-neutral-500">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={14} />
              </button>

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
    </div>
  );
}

// AI response component
function AIResponse({ content, timestamp }) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <Sparkle weight="duotone" className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="prose prose-invert prose-sm max-w-none break-words">
              <ReactMarkdown components={CodeBlock}>{content}</ReactMarkdown>
            </div>

            <div className="flex items-center justify-between mt-3">
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

export default function MessageList({ messages, loading, isAuthenticated }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Sparkle weight="light" className="w-16 h-16 text-neutral-600 mb-4" />
        <h2 className="text-2xl font-semibold text-neutral-200">Sumanize</h2>
        <p className="text-neutral-400 mt-2">
          {isAuthenticated
            ? "Send a message to begin summarizing."
            : "You can send a few messages as a guest to try it out."}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-4">
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
