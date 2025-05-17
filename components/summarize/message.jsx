"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  CaretUp,
  CaretDown,
  Clipboard,
  Check,
  DownloadSimple,
  ArrowsClockwise,
  PencilSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const [isUserMessageExpanded, setIsUserMessageExpanded] = useState(false);
  const { type, data } = message;
  const isUser = type === "user";

  let content;
  if (isUser) {
    content =
      data.text || (typeof data === "string" ? data : "No input provided");
  } else if (type === "ai") {
    content = data.summary || data.text;
    if (!content && data.data) content = data.data.summary || data.data.text;
    if (!content && typeof data === "string") content = data;
    if (!content) content = "AI response could not be displayed.";
  } else if (type === "error") {
    content = `Error: ${data.message || "An unknown error occurred."}`;
  } else {
    content = "Unsupported message format.";
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const isLongUserContent =
    isUser && typeof content === "string" && content.length > 100;

  return (
    <div
      className={cn(
        "flex py-4",
        isUser ? "p-8 text-md justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex items-start gap-4",
          isUser
            ? "flex-row-reverse max-w-[50%]"
            : "flex-row max-w-[85%] pl-20",
        )}
      >
        <div className="flex flex-col w-full">
          <div
            className={cn(
              "p-4 rounded-lg shadow-none relative group",
              isUser
                ? "bg-neutral-800/40 text-neutral-300"
                : "bg-transparent text-neutral-50",
              message.type === "error" ? "bg-rose-500 text-neutral-300" : "",
            )}
          >
            {isUser ? (
              <div className="text-md">
                {" "}
                <div
                  className={cn(
                    "whitespace-pre-wrap break-words",
                    !isUserMessageExpanded && isLongUserContent
                      ? "max-h-[7.5rem] overflow-hidden relative"
                      : "",
                  )}
                  style={
                    !isUserMessageExpanded && isLongUserContent
                      ? {
                          maskImage:
                            "linear-gradient(to bottom, black 60%, transparent 100%)",
                          WebkitMaskImage:
                            "linear-gradient(to bottom, black 60%, transparent 100%)",
                        }
                      : {}
                  }
                >
                  {content}
                </div>
                {isLongUserContent && (
                  <Button
                    onClick={() =>
                      setIsUserMessageExpanded(!isUserMessageExpanded)
                    }
                    variant="link"
                    className="text-neutral-400 hover:text-neutral-300 p-0 h-auto mt-2 text-xs font-medium"
                  >
                    {isUserMessageExpanded ? (
                      <CaretUp className="h-4 w-4" />
                    ) : (
                      <CaretDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            ) : message.type === "ai" && typeof content === "string" ? (
              <div className="prose prose-s prose-invert max-w-none text-md">
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p
                        className="mb-4 last:mb-0 text-neutral-300"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc pl-8 mb-4 text-neutral-300"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal pl-8 mb-4 text-neutral-300"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-4 text-neutral-300" {...props} />
                    ),
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <pre
                          className="bg-neutral-800/80 text-neutral-300 p-8 rounded-md my-3 overflow-x-auto text-sm"
                          {...props}
                        >
                          <code>{children}</code>
                        </pre>
                      ) : (
                        <code
                          className={cn(
                            className,
                            "bg-neutral-900 text-neutral-300 px-2 py-1 rounded-sm text-sm",
                          )}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-xl font-semibold my-4 text-neutral-300"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-lg font-semibold my-4 text-neutral-300"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-md font-semibold my-4 text-neutral-300"
                        {...props}
                      />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-neutral-700 pl-4 italic my-4 text-neutral-300"
                        {...props}
                      />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      onClick={handleCopy}
                      variant="ghost"
                      size="md"
                      className="h-8 px-3 text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        console.log("Download clicked");
                      }}
                      variant="ghost"
                      size="md"
                      className="h-8 px-3 text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800"
                    >
                      <DownloadSimple className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        console.log("Retry clicked");
                      }}
                      variant="ghost"
                      size="md"
                      className="h-8 px-3 text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800"
                    >
                      <ArrowsClockwise className="h-4 w-4" />
                    </Button>

                    <div className="text-xs text-neutral-500 ml-2 mt-2">
                      Generated with Gemini 2.0 Flash
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            )}
            {isUser && (
              <div className="absolute bottom-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => {
                    console.log("Download clicked");
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800"
                >
                  <DownloadSimple className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    console.log("Edit clicked");
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800"
                >
                  <PencilSimple className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
