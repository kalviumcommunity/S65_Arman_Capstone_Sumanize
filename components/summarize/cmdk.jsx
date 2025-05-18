"use client";

import { useState, useRef, useEffect } from "react";
import { Clock } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const VisuallyHidden = ({ children }) => (
  <span
    style={{
      border: 0,
      clip: "rect(0 0 0 0)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

export default function ChatInputModal({ onSubmit, isLoading }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);

  const chatHistory = [
    { id: 1, text: "Climate Change Effects on Global Food Systems" },
    { id: 2, text: "Core Concepts from Machine Learning Research Paper" },
    { id: 3, text: "Startup Growth Tactics: A Quick Breakdown" },
    { id: 4, text: "Interview Highlights: Leadership and Innovation Insights" },
    { id: 5, text: "Psychological Principles from Recent Book Chapter" },
  ];

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        150,
        Math.max(50, textareaRef.current.scrollHeight),
      )}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue);
      setInputValue("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const selectHistoryItem = (text) => {
    setInputValue(text);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-transparent border-none shadow-none max-w-2xl w-full flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Chat Input</DialogTitle>
        </VisuallyHidden>
        <div className="bg-neutral-950/90 backdrop-blur-sm rounded-md p-6 shadow-none border border-neutral-800">
          <div className="w-full flex justify-end text-sm text-neutral-500 pb-2">
            <div className="flex items-center gap-1">
              <span>Press</span>
              <code className="px-2 py-0.5 text-xs bg-neutral-800 rounded-sm">
                Esc
              </code>
              <span>to dismiss,</span>
              <code className="px-2 py-0.5 text-xs bg-neutral-800 rounded-sm">
                Enter
              </code>
              <span>to send</span>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full flex items-center gap-2 border-none bg-neutral-900/40 focus-ring-0 rounded-md mt-4 mx-auto px-4 py-3"
          >
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pasete or content here…"
              className="flex-grow resize-none rounded-md py-1 px-2 text-md text-neutral-200 bg-transparent border-none outline-none focus:ring-0 placeholder:text-neutral-500"
              style={{ minHeight: "28px", maxHeight: "150px" }}
              rows={1}
            />
          </form>
          {open && (
            <ScrollArea className="mt-1 max-h-[300px]">
              <div className="py-2">
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>Recent conversations</span>
                  </div>
                  <div className="space-y-1">
                    {chatHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => selectHistoryItem(item.text)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-900 text-neutral-300 text-sm transition-colors cursor-pointer"
                      >
                        <p className="line-clamp-1">{item.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
