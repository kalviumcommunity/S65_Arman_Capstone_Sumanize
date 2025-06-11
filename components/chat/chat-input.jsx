import { useState } from "react";

export function ChatInput({
  onSendMessage,
  isLoading,
  isNewChatPending,
  createNewChat,
  generateChatTitle,
  setMessages,
  messages,
  ws,
}) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    if (messageContent.length > 4000) {
      alert("Message too long. Please keep it under 4000 characters.");
      return;
    }

    const userMessage = {
      role: "user",
      content: messageContent,
    };

    setInput("");

    // If this is a pending new chat, create the chat first
    let currentChatId = await onSendMessage(userMessage, messageContent);

    if (!currentChatId) {
      setInput(messageContent); // Restore input on failure
      return;
    }

    // Generate title for new chats (when this is the first user message)
    const isFirstMessage = messages.length === 0;

    if (isFirstMessage) {
      setTimeout(() => {
        generateChatTitle(currentChatId, messageContent);
      }, 500);
    }

    // Send via WebSocket
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
        console.log(`📤 Message sent via WebSocket for chat ${currentChatId}`);
      } catch (sendError) {
        console.error("❌ Failed to send message via WebSocket:", sendError);
      }
    }
  };

  return (
    <footer className="bg-neutral-800 p-4 border-t border-neutral-700">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isNewChatPending
                ? "Type your first message to start a new chat..."
                : "Type your message..."
            }
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </footer>
  );
}
