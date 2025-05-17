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
    <div className="flex-grow relative overflow-hidden mb-4 bg-transparent h-full">
      <div
        className="h-full w-full overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800"
        ref={containerRef}
      >
        <div className="max-w-5xl w-full mx-auto min-h-[calc(100vh-4rem)]">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] text-center px-4">
              <div className="flex flex-col items-center mb-4">
                <StarFour size={60} className="text-neutral-300 mb-2" />
                <h1 className="text-6xl font-serif text-neutral-300 text-center tracking-wide">
                  Sumanize
                </h1>
              </div>
              <p className="w-full max-w-md text-neutral-400 text-sm">
                Just paste it here, and we'll break it down into a clear, short
                summary you can read in seconds. Powered by{" "}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-neutral-300"
                >
                  Gemini 2.0 Flash
                </a>
                .
              </p>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  );
}
