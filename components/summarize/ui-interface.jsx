"use client";

import { useEffect, useRef } from "react";
import { StarFour } from "@phosphor-icons/react";
import ChatMessage from "./message";

export default function ChatDisplay({ messages }) {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="flex-grow relative overflow-hidden bg-transparent h-full">
      <div
        className="h-full w-full overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800"
        ref={containerRef}
      >
        <div className="max-w-4xl w-full mx-auto h-full">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="flex flex-col items-center mb-4">
                <StarFour size={60} className="text-neutral-300 mb-2" />
                <h1 className="text-6xl font-serif text-neutral-300 text-center tracking-wide">
                  Sumanize
                </h1>
              </div>
              <p className="w-full max-w-md text-neutral-400 text-sm text-center">
                Press{" "}
                <code className="bg-neutral-800 text-neutral-300 px-1 rounded font-mono text-sm">
                  ⌘+K
                </code>{" "}
                or{" "}
                <code className="bg-neutral-800 text-neutral-300 px-1 rounded font-mono text-sm">
                  Ctrl+K
                </code>{" "}
                to open the command/input palette. To enter a new line, use{" "}
                <code className="bg-neutral-800 text-neutral-300 px-1 rounded font-mono text-sm">
                  Shift+Enter
                </code>{" "}
                and{" "}
                <code className="bg-neutral-800 text-neutral-300 px-1 rounded font-mono text-sm">
                  Enter
                </code>{" "}
                to send content.
              </p>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  );
}
