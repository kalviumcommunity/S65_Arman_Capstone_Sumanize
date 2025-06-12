import { useState, useRef } from "react";
import { ArrowLineUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ChatInput({
  onSendMessage,
  isLoading,
  isNewChatPending,
  generateChatTitle,
  messages,
  ws,
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

    const userMessage = { role: "user", content: messageContent };
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

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(
          JSON.stringify({
            type: "message",
            content: userMessage.content,
            chatId: currentChatId,
            timestamp: Date.now(),
          }),
        );
      } catch (sendError) {
        console.error("Failed to send message via WebSocket:", sendError);
      }
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
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  return (
    <div className="p-4 mb-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="rounded-2xl border-6 border-neutral-800/50 bg-neutral-900/70 p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onInput={handleAutoResize}
              placeholder={
                isNewChatPending
                  ? "Type your first message to start a new chat..."
                  : "Type your message here..."
              }
              disabled={isLoading}
              rows={1}
              className="w-full resize-none border-none bg-transparent p-2 leading-6 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ minHeight: "28px", maxHeight: "180px" }}
            />
            <div className="mt-2 flex items-center justify-end">
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-9 w-9 rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-800/70 disabled:bg-neutral-700 disabled:opacity-60"
              >
                <ArrowLineUp className="h-5 w-5" />
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
