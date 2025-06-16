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
  pastedContentView,
  currentCitations,
  activeCitation,
  onPastedContentClick,
  onClosePastedContent,
  onCitationClick,
}) {
  const { data: session } = useSession();
  const [regeneratingMessageId, setRegeneratingMessageId] = useState(null);

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

        // Generate title considering both message content and pasted content
        generateChatTitle(newChat.chatId, {
          messageContent: messageContent,
          pastedContent: pastedContent,
        });
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

  const handleRegenerate = async (aiMessage) => {
    try {
      // Find the user message that preceded this AI message
      const messageIndex = messages.findIndex((msg) => msg.id === aiMessage.id);
      if (messageIndex <= 0) return; // No previous message or this is the first message

      const userMessage = messages[messageIndex - 1];
      if (userMessage.role !== "user") return; // Previous message is not from user

      console.log("Starting regeneration for message:", {
        aiMessageId: aiMessage.id,
        aiMessageRole: aiMessage.role,
        userMessageId: userMessage.id,
        chatId: activeChatId,
      });

      setRegeneratingMessageId(aiMessage.id);
      setIsLoading(true);

      // Delete the old AI response from the database first
      try {
        console.log("Attempting to delete message:", aiMessage.id);
        const deleteResponse = await fetch(
          `/api/chats/${activeChatId}/messages/${aiMessage.id}`,
          {
            method: "DELETE",
          },
        );

        const deleteResult = await deleteResponse.json();
        console.log("Delete response:", {
          status: deleteResponse.status,
          ok: deleteResponse.ok,
          result: deleteResult,
        });

        if (!deleteResponse.ok) {
          console.error("Failed to delete old AI message from database:", {
            status: deleteResponse.status,
            error: deleteResult.error,
            details: deleteResult.details,
          });
          // Continue anyway, but log the error
        } else {
          console.log(
            "Successfully deleted old AI message from database:",
            deleteResult,
          );
        }
      } catch (deleteError) {
        console.error("Error deleting old AI message:", deleteError);
        // Continue anyway
      }

      // Remove the current AI response from UI
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessage.id));

      // Resend the user message using Ably
      console.log("Resending user message via Ably:", userMessage.id);
      const success = await ably.sendMessage(userMessage, activeChatId);
      if (!success) {
        console.error("Failed to regenerate response");
        setIsLoading(false);
        setRegeneratingMessageId(null);
        // Re-add the AI message back if regeneration failed
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        console.log("Successfully initiated regeneration via Ably");
        // Clear the regenerating state when successful
        setRegeneratingMessageId(null);
      }
    } catch (error) {
      console.error("Error regenerating response:", error);
      setIsLoading(false);
      setRegeneratingMessageId(null);
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
              onPastedContentClick={onPastedContentClick}
              onCitationClick={onCitationClick}
              isInSplitView={!!pastedContentView}
              onRegenerate={handleRegenerate}
              isRegenerating={regeneratingMessageId}
              isPastedContentOpen={!!pastedContentView}
              currentPastedContent={pastedContentView}
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
          citations={currentCitations}
          activeCitation={activeCitation}
          onClose={onClosePastedContent}
        />
      )}
    </div>
  );
}
