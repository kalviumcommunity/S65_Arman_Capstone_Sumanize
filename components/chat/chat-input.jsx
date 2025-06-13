import { useState, useRef } from "react";
import { ArrowUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSendMessage, isLoading }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const messageContent = textareaRef.current?.value.trim();

    if (!messageContent || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSendMessage(messageContent);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAutoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full flex justify-center px-4 py-4">
      <div className="w-full max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 rounded-xl bg-neutral-900 border-4 border-neutral-800 p-3 shadow-lg"
        >
          <div className="flex flex-col flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleAutoResize(e);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full min-h-[40px] max-h-[200px] bg-transparent px-3 py-2 text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none text-sm"
              disabled={isLoading}
              rows={1}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 flex-shrink-0 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <ArrowUp size={16} className="text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
