import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

export function ChatContainer({
  chats,
  activeChatId,
  isNewChatPending,
  messages,
  setMessages,
  messagesEndRef,
  createNewChat,
  generateChatTitle,
  ws,
  isLoading,
  setIsLoading,
  isAuthenticated,
}) {
  const activeChat = chats.find((chat) => chat.chatId === activeChatId);
  const chatTitle = activeChat?.title;

  const handleSendMessage = async (userMessage, messageContent) => {
    if (!isAuthenticated) {
      const totalUserMessages = chats.reduce((acc, chat) => {
        const userMessages =
          chat.messages?.filter((msg) => msg.role === "user").length || 0;
        return acc + userMessages;
      }, 0);

      if (totalUserMessages >= 5) {
        alert(
          "You have reached your message limit. Please sign in to continue.",
        );
        return null;
      }
    }
    setIsLoading(true);

    let currentChatId = activeChatId;
    if (isNewChatPending) {
      currentChatId = await createNewChat();
      if (!currentChatId) {
        setIsLoading(false);
        alert("Failed to create new chat. Please try again.");
        return null;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`/api/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userMessage),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);

      return currentChatId;
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);

      if (error.name === "AbortError") {
        alert("Request timed out. Please try again.");
      } else {
        alert("Failed to send message. Please try again.");
      }
      return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <ChatHeader title={chatTitle} isNewChatPending={isNewChatPending} />

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        isNewChatPending={isNewChatPending}
        messagesEndRef={messagesEndRef}
      />

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isNewChatPending={isNewChatPending}
        createNewChat={createNewChat}
        generateChatTitle={generateChatTitle}
        setMessages={setMessages}
        messages={messages}
        ws={ws}
      />
    </div>
  );
}
