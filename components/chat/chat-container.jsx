import { useSession } from "next-auth/react";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { EmptyState } from "./empty-state";

export function ChatContainer({
  chats,
  activeChatId,
  isNewChatPending,
  messages,
  setMessages,
  messagesEndRef,
  createNewChat,
  generateChatTitle,
  ably,
  isLoading,
  setIsLoading,
  isAuthenticated,
}) {
  const { data: session } = useSession();

  const handleSendMessage = async (userMessage, messageContent) => {
    try {
      let chatId = activeChatId;

      if (isNewChatPending) {
        const newChatId = await createNewChat();
        if (!newChatId) {
          console.error("Failed to create new chat");
          return null;
        }
        chatId = newChatId;
      }

      setMessages((prev) => [...prev, userMessage]);

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userMessage.role,
          content: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      return chatId;
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg !== userMessage));
      return null;
    }
  };

  const activeChat = chats.find((chat) => chat.chatId === activeChatId);
  const chatTitle = isNewChatPending ? "New Chat" : activeChat?.title || "Chat";

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-300">
            Welcome to Sumanize
          </h2>
          <p className="text-neutral-400">
            Please sign in to start chatting with the AI assistant.
          </p>
        </div>
      </div>
    );
  }

  const showEmptyState = !activeChatId || (messages.length === 0 && !isLoading);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader title={chatTitle} isNewChatPending={isNewChatPending} />

      <div className="flex-1 flex flex-col min-h-0">
        {showEmptyState ? (
          <EmptyState isNewChatPending={isNewChatPending} />
        ) : (
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            isNewChatPending={isNewChatPending}
            messagesEndRef={messagesEndRef}
          />
        )}

        <div className="p-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isNewChatPending={isNewChatPending}
            generateChatTitle={generateChatTitle}
            messages={messages}
            ably={ably}
          />
        </div>
      </div>
    </div>
  );
}
