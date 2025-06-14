import { useState } from "react";
import { useSession } from "next-auth/react";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { EmptyState } from "./empty-state";
import { PastedContentPanel } from "./pasted-content-panel";

export function ChatContainer({
  chats,
  setChats,
  activeChatId,
  setActiveChatId,
  isNewChatPending,
  setIsNewChatPending,
  messages,
  setMessages,
  setMessagesWithoutReload,
  messagesEndRef,
  createNewChatInBackend,
  generateChatTitle,
  ably,
  isLoading,
  setIsLoading,
  isAuthenticated,
}) {
  const { data: session } = useSession();
  const [pastedContentView, setPastedContentView] = useState(null);

  const handlePastedContentClick = (content) => {
    setPastedContentView(content);
  };

  const handleClosePastedContent = () => {
    setPastedContentView(null);
  };

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
    let messageSavedToDatabase = false;

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

        // Use setMessagesWithoutReload to prevent useMessages from overwriting this
        console.log("Setting initial message for new chat:", userMessage.id);
        setMessagesWithoutReload([userMessage]);

        const titleSource = messageContent || pastedContent || "New Chat";
        generateChatTitle(newChat.chatId, titleSource);
      } else {
        console.log("Adding message to existing chat:", userMessage.id);
        setMessages((prev) => [...prev, userMessage]);
      }

      console.log("About to save message:", {
        chatId: currentChatId,
        role: userMessage.role,
        content: userMessage.content?.substring(0, 100) + "...",
        pastedContentLength: userMessage.pastedContent?.length || 0,
        hasPastedContent: !!userMessage.pastedContent,
      });

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
        const errorData = await saveResponse.json();
        console.error("Save response error:", errorData);

        // Handle validation errors more gracefully
        let errorMessage = errorData.error || "Unknown error";
        if (errorData.details) {
          if (Array.isArray(errorData.details)) {
            errorMessage +=
              " - " + errorData.details.map((d) => d.message || d).join(", ");
          } else {
            errorMessage += " - " + errorData.details;
          }
        }

        throw new Error(`Failed to save message: ${errorMessage}`);
      }

      messageSavedToDatabase = true;
      console.log("Message saved successfully to database");

      const success = await ably.sendMessage(userMessage, currentChatId);
      if (!success) {
        console.error(
          "Failed to send message to AI, but message was saved to database",
        );
        setIsLoading(false);
        // Don't remove the message since it was saved to database
        return;
      }
    } catch (error) {
      console.error("An error occurred during message sending:", error);

      // Only remove the message from UI if it failed to save to database
      if (!messageSavedToDatabase) {
        console.log(
          "Removing message from UI since it failed to save to database",
        );
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } else {
        console.log(
          "Keeping message in UI since it was saved to database successfully",
        );
      }

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
    <div className="flex-1 flex min-w-0">
      {/* Main chat area */}
      <div
        className={`flex flex-col min-w-0 transition-all duration-300 ${pastedContentView ? "w-1/2" : "w-full"}`}
      >
        <ChatHeader title={chatTitle} isNewChatPending={isNewChatPending} />

        <div
          className={`flex-1 flex flex-col min-h-0 ${pastedContentView ? "w-full" : "w-full max-w-5xl mx-auto"}`}
        >
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
              onPastedContentClick={handlePastedContentClick}
              isInSplitView={!!pastedContentView}
            />
          )}

          <div className="px-0 py-0">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isInSplitView={!!pastedContentView}
            />
          </div>
        </div>
      </div>

      {/* Pasted content panel */}
      {pastedContentView && (
        <PastedContentPanel
          content={pastedContentView}
          onClose={handleClosePastedContent}
        />
      )}
    </div>
  );
}
