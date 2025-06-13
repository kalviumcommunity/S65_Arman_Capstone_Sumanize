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

  const handleSendMessage = async (messageData) => {
    const messageContent =
      typeof messageData === "string" ? messageData : messageData.content;
    const pastedContent =
      typeof messageData === "object" ? messageData.pastedContent : null;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent || "",
      pastedContent: pastedContent,
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

        const titleSource = messageContent || pastedContent || "New Chat";
        generateChatTitle(newChat.chatId, titleSource);
      } else {
        setMessages((prev) => [...prev, userMessage]);
      }

      const saveResponse = await fetch(`/api/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userMessage.role,
          content: userMessage.content,
          pastedContent: userMessage.pastedContent,
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
      <div className="flex-1 flex items-center justify-center p-2">
        <EmptyState
          isNewChatPending={isNewChatPending}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  const showEmptyState = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader title={chatTitle} isNewChatPending={isNewChatPending} />

      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {showEmptyState ? (
            <EmptyState
              isNewChatPending={isNewChatPending}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>

        <div className="px-0 py-4">
          {" "}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
