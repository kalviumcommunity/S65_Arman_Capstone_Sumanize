"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  CaretUp,
  CaretDown,
  Clipboard,
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowsClockwise,
  PencilSimple,
  CircleNotch,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Fade in animation variant
const fadeIn = {
  hidden: {
    opacity: 0,
    filter: "blur(40px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0,
      ease: "easeInOut",
    },
  },
};

// Loading spinner component
const LoadingSpinner = () => {
  return (
    <div className="flex items-center gap-3 p-4 text-neutral-300">
      <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
      <span>Just a moment...</span>
    </div>
  );
};

export default function ChatMessage({ message, isLoading, isLastMessage }) {
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

  // If it's the AI's turn to respond and it's loading, show the spinner
  if (isLoading && isLastMessage && !isUser) {
    return (
      <div className="flex py-4 justify-start">
        <div className="flex items-start gap-4 flex-row max-w-[85%] pl-20">
          <div className="flex flex-col w-full">
            <div className="p-4 rounded-md shadow-none relative group bg-transparent text-neutral-50">
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex",
        isUser ? "p-4 text-md justify-end" : "justify-start",
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
          {isUser ? (
            <div
              className={cn(
                "p-4 rounded-md shadow-none relative group max-w-[80%]",
                "bg-neutral-800/40 text-neutral-300",
                message.type === "error" ? "bg-rose-500 text-neutral-300" : "",
              )}
            >
              <div className="text-md">
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
                  <div className="flex items-center mt-2">
                    <Button
                      onClick={handleCopy}
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                    >
                      {copied ? (
                        <Check weight="bold" />
                      ) : (
                        <Clipboard weight="bold" />
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        console.log("Edit clicked");
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                    >
                      <PencilSimple weight="bold" />
                    </Button>
                    <Button
                      onClick={() =>
                        setIsUserMessageExpanded(!isUserMessageExpanded)
                      }
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                    >
                      {isUserMessageExpanded ? (
                        <CaretUp weight="bold" />
                      ) : (
                        <CaretDown weight="bold" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
              {!isLongUserContent && (
                <div className="absolute bottom-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                  >
                    {copied ? (
                      <Check weight="bold" />
                    ) : (
                      <Clipboard weight="bold" />
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      console.log("Edit clicked");
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                  >
                    <PencilSimple weight="bold" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className={cn(
                "p-4 rounded-md shadow-none relative group",
                "bg-transparent text-neutral-50 mb-16 ",
                message.type === "error" ? "bg-rose-500 text-neutral-300" : "",
              )}
            >
              {message.type === "ai" && typeof content === "string" ? (
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
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }) => {
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
                  <div className="flex items-center justify-start mt-4">
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="md"
                        className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                      >
                        {copied ? (
                          <Check weight="bold" />
                        ) : (
                          <Clipboard weight="bold" />
                        )}
                      </Button>

                      <Button
                        onClick={() => {
                          console.log("Thumbs up clicked");
                        }}
                        variant="ghost"
                        size="md"
                        className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                      >
                        <ThumbsUp weight="bold" />
                      </Button>

                      <Button
                        onClick={() => {
                          console.log("Thumbs down clicked");
                        }}
                        variant="ghost"
                        size="md"
                        className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                      >
                        <ThumbsDown weight="bold" />
                      </Button>

                      <Button
                        onClick={() => {
                          console.log("Retry clicked");
                        }}
                        variant="ghost"
                        size="md"
                        className="h-12 w-12 rounded-full text-neutral-300 hover:text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                      >
                        <ArrowsClockwise weight="bold" />
                      </Button>

                      <div className="text-xs text-neutral-500 ml-3 mt-4">
                        Generated with Gemini 2.0 Flash
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
