import { useSession } from "next-auth/react";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { EmptyState } from "./empty-state";

export function ChatContainer({
  chats,
  setChats,
  activeChatId,
  setActiveChatId,
  isNewChatPending,
  setIsNewChatPending,
  messages,
  setMessages,
  messagesEndRef,
  createNewChatInBackend,
  generateChatTitle,
  ably,
  isLoading,
  setIsLoading,
  isAuthenticated,
}) {
  const { data: session } = useSession();

  const handleSendMessage = async (messageContent) => {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      completed: true,
    };

    let currentChatId = activeChatId;

    try {
      if (isNewChatPending) {
        const newChat = await createNewChatInBackend();
        if (!newChat) {
          throw new Error("Failed to create a new chat session.");
        }
        currentChatId = newChat.chatId;

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.chatId);
        setIsNewChatPending(false);
        setMessages([userMessage]);

        generateChatTitle(newChat.chatId, messageContent);
      } else {
        setMessages((prev) => [...prev, userMessage]);
      }

      const saveResponse = await fetch(`/api/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userMessage.role,
          content: userMessage.content,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save message to the database.");
      }

      const success = await ably.sendMessage(userMessage, currentChatId);
      if (!success) {
        throw new Error("Failed to send message to the AI for processing.");
      }
    } catch (error) {
      console.error("An error occurred during message sending:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      setIsLoading(false);
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

  const showEmptyState = messages.length === 0 && !isLoading;

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
            messagesEndRef={messagesEndRef}
          />
        )}

        <div className="p-4">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
