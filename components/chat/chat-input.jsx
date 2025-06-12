import { useState, useRef } from "react";
import { ArrowUp, Globe, Paperclip, CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ChatInput({
  onSendMessage,
  isLoading,
  isNewChatPending,
  generateChatTitle,
  messages,
  ably,
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    if (messageContent.length > 15000) {
      alert("Message too long. Please keep it under 15000 characters.");
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const currentChatId = await onSendMessage(userMessage, messageContent);
    if (!currentChatId) {
      setInput(messageContent);
      return;
    }

    const isFirstMessage = messages.length === 0;
    if (isFirstMessage) {
      setTimeout(() => {
        generateChatTitle(currentChatId, messageContent);
      }, 500);
    }

    // Send message through Ably
    const success = await ably.sendMessage(userMessage, currentChatId);
    if (!success) {
      console.error("Failed to send message");
      // Optionally show user feedback here
    }
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
          // This is the main container rectangle
          className="flex items-end gap-3 rounded-xl bg-neutral-900 border-4 border-neutral-800 p-3 shadow-lg"
        >
          {/* Left side container for textarea and controls */}
          <div className="flex flex-col flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleAutoResize(e);
              }}
              onKeyDown={handleKeyPress}
              placeholder={
                isNewChatPending
                  ? "Start a new conversation..."
                  : "Type your message here..."
              }
              className="w-full min-h-[40px] max-h-[200px] bg-transparent px-3 py-2 text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none text-sm"
              disabled={isLoading}
              rows={1}
            />
          </div>
          {/* Submit Button (now inside the main container) */}
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
